'use client';

import {use, useState, useRef, useEffect, useCallback} from 'react';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
  Send,
  Briefcase,
  GraduationCap,
  Sparkles,
  Github,
  Linkedin,
  Twitter,
  Globe,
} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useWebSocket} from '@/hooks/useWebSocket';
import {CollapsibleList} from '@/components/common/CollapsibleList';
import {MessageBubble} from '@/components/chat/MessageBubble';
import {TypingIndicator} from '@/components/chat/TypingIndicator';
import {ExperienceModal} from '@/components/experience/ExperienceModal';
import {LoadingSpinner} from '@/components/common/LoadingSpinner';
import {apiFetch, endpoints} from '@/lib/api';
import {WS_URL} from '@/lib/config';
import {getInitials, formatDateRange} from '@/lib/strings/format';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
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
  type: 'work' | 'education';
  organization: string;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
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

const fetchPublicProfile = (identifier: string) =>
  apiFetch<PublicProfile>(endpoints.publicProfile(identifier));

function getHeadline(profile: PublicProfile): string | null {
  if (profile.title) return profile.title;

  if (profile.experiences.length === 0) return null;

  const currentRole = profile.experiences.find(exp => !exp.endDate);
  if (currentRole) return currentRole.title;

  const sorted = [...profile.experiences].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
  return sorted[0].title;
}

interface PublicProfilePageProps {
  params: Promise<{identifier: string}>;
}

export default function PublicProfilePage({params}: PublicProfilePageProps) {
  const {identifier} = use(params);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<PublicExperience | null>(null);
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
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'error',
            content: message.error,
          },
        ]);
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
        <LoadingSpinner size='lg' />
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

  const hasSocials =
    profile.githubUrl || profile.linkedinUrl || profile.twitterUrl || profile.websiteUrl;
  const headline = getHeadline(profile);

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4'>
          <Link
            href='/'
            className='cursor-pointer text-xl font-semibold transition-opacity hover:opacity-80'
          >
            <span className='text-gradient'>HireMe</span>
            <span>.dev</span>
          </Link>
          <Link
            href='/stack'
            className='text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            Tech Stack
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
                  {headline && <p className='text-muted-foreground'>{headline}</p>}
                  {profile.bio && (
                    <p className='mt-3 text-sm text-muted-foreground'>{profile.bio}</p>
                  )}

                  {/* Social Links */}
                  {hasSocials && (
                    <div className='mt-4 flex gap-2'>
                      {profile.githubUrl && (
                        <a
                          href={profile.githubUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
                        >
                          <Github className='h-4 w-4' />
                        </a>
                      )}
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
                        >
                          <Linkedin className='h-4 w-4' />
                        </a>
                      )}
                      {profile.twitterUrl && (
                        <a
                          href={profile.twitterUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
                        >
                          <Twitter className='h-4 w-4' />
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a
                          href={profile.websiteUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
                        >
                          <Globe className='h-4 w-4' />
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
                <CardContent>
                  <CollapsibleList
                    items={profile.experiences}
                    maxItems={3}
                    keyExtractor={exp => exp.id}
                    renderItem={exp => {
                      const ExperienceIcon = exp.type === 'education' ? GraduationCap : Briefcase;
                      return (
                        <button
                          type='button'
                          onClick={() => setSelectedExperience(exp)}
                          className='flex w-full cursor-pointer gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted'
                        >
                          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted'>
                            <ExperienceIcon className='h-5 w-5' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='font-medium'>{exp.title}</p>
                            <p className='text-sm text-muted-foreground'>{exp.organization}</p>
                            <p className='text-xs text-muted-foreground'>
                              {formatDateRange(exp.startDate, exp.endDate)}
                            </p>
                          </div>
                        </button>
                      );
                    }}
                  />
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
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary'>
                    {getInitials(profile.name)}
                  </div>
                  <h3 className='mt-4 text-lg font-semibold'>Ask me anything about my career</h3>
                  <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                    Curious about my experience, projects, or skills? Go ahead and ask - I&apos;d
                    love to tell you more about my journey.
                  </p>

                  {isConnected && (
                    <div className='mt-6 flex flex-wrap justify-center gap-2'>
                      {QUICK_PROMPTS.map((prompt, index) => (
                        <button
                          key={prompt}
                          type='button'
                          onClick={() => handlePromptClick(prompt)}
                          className='animate-in fade-in slide-in-from-bottom-2 cursor-pointer rounded-full border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-muted hover:scale-105'
                          style={{animationDelay: `${index * 100}ms`, animationFillMode: 'both'}}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className='space-y-4'>
                  {messages.map(message => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      assistantIcon={
                        <div className='relative'>
                          <span className='text-xs font-semibold'>{getInitials(profile.name)}</span>
                          <Sparkles className='absolute -top-1 -right-2.5 h-3 w-3 fill-primary text-primary' />
                        </div>
                      }
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
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
                  className='max-h-32 min-h-10 resize-none'
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

      {/* Experience Detail Modal */}
      <ExperienceModal
        experience={selectedExperience}
        open={!!selectedExperience}
        onOpenChange={open => !open && setSelectedExperience(null)}
      />
    </div>
  );
}
