import {User, Bot, AlertCircle} from 'lucide-react';
import Markdown from 'react-markdown';
import {cn} from '@/lib/utils';

export interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  assistantIcon?: React.ReactNode;
}

export function MessageBubble({message, assistantIcon}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md shadow-sm',
          isUser && 'bg-primary text-primary-foreground shadow-primary/20',
          isError && 'bg-destructive/10 text-destructive',
          !isUser && !isError && 'border border-border/70 bg-card text-primary',
        )}
      >
        {isUser ? (
          <User className='h-4 w-4' />
        ) : isError ? (
          <AlertCircle className='h-4 w-4' />
        ) : (
          assistantIcon ?? <Bot className='h-4 w-4' />
        )}
      </div>
      <div
        className={cn(
          'max-w-[82%] rounded-md px-3.5 py-2.5 text-sm leading-6 shadow-sm',
          isUser && 'whitespace-pre-wrap bg-primary text-primary-foreground shadow-[3px_3px_0_oklch(0.17_0.023_248_/_0.14)]',
          isError && 'whitespace-pre-wrap border border-destructive/20 bg-destructive/10 text-destructive',
          isAssistant &&
            'prose prose-sm prose-neutral max-w-none border border-border/70 bg-card/92 dark:prose-invert',
        )}
      >
        {isAssistant ? (
          <Markdown
            components={{
              p: ({children}) => <p className='mb-2 last:mb-0'>{children}</p>,
              ul: ({children}) => <ul className='mb-2 ml-4 list-disc last:mb-0'>{children}</ul>,
              ol: ({children}) => <ol className='mb-2 ml-4 list-decimal last:mb-0'>{children}</ol>,
              li: ({children}) => <li className='mb-1'>{children}</li>,
              strong: ({children}) => <strong className='font-semibold'>{children}</strong>,
              a: ({href, children}) => (
                <a href={href} target='_blank' rel='noopener noreferrer' className='text-primary underline'>
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </Markdown>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}
