'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {AppLayout} from '@/components/AppLayout';
import {PageHeader} from '@/components/PageHeader';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Send,
  Sparkles,
  History,
  Plus,
  MessageCircle,
  Bot,
  User,
  AlertCircle,
  Trash2,
  Loader2,
} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useAuthContext} from '@/contexts/AuthContext';
import {useWebSocket} from '@/hooks/useWebSocket';
import {useCoachingSessions, CoachingSession, CoachingEvent} from '@/hooks/useCoachingSessions';
import {WS_URL} from '@/lib/config';

const QUICK_PROMPTS = [
  'Tell me about a time I showed ownership',
  'What stories demonstrate my leadership?',
  'Help me practice the STAR method',
  'Give me a mock behavioral interview',
];

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  createdAt: string;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
  }
}

interface SessionItemProps {
  session: CoachingSession;
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

function SessionItem({session, isActive, onClick, onDelete}: SessionItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive && 'bg-muted',
      )}
    >
      <MessageCircle className='h-4 w-4 shrink-0 text-muted-foreground' />
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{session.title || 'Untitled session'}</p>
        <p className='text-xs text-muted-foreground'>{formatRelativeDate(session.updatedAt)}</p>
      </div>
      {onDelete && (
        <button
          type='button'
          onClick={handleDelete}
          className='shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100'
        >
          <Trash2 className='h-3 w-3 text-destructive' />
          <span className='sr-only'>Delete session</span>
        </button>
      )}
    </div>
  );
}

interface SessionListProps {
  sessions: CoachingSession[];
  activeSessionId?: string | null;
  onSessionClick?: (session: CoachingSession) => void;
  onSessionDelete?: (sessionId: string) => void;
  isLoading?: boolean;
}

function SessionList({
  sessions,
  activeSessionId,
  onSessionClick,
  onSessionDelete,
  isLoading,
}: SessionListProps) {
  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className='py-8 text-center'>
        <MessageCircle className='mx-auto h-8 w-8 text-muted-foreground/50' />
        <p className='mt-2 text-sm text-muted-foreground'>No sessions yet</p>
      </div>
    );
  }

  return (
    <div className='space-y-1'>
      {sessions.map(session => (
        <SessionItem
          key={session.id}
          session={session}
          isActive={activeSessionId === session.id}
          onClick={() => onSessionClick?.(session)}
          onDelete={() => onSessionDelete?.(session.id)}
        />
      ))}
    </div>
  );
}

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

export default function CoachPage() {
  const {user} = useAuthContext();
  const {data: sessions = [], isLoading: isLoadingSessions, deleteSession} = useCoachingSessions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const wsUrl = activeSessionId
    ? `${WS_URL}/ws/coach?coachingId=${activeSessionId}`
    : `${WS_URL}/ws/coach`;

  const {isConnected, send} = useWebSocket(
    {
      url: wsUrl,
      enabled: !!user,
    },
    {
      onResponse: message => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: message.data.content,
            createdAt: new Date().toISOString(),
          },
        ]);
        setIsLoading(false);
      },
      onError: message => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'error',
            content: message.error,
            createdAt: new Date().toISOString(),
          },
        ]);
        setIsLoading(false);
      },
      onConnectionError: () => {
        setIsLoading(false);
      },
      onConnected: connectedMessage => {
        const session = (connectedMessage as unknown as {coaching: CoachingSession}).coaching;
        console.log('Connected to coaching session: ', session);
        if (session?.events) {
          setMessages(
            session.events.map((msg: CoachingEvent) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt,
            })),
          );
        }
      },
    },
  );

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
      createdAt: new Date().toISOString(),
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

  const handleNewChat = () => {
    setMessages([]);
    setActiveSessionId(null);
  };

  const handleSessionClick = (session: CoachingSession) => {
    if (session.id === activeSessionId) return;
    setMessages([]);
    setActiveSessionId(session.id);
    setIsHistoryOpen(false);
  };

  const handleDeleteClick = (sessionId: string) => {
    setDeleteConfirmId(sessionId);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteSession(deleteConfirmId);
      if (activeSessionId === deleteConfirmId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      setDeleteConfirmId(null);
    }
  };

  return (
    <AppLayout>
      <div className='flex h-full flex-col overflow-hidden'>
        <div className='flex shrink-0 items-start justify-between'>
          <PageHeader
            title='Career Coach'
            description='Practice interviews and explore your stories with AI assistance.'
          />
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' onClick={handleNewChat}>
              <Plus className='mr-2 h-4 w-4' />
              New Chat
            </Button>
            {/* Mobile-only history button */}
            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <SheetTrigger asChild>
                <Button variant='outline' size='icon' className='h-9 w-9 lg:hidden'>
                  <History className='h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-80'>
                <SheetHeader>
                  <SheetTitle>Chat History</SheetTitle>
                  <SheetDescription>Your previous coaching sessions</SheetDescription>
                </SheetHeader>
                <div className='mt-4'>
                  <SessionList
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSessionClick={handleSessionClick}
                    onSessionDelete={handleDeleteClick}
                    isLoading={isLoadingSessions}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className='mt-6 grid min-h-0 flex-1 grid-cols-1 gap-6 pb-6 lg:grid-cols-3'>
          {/* Chat area - takes 2 columns on desktop */}
          <Card className='flex min-h-0 flex-col py-0 lg:col-span-2'>
            {/* Header with connection status */}
            <div className='flex shrink-0 items-center justify-end border-b px-4 py-2'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isConnected ? 'bg-green-500' : 'bg-muted-foreground/50',
                  )}
                />
                <span className='text-xs text-muted-foreground'>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {/* Messages area */}
            <div className='flex min-h-0 flex-1 flex-col overflow-auto p-4'>
              {messages.length === 0 && !isLoading ? (
                <div className='flex flex-1 flex-col items-center justify-center text-center'>
                  <div className='rounded-full bg-primary/10 p-4'>
                    <Sparkles className='h-8 w-8 text-primary' />
                  </div>
                  <h3 className='mt-4 text-lg font-semibold'>Your AI Career Coach</h3>
                  <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                    Ask me anything about your career stories, practice behavioral interviews, or
                    get help preparing answers using the STAR method.
                  </p>

                  <div className='mt-6 flex flex-wrap justify-center gap-2'>
                    {QUICK_PROMPTS.map(prompt => (
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

            {/* Input area */}
            <form onSubmit={handleSubmit} className='shrink-0 border-t p-4'>
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
                  placeholder='Ask me about your stories or practice an interview question...'
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

          {/* Thread history - hidden on mobile, visible on desktop */}
          <Card className='hidden min-h-0 flex-col lg:flex'>
            <CardHeader className='shrink-0'>
              <CardTitle className='text-base'>Chat History</CardTitle>
              <CardDescription>Your previous sessions</CardDescription>
            </CardHeader>
            <CardContent className='min-h-0 flex-1 overflow-auto'>
              <SessionList
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSessionClick={handleSessionClick}
                onSessionDelete={handleDeleteClick}
                isLoading={isLoadingSessions}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!deleteConfirmId} onOpenChange={open => !open && setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
