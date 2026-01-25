'use client';

import {use, useState, useRef, useEffect, useCallback} from 'react';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
  Send,
  Bot,
  User,
  Briefcase,
  Sparkles,
  Loader2,
  Github,
  Linkedin,
  Twitter,
  Globe,
} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useWebSocket} from '@/hooks/useWebSocket';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatEvent {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface BioSession {
  events?: ChatEvent[];
}

interface PublicExperience {
  id: string;
  organization: string;
  title: string;
  startDate: string;
  endDate: string | null;
}

interface PublicProfile {
  id: string;
  name: string;
  username: string | null;
  title: string | null;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
  experiences: PublicExperience[];
}

const QUICK_PROMPTS = [
  'Tell me about yourself',
  'What are your strengths?',
  'What was your most challenging project?',
  'What makes you a great fit for my team?',
];

async function fetchPublicProfile(identifier: string): Promise<PublicProfile> {
  const response = await fetch(`/api/profile/public/${identifier}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Profile not found'}));
    throw new Error(error.message || 'Profile not found');
  }

  return response.json();
}

function MessageBubble({message}: {message: Message}) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {isUser ? <User className='h-4 w-4' /> : <Bot className='h-4 w-4' />}
      </div>
      <div
        className={cn(
          'max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short'});
  const end = endDate
    ? new Date(endDate).toLocaleDateString('en-US', {year: 'numeric', month: 'short'})
    : 'Present';
  return `${start} - ${end}`;
}

interface PublicProfilePageProps {
  params: Promise<{identifier: string}>;
}

export default function PublicProfilePage({params}: PublicProfilePageProps) {
  const {identifier} = use(params);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['publicProfile', identifier],
    queryFn: () => fetchPublicProfile(identifier),
  });

  const {isConnected, send} = useWebSocket(
    {
      url: `${WS_URL}/ws/bio/${identifier}`,
      enabled: !!profile,
    },
    {
      onResponse: message => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: message.data.content,
          },
        ]);
        setIsTyping(false);
      },
      onError: message => {
        console.error('WebSocket error:', message.error);
        setIsTyping(false);
      },
      onConnectionError: () => {
        console.error('WebSocket connection error');
        setIsTyping(false);
      },
      onConnected: connectedMessage => {
        const session = (connectedMessage as unknown as {data: BioSession}).data;
        if (session?.events) {
          setMessages(
            session.events.map((msg: ChatEvent) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
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

    if (!input.trim() || isTyping || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    send(input.trim());
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
        <h1 className='text-2xl font-semibold'>Profile not found</h1>
        <p className='mt-2 text-muted-foreground'>
          The profile you&apos;re looking for doesn&apos;t exist or is not public.
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b'>
        <div className='mx-auto flex h-16 max-w-6xl items-center px-4'>
          <Link href='/' className='cursor-pointer text-xl font-semibold transition-opacity hover:opacity-80'>
            HireMe.dev
          </Link>
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-4 py-8'>
        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Profile Section */}
          <div className='space-y-6'>
            {/* Profile Card */}
            <Card>
              <CardContent className='pt-6'>
                <div className='flex flex-col items-center text-center'>
                  <div className='flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary'>
                    {getInitials(profile.name)}
                  </div>
                  <h1 className='mt-4 text-xl font-semibold'>{profile.name}</h1>
                  {profile.title && <p className='text-muted-foreground'>{profile.title}</p>}
                  {profile.bio && (
                    <p className='mt-3 text-sm text-muted-foreground'>{profile.bio}</p>
                  )}

                  {/* Social Links */}
                  {(profile.githubUrl ||
                    profile.linkedinUrl ||
                    profile.twitterUrl ||
                    profile.websiteUrl) && (
                    <div className='mt-4 flex gap-3'>
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-muted-foreground transition-colors hover:text-foreground'
                        >
                          <Github className='h-5 w-5' />
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-muted-foreground transition-colors hover:text-foreground'
                        >
                          <Linkedin className='h-5 w-5' />
                        </a>
                      )}
                      {profile.twitterUrl && (
                        <a
                          href={profile.twitterUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-muted-foreground transition-colors hover:text-foreground'
                        >
                          <Twitter className='h-5 w-5' />
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a
                          href={profile.websiteUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-muted-foreground transition-colors hover:text-foreground'
                        >
                          <Globe className='h-5 w-5' />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Experience Card */}
            {profile.experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Experience</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {profile.experiences.map(exp => (
                    <div key={exp.id} className='flex gap-3'>
                      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted'>
                        <Briefcase className='h-4 w-4' />
                      </div>
                      <div>
                        <p className='font-medium'>{exp.title}</p>
                        <p className='text-sm text-muted-foreground'>{exp.organization}</p>
                        <p className='text-xs text-muted-foreground'>
                          {formatDateRange(exp.startDate, exp.endDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat Section */}
          <Card className='flex min-h-150 flex-col py-0 lg:col-span-2'>
            <div className='flex shrink-0 items-center justify-between border-b px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-primary' />
                <div>
                  <h2 className='font-medium'>Let&apos;s chat</h2>
                  <p className='text-xs text-muted-foreground'>
                    Powered by AI, trained on my experiences
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isConnected ? 'bg-green-500' : 'bg-muted-foreground',
                  )}
                />
                <span className='text-xs text-muted-foreground'>
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>

            <div className='flex min-h-0 flex-1 flex-col overflow-auto p-4'>
              {messages.length === 0 && !isTyping ? (
                <div className='flex flex-1 flex-col items-center justify-center text-center'>
                  <div className='rounded-full bg-primary/10 p-4'>
                    <Bot className='h-8 w-8 text-primary' />
                  </div>
                  <h3 className='mt-4 text-lg font-semibold'>Ask me anything about my career</h3>
                  <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                    Curious about my experience, projects, or skills? Go ahead and ask - I&apos;d
                    love to tell you more about my journey.
                  </p>

                  <div className='mt-6 flex flex-wrap justify-center gap-2'>
                    {QUICK_PROMPTS.map(prompt => (
                      <button
                        key={prompt}
                        type='button'
                        onClick={() => handlePromptClick(prompt)}
                        disabled={!isConnected}
                        className='cursor-pointer rounded-full border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
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
                  {isTyping && (
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
                  placeholder={isConnected ? 'Ask me anything...' : 'Connecting...'}
                  disabled={isTyping || !isConnected}
                  rows={1}
                  className='min-h-10 max-h-32 resize-none'
                />
                <Button
                  type='submit'
                  size='icon'
                  disabled={!input.trim() || isTyping || !isConnected}
                >
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
