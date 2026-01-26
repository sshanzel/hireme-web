import {Bot} from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className='flex gap-3'>
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted'>
        <Bot className='h-4 w-4' />
      </div>
      <div className='flex items-center gap-1 rounded-lg bg-muted px-3 py-2'>
        <span className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]' />
        <span className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]' />
        <span className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50' />
      </div>
    </div>
  );
}
