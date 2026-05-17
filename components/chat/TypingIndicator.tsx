import {ReactNode} from 'react';
import {Bot} from 'lucide-react';

interface TypingIndicatorProps {
  icon?: ReactNode;
}

export function TypingIndicator({icon}: TypingIndicatorProps) {
  return (
    <div className='flex gap-3'>
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-card text-primary'>
        {icon ?? <Bot className='h-4 w-4' />}
      </div>
      <div className='flex items-center gap-1 rounded-md border border-border/70 bg-card/90 px-3 py-2 shadow-sm'>
        <span className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]' />
        <span className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]' />
        <span className='h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50' />
      </div>
    </div>
  );
}
