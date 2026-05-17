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
  ChevronDown,
  ChevronUp,
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
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
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
  const hasProfileDetails = !!profile.bio || !!hasSocials;
  const profileSummary = (
    <div className='flex min-w-0 items-center gap-3 text-left'>
      <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-base font-semibold text-primary-foreground shadow-[4px_4px_0_oklch(0.17_0.023_248_/_0.14)]'>
        {getInitials(profile.name)}
      </div>
      <div className='min-w-0'>
        <h1 className='font-display truncate text-lg font-semibold'>{profile.name}</h1>
        {headline && <p className='truncate text-sm text-muted-foreground'>{headline}</p>}
      </div>
    </div>
  );

  return (
    <div className='workspace-grid min-h-screen bg-background'>
      <header className='paper-texture relative overflow-hidden border-b border-border/70 bg-card/72 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4'>
          <Link
            href='/'
            className='font-display relative cursor-pointer text-xl font-semibold transition-opacity hover:opacity-80'
          >
            <span className='text-gradient'>HireMe</span>
            <span>.dev</span>
          </Link>
          <Link
            href='/stack'
            className='relative rounded-md border border-border/70 bg-card/80 px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:text-foreground'
          >
            Tech Stack
          </Link>
        </div>
      </header>

      <main className='mx-auto max-w-6xl px-4 py-8 md:py-10'>
        <div className='mb-8 max-w-3xl'>
          <div className='eyebrow-label'>Interactive candidate dossier</div>
          <h2 className='font-display mt-3 text-5xl font-semibold leading-[0.98] md:text-6xl'>
            Ask the work history directly.
          </h2>
          <p className='mt-4 max-w-2xl text-sm leading-6 text-muted-foreground'>
            This profile is built from documented projects and career stories, so the chat stays close
            to the evidence instead of drifting into generic resume talk.
          </p>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='space-y-6'>
            <Card className='gap-0 overflow-hidden py-0'>
              {hasProfileDetails ? (
                <button
                  type='button'
                  aria-expanded={isProfileExpanded}
                  aria-controls='public-profile-details'
                  onClick={() => setIsProfileExpanded(value => !value)}
                  className='flex w-full cursor-pointer items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                >
                  {profileSummary}
                  {isProfileExpanded ? (
                    <ChevronUp className='h-4 w-4 shrink-0 text-muted-foreground' />
                  ) : (
                    <ChevronDown className='h-4 w-4 shrink-0 text-muted-foreground' />
                  )}
                </button>
              ) : (
                <div className='px-6 py-4'>{profileSummary}</div>
              )}

              {hasProfileDetails && isProfileExpanded && (
                <CardContent id='public-profile-details' className='border-t pb-6 pt-4'>
                  <div className='space-y-4'>
                    {profile.bio && <p className='text-sm text-muted-foreground'>{profile.bio}</p>}

                    {hasSocials && (
                      <div className='flex gap-2'>
                        {profile.githubUrl && (
                          <a
                            href={profile.githubUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-muted text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary'
                          >
                            <Github className='h-4 w-4' />
                          </a>
                        )}
                        {profile.linkedinUrl && (
                          <a
                            href={profile.linkedinUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-muted text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary'
                          >
                            <Linkedin className='h-4 w-4' />
                          </a>
                        )}
                        {profile.twitterUrl && (
                          <a
                            href={profile.twitterUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-muted text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary'
                          >
                            <Twitter className='h-4 w-4' />
                          </a>
                        )}
                        {profile.websiteUrl && (
                          <a
                            href={profile.websiteUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-muted text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary'
                          >
                            <Globe className='h-4 w-4' />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {profile.experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Evidence trail</CardTitle>
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
                          className='flex w-full cursor-pointer gap-3 rounded-md border border-transparent p-2 text-left transition-all hover:-translate-y-0.5 hover:border-border/70 hover:bg-muted'
                        >
                          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted'>
                            <ExperienceIcon className='h-5 w-5' />
                          </div>
                          <div className='min-w-0 flex-1'>
                            <p className='font-display font-semibold'>{exp.title}</p>
                            <p className='text-sm text-muted-foreground'>{exp.organization}</p>
                            <p className='font-mono text-[10px] font-semibold uppercase text-muted-foreground'>
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

          <Card className='paper-texture flex min-h-150 flex-col overflow-hidden py-0 lg:col-span-2 md:max-h-[calc(100vh-8.5rem)] md:sticky md:top-24'>
            <div className='relative flex shrink-0 items-center justify-between border-b px-4 py-3'>
              <div className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-primary' />
                <div>
                  <h2 className='font-display text-lg font-semibold'>Let&apos;s chat</h2>
                  <p className='font-mono text-[10px] font-semibold uppercase text-muted-foreground'>
                    Powered by AI, trained on my experiences
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 rounded-md border border-border/70 bg-background/60 px-2.5 py-1.5'>
                <span
                  className={cn(
                    'status-dot',
                    isConnected ? 'bg-green-500' : 'bg-muted-foreground',
                  )}
                />
                <span className='font-mono text-[10px] font-semibold uppercase text-muted-foreground'>
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </div>

            <div className='relative flex min-h-0 flex-1 flex-col overflow-auto bg-gradient-to-b from-secondary/25 via-transparent to-card/70 p-4'>
              {messages.length === 0 && !isTyping ? (
                <div className='flex flex-1 flex-col items-center justify-center text-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-md bg-primary font-mono text-xl font-semibold text-primary-foreground shadow-[5px_5px_0_oklch(0.17_0.023_248_/_0.14)]'>
                    {getInitials(profile.name)}
                  </div>
                  <h3 className='font-display mt-4 text-2xl font-semibold'>Ask me anything about my career</h3>
                  <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                    Curious about my experience, projects, or skills? Go ahead and ask - I&apos;d
                    love to tell you more about my journey.
                  </p>

                  <div className='mt-6 flex flex-wrap justify-center gap-2'>
                    {QUICK_PROMPTS.map((prompt, index) => (
                      <button
                        key={prompt}
                        type='button'
                        onClick={() => handlePromptClick(prompt)}
                        disabled={!isConnected}
                        className={cn(
                          'rounded-md border px-3 py-1.5 text-xs font-semibold transition-all duration-300',
                          isConnected
                            ? 'animate-in zoom-in-95 fade-in cursor-pointer bg-background hover:bg-muted hover:scale-105'
                            : 'cursor-not-allowed bg-muted/50 text-muted-foreground/50',
                        )}
                        style={
                          isConnected
                            ? {animationDelay: `${index * 75}ms`, animationFillMode: 'both'}
                            : undefined
                        }
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
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
                  {isTyping && (
                    <TypingIndicator
                      icon={
                        <div className='relative'>
                          <span className='text-xs font-semibold'>{getInitials(profile.name)}</span>
                          <Sparkles className='absolute -top-1 -right-2.5 h-3 w-3 fill-primary text-primary' />
                        </div>
                      }
                    />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className='relative shrink-0 border-t bg-card/90 p-4'>
              <div className='flex gap-2 rounded-md border border-border/70 bg-background/75 p-2 shadow-inner'>
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
                  className='max-h-32 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0'
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
