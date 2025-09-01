import { z } from 'zod';
import { inngest } from './client';
import {
  createAgent,
  createNetwork,
  createState,
  createTool,
  type Message,
  openai,
  type Tool,
} from '@inngest/agent-kit';
import { Sandbox } from '@e2b/code-interpreter';
import {
  getSandbox,
  lastAssistantTextMessageContent,
  parseOutput,
} from './utils';
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from '@//prompt';
import { prisma as db } from '@/lib/db';
import { MessageRole, MessageType } from '@/generated/prisma';
interface AgentState {
  summary: string;
  files: {
    [path: string]: string;
  };
}

export const codeAgentFunction = inngest.createFunction(
  { id: 'code-agent' },
  { event: 'code-agent/run' },
  async ({ event, step }) => {
    const currentPlan = event.data.plan;
    const sandboxId = await step.run('get-sandbox-id', async () => {
      const sandbox = await Sandbox.create('pulpable-nextjs-dev');
      await sandbox.setTimeout(
        currentPlan === 'pro' ? 1000 * 60 * 10 : 1000 * 60 * 5
      );
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run(
      'get-previous-message',
      async () => {
        const formattedMessage: Message[] = [];

        const messages = await db.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        });

        for (const message of messages) {
          formattedMessage.push({
            type: 'text',
            role: message.role === MessageRole.ASSISTANT ? 'assistant' : 'user',
            content: JSON.stringify({
              content: message.content,
              timeStamp: message.createdAt,
            }),
          });
        }

        const mostRecentFragment = await db.fragment.findFirst({
          where: {
            message: {
              projectId: event.data.projectId,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            message: true,
          },
        });

        formattedMessage.unshift({
          type: 'text',
          role: 'user',
          content: JSON.stringify({
            label: 'Final File Edits',
            files: mostRecentFragment?.files,
          }),
        });

        return formattedMessage;
      }
    );

    const state = createState<AgentState>(
      {
        summary: '',
        files: {},
      },
      {
        messages: previousMessages,
      }
    );
    // Create a new agent with a system prompt (you can add optional tools, too)
    // const result = await step.run("generating-code", async () => {
    const codeAgent = createAgent<AgentState>({
      name: 'code-agent',
      description:
        'a senior software engineer working in a sandboxed Next.js 15.3.4 environment',
      system: PROMPT,
      model: openai({
        model: 'gpt-4.1',
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: 'terminal',
          description: 'Use the terminal to run commands',
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            const buffers = { stdout: '', stderr: '' };
            try {
              const result = await step?.run(
                'Running Terminal Command',
                async () => {
                  const sandbox = await getSandbox(sandboxId);
                  return await sandbox.commands.run(command, {
                    onStdout: (data: string) => {
                      buffers.stdout += data;
                    },
                    onStderr: (data: string) => {
                      buffers.stderr += data;
                    },
                  });
                }
              );

              if (result) return result.stdout;

              return 'Nothing here';
            } catch (err) {
              console.log(
                `Command failed: ${err} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
              );
              return `Command failed: ${err} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
            }
          },
        }),
        createTool({
          name: 'createOrUpdateFiles',
          description: 'Create or update files in the sandbox',
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { network, step }: Tool.Options<AgentState>
          ) => {
            try {
              const updatedFiles = await step?.run(
                'Writing Files',
                async () => {
                  const updatedFiles = network.state.data.files || {};

                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                }
              );

              if (updatedFiles) {
                network.state.data.files = updatedFiles;
              }

              return 'Files created/updated successfully';
            } catch (e) {
              return 'Error: ' + e;
            }
          },
        }),
        createTool({
          name: 'readFiles',
          description: 'Read files from sandbox',
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            try {
              await step?.run('Reading Files', async () => {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              });
            } catch (err) {
              return 'Error: ' + err;
            }
          },
        }),
      ],

      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes('<task_summary>')) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: 'coding-agent-network',
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }

        return codeAgent;
      },
    });

    // const result = await step.run("run-network", async () => {
    const result = await network.run(event.data.value, { state });

    const fragmentTitleGenerator = createAgent({
      name: 'fragment-title-generator',
      description: 'A fragment title generator',
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: 'gpt-4o',
      }),
    });
    const responseGenerator = createAgent({
      name: 'response-generator',
      description: 'A response generator',
      system: RESPONSE_PROMPT,
      model: openai({
        model: 'gpt-4o',
      }),
    });
    // });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxURL = await step.run('get-sandbox-url', async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run('Saving Results', async () => {
      if (isError) {
        return await db.message.create({
          data: {
            content: 'Something went wrong please try again later',
            role: MessageRole.ASSISTANT,
            type: MessageType.ERROR,
            projectId: event.data.projectId,
            userId: event.data.userId,
          },
        });
      }
      return await db.message.create({
        data: {
          userId: event.data.userId,
          content: parseOutput(responseOutput),
          role: MessageRole.ASSISTANT,
          type: MessageType.RESULT,
          projectId: event.data.projectId,
          fragment: {
            create: {
              sandboxUrl: sandboxURL,
              title: parseOutput(fragmentTitleOutput),
              files: result.state.data.files,
            },
          },
        },
      });
    });
    return {
      url: sandboxURL,
      title: 'Fragment',
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
