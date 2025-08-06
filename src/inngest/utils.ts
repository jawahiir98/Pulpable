import Sandbox from '@e2b/code-interpreter';

export async function getSandbox(sandboxId: string) {
  return await Sandbox.connect(sandboxId);
}
