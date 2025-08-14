import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { z } from 'zod';
import TextareaAutosize from 'react-textarea-autosize';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { useTRPC } from '@/trpc/client';

interface Props {
  projectId: string;
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: 'Value is required' })
    .max(10000, { message: 'Value is too long' }),
});

export const MessageForm = ({ projectId }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  });

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId })
        );
      },
      //     TODO: Invalidate usage status
      onError: (err) => {
        // TODO: Redirect to pricing page if specific error...
        toast.error(err.message);
      },
    })
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  const isPending = createMessage.isPending;
  const isDisabled = isPending || !form.formState.isValid;
  const showUsage = false;
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'relative border p-4 pt-1 bg-sidebar dark:bg-sidebar rounded-xl transition-all ',
          isFocused && 'shadow-xs',
          showUsage && 'rounded-t-none'
        )}
      >
        <FormField
          name="value"
          render={({ field }) => (
            <TextareaAutosize
              {...field}
              disabled={isPending}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className={
                'pt-4 resize-none border-none w-full outline-none bg-transparent '
              }
              placeholder={'What would you like to build'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
          control={form.control}
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd
              className={
                'ml-auto pointer-events-noen inline-flex h-5 select-none items-center bg-muted px-1.5 font-mono font-medium text-muted-foreground border gap-1 text-[10px] '
              }
            >
              <span>&#8984;</span> Enter
            </kbd>
            &nbsp; to submit
          </div>
          <Button
            disabled={isDisabled}
            className={cn(
              'size-8 rounded-full',
              isDisabled && 'bg-muted-foreground border'
            )}
          >
            {isPending ? (
              <Loader2Icon className={'size-4 animate-spin'} />
            ) : (
              <ArrowUpIcon />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
