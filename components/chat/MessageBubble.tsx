import {User, Bot, AlertCircle} from 'lucide-react';
import {cn} from '@/lib/utils';

export interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({message}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser && 'bg-primary text-primary-foreground',
          isError && 'bg-destructive/10 text-destructive',
          !isUser && !isError && 'bg-muted',
        )}
      >
        {isUser ? (
          <User className='h-4 w-4' />
        ) : isError ? (
          <AlertCircle className='h-4 w-4' />
        ) : (
          <Bot className='h-4 w-4' />
        )}
      </div>
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm',
          isUser && 'bg-primary text-primary-foreground',
          isError && 'bg-destructive/10 text-destructive',
          !isUser && !isError && 'bg-muted',
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
