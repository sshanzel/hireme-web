'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Send, Bot, User} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useAuthContext} from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hi! I'm here to help you prepare for interviews. I can help you recall and structure stories from your work experience. What would you like to work on today?",
  },
];

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

function MessageBubble({message}: {message: Message}) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className='h-4 w-4' /> : <Bot className='h-4 w-4' />}
      </div>
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

export function Chat() {
  const {user} = useAuthContext();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`${WS_URL}/ws/story-event?uid=${user.id}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = event => {
      const message = JSON.parse(event.data);
      console.log('Received:', message);

      // TODO: Adjust based on your API response structure
      if (message.data) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: message.data,
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }
    };

    ws.onclose = event => {
      console.log('WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });
      setIsConnected(false);
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
    };

    socketRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user]);

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

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({data: input.trim()}));
    } else {
      // Fallback if WebSocket is not connected
      console.warn('WebSocket not connected');
      setIsLoading(false);
    }
  };

  return (
    <Card className='flex h-full flex-col py-0'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <h3 className='text-sm font-medium'>Interview Coach</h3>
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
      </div>

      <form onSubmit={handleSubmit} className='border-t p-4'>
        <div className='flex gap-2'>
          <Textarea
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
