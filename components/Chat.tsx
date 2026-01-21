'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Send, Bot, User, MessageSquare, AlertCircle} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useAuthContext} from '@/contexts/AuthContext';
import {useWebSocket} from '@/hooks/useWebSocket';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

const STORY_PROMPTS = [
  'I led a project that was behind schedule...',
  'I had to convince my team to try a new approach...',
  'I solved a tricky bug that no one else could figure out...',
  'I had a disagreement with a coworker about...',
];

function MessageBubble({message}: {message: Message}) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser && 'bg-primary text-primary-foreground',
          isError && 'bg-destructive/10 text-destructive',
          !isUser && !isError && 'bg-muted'
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
          !isUser && !isError && 'bg-muted'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

export function Chat() {
  const {user} = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {isConnected, send} = useWebSocket({
    url: `${WS_URL}/ws/story-event?uid=${user?.id}`,
    enabled: !!user,
    onResponse: message => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: message.data.content,
        },
      ]);
      if (message.data.title) {
        setTitle(message.data.title);
      }
      setIsLoading(false);
    },
    onError: message => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'error',
          content: message.error,
        },
      ]);
      setIsLoading(false);
    },
    onConnectionError: () => {
      setIsLoading(false);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (!send(input.trim())) {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleEmptyStateClick = () => {
    inputRef.current?.focus();
  };

  return (
    <Card className='flex h-full flex-col py-0'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <h3 className='text-sm font-medium'>
          {title || 'Tell us a story from your work/project!'}
        </h3>
        <div className='flex items-center gap-2'>
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-muted-foreground/50'
            )}
          />
          <span className='text-xs text-muted-foreground'>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      <div className='flex-1 overflow-y-auto p-4'>
        {messages.length === 0 && !isLoading ? (
          <div
            className='flex h-full cursor-text flex-col items-center justify-center text-center'
            onClick={handleEmptyStateClick}
          >
            <div className='rounded-full bg-muted p-4'>
              <MessageSquare className='h-8 w-8 text-muted-foreground' />
            </div>
            <h4 className='mt-4 font-medium'>Share a work story</h4>
            <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
              Think of a challenge you faced, a win you achieved, or a lesson you learned.
            </p>
            <div className='mt-6 flex flex-wrap justify-center gap-2'>
              {STORY_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  type='button'
                  onClick={() => handlePromptClick(prompt)}
                  className='rounded-full border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-muted'
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
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
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className='border-t p-4'>
        <div className='flex gap-2'>
          <Textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder='Type your message... (Shift+Enter for new line)'
            disabled={isLoading}
            rows={1}
            className='min-h-10 max-h-32 resize-none'
          />
          <Button type='submit' size='icon' disabled={!input.trim() || isLoading}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </form>
    </Card>
  );
}
