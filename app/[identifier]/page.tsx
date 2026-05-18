'use client';

import {use, useState, useRef, useEffect, useCallback} from 'react';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Send,
  Briefcase,
  GraduationCap,
  Sparkles,
  Github,
  Linkedin,
  Twitter,
  Globe,
  ArrowUpRight,
} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useWebSocket} from '@/hooks/useWebSocket';
import {CollapsibleList} from '@/components/common/CollapsibleList';
import {MessageBubble} from '@/components/chat/MessageBubble';
import {TypingIndicator} from '@/components/chat/TypingIndicator';
import {ExperienceModal} from '@/components/experience/ExperienceModal';
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

function getSortedExperiences(profile: PublicProfile): PublicExperience[] {
  return [...profile.experiences].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
}

function getCurrentExperience(profile: PublicProfile): PublicExperience | null {
  const sortedExperiences = getSortedExperiences(profile);
  return sortedExperiences.find(exp => !exp.endDate) ?? sortedExperiences[0] ?? null;
}

function getCareerYears(profile: PublicProfile): number | null {
  const timestamps = profile.experiences
    .map(exp => new Date(exp.startDate).getTime())
    .filter(timestamp => !Number.isNaN(timestamp));

  if (timestamps.length === 0) return null;

  const earliestStart = Math.min(...timestamps);
  const diffYears = (Date.now() - earliestStart) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(1, Math.floor(diffYears));
}

interface SkeletonBlockProps {
  className?: string;
}

const SkeletonBlock = ({className}: SkeletonBlockProps) => (
  <div className={cn('rounded-md bg-muted/70', className)} />
);

