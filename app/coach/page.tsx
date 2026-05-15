'use client';

import {useState, useRef, useEffect, useCallback} from 'react';
import {AppLayout} from '@/components/layout/AppLayout';
import {PageHeader} from '@/components/layout/PageHeader';
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
import {ConfirmDialog} from '@/components/common/ConfirmDialog';
import {Send, Sparkles, History, Plus} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useAuthContext} from '@/contexts/AuthContext';
import {useWebSocket} from '@/hooks/useWebSocket';
import {useCoachingSessions, CoachingSession, CoachingEvent} from '@/hooks/useCoachingSessions';
import {WS_URL} from '@/lib/config';
import {MessageBubble} from '@/components/chat/MessageBubble';
import {TypingIndicator} from '@/components/chat/TypingIndicator';
import {SessionList} from '@/components/coaching/SessionList';

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
            eyebrow='Rehearsal room'
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

        <div className='mt-2 grid min-h-0 flex-1 grid-cols-1 gap-5 pb-6 lg:grid-cols-3'>
          {/* Chat area - takes 2 columns on desktop */}
          <Card className='flex min-h-[34rem] flex-col overflow-hidden py-0 lg:col-span-2 lg:min-h-0'>
            {/* Header with connection status */}
            <div className='flex shrink-0 items-center justify-end border-b border-border/70 bg-card/90 px-4 py-3'>
              <div className='flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-2.5 py-1.5'>
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
            <div className='flex min-h-0 flex-1 flex-col overflow-auto bg-gradient-to-b from-secondary/25 via-transparent to-card/60 p-4'>
              {messages.length === 0 && !isLoading ? (
                <div className='flex flex-1 flex-col items-center justify-center text-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 shadow-sm'>
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
                        className='story-chip'
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
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className='shrink-0 border-t border-border/70 bg-card/90 p-4'>
              <div className='flex gap-2 rounded-lg border border-border/70 bg-background/70 p-2 shadow-inner'>
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
                  className='max-h-32 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0'
                />
                <Button type='submit' size='icon' className='self-end' disabled={!input.trim() || isLoading}>
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </form>
          </Card>

          {/* Thread history - hidden on mobile, visible on desktop */}
          <Card className='hidden min-h-0 flex-col overflow-hidden lg:flex'>
            <CardHeader className='shrink-0 border-b border-border/70 bg-card/90'>
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

      <ConfirmDialog
        open={!!deleteConfirmId}
        onOpenChange={open => !open && setDeleteConfirmId(null)}
        title='Delete session'
        description='Are you sure you want to delete this session? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleDeleteConfirm}
        variant='destructive'
      />
    </AppLayout>
  );
}