function PublicProfileSkeleton() {
  const evidenceItems = Array.from({length: 3}, (_, index) => index);
  const promptRows = ['w-28', 'w-36', 'w-44', 'w-40'];

  return (
    <div className='workspace-grid min-h-screen overflow-x-clip bg-background' aria-busy='true'>
      <header className='paper-texture relative overflow-hidden border-b border-border/70 bg-card/72 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4'>
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

      <main className='mx-auto w-full max-w-6xl px-4 py-8 md:py-10'>
        <div className='mb-8 max-w-3xl animate-pulse'>
          <SkeletonBlock className='h-7 w-52 border border-border/70 bg-secondary/70' />
          <div className='mt-4 space-y-3'>
            <SkeletonBlock className='h-14 w-full max-w-xl bg-foreground/12 md:h-16' />
            <SkeletonBlock className='h-14 w-3/4 max-w-lg bg-foreground/12 md:h-16' />
          </div>
          <div className='mt-5 max-w-2xl space-y-2'>
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-4/5' />
          </div>
        </div>

        <div className='grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(18rem,26.5rem)_minmax(0,1fr)]'>
          <div className='min-w-0 space-y-6'>
            <Card className='gap-0 overflow-hidden py-0'>
              <div className='flex items-center justify-between gap-3 px-6 py-4'>
                <div className='flex min-w-0 items-center gap-3'>
                  <SkeletonBlock className='h-12 w-12 shrink-0 bg-primary/20 shadow-[4px_4px_0_oklch(0.17_0.023_248_/_0.08)]' />
                  <div className='min-w-0 flex-1 animate-pulse space-y-2'>
                    <SkeletonBlock className='h-5 w-44 max-w-full bg-foreground/12' />
                    <SkeletonBlock className='h-4 w-36 max-w-full' />
                  </div>
                </div>
                <SkeletonBlock className='h-4 w-4 shrink-0' />
              </div>

              <CardContent className='border-t pb-5 pt-4'>
                <div className='animate-pulse space-y-2'>
                  <SkeletonBlock className='h-4 w-full' />
                  <SkeletonBlock className='h-4 w-11/12' />
                  <SkeletonBlock className='h-4 w-7/12' />
                </div>
                <SkeletonBlock className='mt-4 h-9 w-36 animate-pulse border border-border/70 bg-secondary/60' />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SkeletonBlock className='h-6 w-32 animate-pulse bg-foreground/12' />
              </CardHeader>
              <CardContent className='space-y-4'>
                {evidenceItems.map(item => (
                  <div key={item} className='flex gap-3 rounded-md p-2'>
                    <SkeletonBlock className='h-10 w-10 shrink-0 animate-pulse' />
                    <div className='min-w-0 flex-1 animate-pulse space-y-2'>
                      <SkeletonBlock className='h-5 w-4/5 bg-foreground/12' />
                      <SkeletonBlock className='h-4 w-1/2' />
                      <SkeletonBlock className='h-3 w-28' />
                    </div>
                  </div>
                ))}
                <div className='flex justify-center pt-1'>
                  <SkeletonBlock className='h-6 w-32 animate-pulse' />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className='paper-texture flex h-[34rem] min-w-0 flex-col overflow-hidden py-0 lg:sticky lg:top-4 lg:h-[clamp(30rem,calc(100dvh-2rem),42rem)]'>
            <div className='relative flex shrink-0 items-center justify-between border-b px-4 py-3'>
              <div className='flex min-w-0 items-center gap-2'>
                <Sparkles className='h-5 w-5 text-primary/60' />
                <div className='min-w-0 animate-pulse space-y-2'>
                  <SkeletonBlock className='h-5 w-24 bg-foreground/12' />
                  <SkeletonBlock className='h-3 w-36 max-w-full sm:w-56' />
                </div>
              </div>
              <SkeletonBlock className='h-9 w-20 shrink-0 animate-pulse border border-border/70 bg-background/70 sm:w-28' />
            </div>

            <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-secondary/25 via-transparent to-card/70 p-4'>
              <div className='flex flex-1 flex-col items-center justify-center text-center'>
                <SkeletonBlock className='h-16 w-16 animate-pulse bg-primary/20 shadow-[5px_5px_0_oklch(0.17_0.023_248_/_0.08)]' />
                <div className='mt-5 w-full max-w-md animate-pulse space-y-3'>
                  <SkeletonBlock className='mx-auto h-7 w-72 max-w-full bg-foreground/12' />
                  <SkeletonBlock className='mx-auto h-4 w-full' />
                  <SkeletonBlock className='mx-auto h-4 w-4/5' />
                </div>
                <div className='mt-6 flex max-w-xl flex-wrap justify-center gap-2'>
                  {promptRows.map(width => (
                    <SkeletonBlock
                      key={width}
                      className={cn(
                        'h-8 animate-pulse border border-border/70 bg-background/70',
                        width,
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className='relative shrink-0 border-t bg-card/90 p-4'>
              <div className='flex gap-2 rounded-md border border-border/70 bg-background/75 p-2 shadow-inner'>
                <SkeletonBlock className='h-10 min-w-0 flex-1 animate-pulse bg-muted/55' />
                <SkeletonBlock className='h-10 w-10 shrink-0 animate-pulse bg-primary/25' />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

interface PublicProfilePageProps {
  params: Promise<{identifier: string}>;
}

export default function PublicProfilePage({params}: PublicProfilePageProps) {
  const {identifier} = use(params);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
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
    return <PublicProfileSkeleton />;
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
  const sortedExperiences = getSortedExperiences(profile);
  const currentExperience = getCurrentExperience(profile);
  const careerYears = getCareerYears(profile);
  const workExperiencesCount = profile.experiences.filter(exp => exp.type === 'work').length;
  const educationCount = profile.experiences.filter(exp => exp.type === 'education').length;
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
    <div className='workspace-grid min-h-screen overflow-x-clip bg-background'>
      <header className='paper-texture relative overflow-hidden border-b border-border/70 bg-card/72 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4'>
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

      <main className='mx-auto w-full max-w-6xl px-4 py-8 md:py-10'>
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

        <div className='grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(18rem,26.5rem)_minmax(0,1fr)]'>
          <div className='min-w-0 space-y-6'>
            <Card className='gap-0 overflow-hidden py-0'>
              {hasProfileDetails ? (
                <button
                  type='button'
                  aria-haspopup='dialog'
                  onClick={() => setIsProfileDialogOpen(true)}
                  className='flex w-full cursor-pointer items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                >
                  {profileSummary}
                  <ArrowUpRight className='h-4 w-4 shrink-0 text-muted-foreground' />
                </button>
              ) : (
                <div className='px-6 py-4'>{profileSummary}</div>
              )}

              {hasProfileDetails && (
                <CardContent className='border-t pb-5 pt-4'>
                  {profile.bio && (
                    <p className='text-sm leading-6 text-muted-foreground line-clamp-3'>
                      {profile.bio}
                    </p>
                  )}
                  <button
                    type='button'
                    onClick={() => setIsProfileDialogOpen(true)}
                    className='mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border border-border/70 bg-secondary/45 px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary'
                  >
                    Read full profile
                    <ArrowUpRight className='h-3.5 w-3.5' />
                  </button>
                </CardContent>
              )}
            </Card>

            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogContent className='studio-panel max-h-[85vh] max-w-2xl overflow-y-auto rounded-lg bg-card p-0'>
                <DialogHeader className='border-b border-border/70 px-6 py-5'>
                  <div className='flex items-start gap-4 pr-8 text-left'>
                    <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-xl font-semibold text-primary-foreground shadow-[5px_5px_0_oklch(0.17_0.023_248_/_0.14)]'>
                      {getInitials(profile.name)}
                    </div>
                    <div className='min-w-0'>
                      <DialogTitle className='font-display text-3xl font-semibold leading-tight'>
                        {profile.name}
                      </DialogTitle>
                      {headline && (
                        <DialogDescription className='mt-1 text-base'>{headline}</DialogDescription>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <div className='space-y-6 px-6 pb-6'>
                  {profile.experiences.length > 0 && (
                    <section>
                      <p className='font-mono text-[11px] font-semibold uppercase text-muted-foreground'>
                        Structured details
                      </p>
                      <div className='mt-3 grid gap-2 sm:grid-cols-3'>
                        {currentExperience && (
                          <div className='rounded-md border border-border/70 bg-background/70 p-3'>
                            <p className='text-xs text-muted-foreground'>Current / latest</p>
                            <p className='font-display mt-1 truncate text-lg font-semibold'>
                              {currentExperience.organization}
                            </p>
                          </div>
                        )}
                        <div className='rounded-md border border-border/70 bg-background/70 p-3'>
                          <p className='text-xs text-muted-foreground'>Work roles</p>
                          <p className='font-display mt-1 text-lg font-semibold'>
                            {workExperiencesCount}
                          </p>
                        </div>
                        <div className='rounded-md border border-border/70 bg-background/70 p-3'>
                          <p className='text-xs text-muted-foreground'>Timeline</p>
                          <p className='font-display mt-1 text-lg font-semibold'>
                            {careerYears ? `${careerYears}+ years` : `${profile.experiences.length} entries`}
                          </p>
                        </div>
                        {educationCount > 0 && (
                          <div className='rounded-md border border-border/70 bg-background/70 p-3'>
                            <p className='text-xs text-muted-foreground'>Education</p>
                            <p className='font-display mt-1 text-lg font-semibold'>{educationCount}</p>
                          </div>
                        )}
                      </div>
                    </section>
                  )}

                  {profile.bio && (
                    <section>
                      <p className='font-mono text-[11px] font-semibold uppercase text-muted-foreground'>
                        Bio
                      </p>
                      <p className='mt-3 text-base leading-8 text-foreground/82'>{profile.bio}</p>
                    </section>
                  )}

                  {sortedExperiences.length > 0 && (
                    <section>
                      <p className='font-mono text-[11px] font-semibold uppercase text-muted-foreground'>
                        Experience timeline
                      </p>
                      <div className='mt-3 space-y-3'>
                        {sortedExperiences.map(exp => {
                          const ExperienceIcon =
                            exp.type === 'education' ? GraduationCap : Briefcase;

                          return (
                            <button
                              key={exp.id}
                              type='button'
                              onClick={() => {
                                setSelectedExperience(exp);
                                setIsProfileDialogOpen(false);
                              }}
                              className='group flex w-full cursor-pointer gap-3 rounded-md border border-border/70 bg-background/70 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/45'
                            >
                              <div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:text-primary'>
                                <ExperienceIcon className='h-4 w-4' />
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='flex flex-wrap items-start justify-between gap-2'>
                                  <div className='min-w-0'>
                                    <p className='font-display text-base font-semibold'>
                                      {exp.title}
                                    </p>
                                    <p className='text-sm text-muted-foreground'>{exp.organization}</p>
                                  </div>
                                  <span className='rounded-md border border-border/70 bg-card/80 px-2 py-1 font-mono text-[10px] font-semibold uppercase text-muted-foreground'>
                                    {formatDateRange(exp.startDate, exp.endDate)}
                                  </span>
                                </div>
                                {exp.description && (
                                  <p className='mt-2 text-sm leading-6 text-muted-foreground line-clamp-3'>
                                    {exp.description}
                                  </p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {hasSocials && (
                    <section>
                      <p className='font-mono text-[11px] font-semibold uppercase text-muted-foreground'>
                        Connect
                      </p>
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {profile.githubUrl && (
                          <a
                            href={profile.githubUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/60'
                          >
                            <Github className='h-4 w-4' />
                            GitHub
                          </a>
                        )}
                        {profile.linkedinUrl && (
                          <a
                            href={profile.linkedinUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/60'
                          >
                            <Linkedin className='h-4 w-4' />
                            LinkedIn
                          </a>
                        )}
                        {profile.twitterUrl && (
                          <a
                            href={profile.twitterUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/60'
                          >
                            <Twitter className='h-4 w-4' />
                            X / Twitter
                          </a>
                        )}
                        {profile.websiteUrl && (
                          <a
                            href={profile.websiteUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/70 px-3 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/60'
                          >
                            <Globe className='h-4 w-4' />
                            Website
                          </a>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </DialogContent>
            </Dialog>

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

          <Card className='paper-texture flex h-[34rem] min-w-0 flex-col overflow-hidden py-0 lg:sticky lg:top-4 lg:h-[clamp(30rem,calc(100dvh-2rem),42rem)]'>
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
