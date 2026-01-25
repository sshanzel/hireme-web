'use client';

import {
  Database,
  Server,
  Globe,
  Cpu,
  MessageSquare,
  FileText,
  Zap,
  ArrowRight,
  Sparkles,
  Radio,
  Cloud,
  HardDrive,
  GitBranch,
  Layers,
  Search,
  Brain,
  Upload,
  Bot,
} from 'lucide-react';
import Link from 'next/link';
import {cn} from '@/lib/utils';

interface TechCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  className?: string;
}

function TechCard({icon, title, description, tags, className}: TechCardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        className,
      )}
    >
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      <div className='relative'>
        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110'>
          {icon}
        </div>
        <h3 className='mb-2 text-lg font-semibold'>{title}</h3>
        <p className='mb-4 text-sm text-muted-foreground leading-relaxed'>{description}</p>
        <div className='flex flex-wrap gap-2'>
          {tags.map(tag => (
            <span
              key={tag}
              className='rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground'
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ArchitectureNodeProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'gcp' | 'external';
}

function ArchitectureNode({
  icon,
  label,
  sublabel,
  className,
  variant = 'secondary',
}: ArchitectureNodeProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20',
    secondary: 'bg-card border-border hover:border-primary/30',
    accent: 'bg-accent/10 border-accent/30',
    gcp: 'bg-blue-500/10 border-blue-500/30',
    external: 'bg-emerald-500/10 border-emerald-500/30',
  };

  const iconBg = {
    primary: 'bg-primary-foreground/20 text-primary-foreground',
    secondary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/20 text-accent',
    gcp: 'bg-blue-500/20 text-blue-600',
    external: 'bg-emerald-500/20 text-emerald-600',
  };

  const sublabelColor = {
    primary: 'text-primary-foreground/70',
    secondary: 'text-muted-foreground',
    accent: 'text-muted-foreground',
    gcp: 'text-muted-foreground',
    external: 'text-muted-foreground',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-300 hover:scale-105',
        variants[variant],
        className,
      )}
    >
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconBg[variant])}>
        {icon}
      </div>
      <span className='text-sm font-medium text-center'>{label}</span>
      {sublabel && (
        <span className={cn('text-xs text-center', sublabelColor[variant])}>{sublabel}</span>
      )}
    </div>
  );
}

function VerticalFlow({className}: {className?: string}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-2', className)}>
      <div className='h-8 w-px bg-gradient-to-b from-primary/50 to-border' />
      <div className='h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-primary/50' />
    </div>
  );
}

function SectionLabel({
  children,
  color = 'default',
}: {
  children: React.ReactNode;
  color?: 'default' | 'gcp' | 'external';
}) {
  const colors = {
    default: 'text-muted-foreground',
    gcp: 'text-blue-600',
    external: 'text-emerald-600',
  };
  return (
    <div className='mb-4 text-center'>
      <span className={cn('text-xs font-medium uppercase tracking-wider', colors[color])}>
        {children}
      </span>
    </div>
  );
}

export default function StackPage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Navigation */}
      <nav className='sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
          <Link href='/' className='text-xl font-semibold transition-opacity hover:opacity-80'>
            <span className='text-gradient'>HireMe</span>
            <span>.dev</span>
          </Link>
          <div className='flex items-center gap-6'>
            <Link
              href='/login'
              className='text-sm text-muted-foreground transition-colors hover:text-foreground'
            >
              Login
            </Link>
            <Link
              href='/signup'
              className='rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90'
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='relative overflow-hidden border-b border-border/50'>
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-30'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
        <div className='absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl' />

        <div className='relative mx-auto max-w-6xl px-6 py-24 text-center'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary'>
            <Brain className='h-4 w-4' />
            <span>A Learning Project</span>
          </div>
          <h1 className='mb-6 text-5xl font-bold tracking-tight md:text-6xl'>
            Tech <span className='text-gradient'>Stack</span>
          </h1>
          <p className='mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed'>
            I&apos;m probably late to the RAG party, but I wanted to understand how it actually
            works instead of just reading about it. So I built this, an AI that can answer questions
            about your career, but only using your own stories and experiences. No generic advice,
            just your documented history.
          </p>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className='border-b border-border/50 py-20'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold'>System Architecture</h2>
            <p className='text-muted-foreground'>
              The bird&apos;s eye view. Nothing too fancy - just enough moving parts to make it
              interesting.
            </p>
          </div>

          {/* Desktop Architecture Diagram */}
          <div className='hidden lg:block'>
            <div className='relative rounded-2xl border border-border/50 bg-card/50 p-8'>
              {/* Row 1: Clients */}
              <SectionLabel>Clients</SectionLabel>
              <div className='mb-6 flex justify-center gap-8'>
                <ArchitectureNode
                  icon={<Globe className='h-5 w-5' />}
                  label='Web App'
                  sublabel='Next.js on Vercel'
                  variant='primary'
                />
                <ArchitectureNode
                  icon={<MessageSquare className='h-5 w-5' />}
                  label='Public Visitors'
                  sublabel='Bio Pages'
                  variant='secondary'
                />
              </div>

              <VerticalFlow />

              {/* GCP Section */}
              <div className='rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 mb-6'>
                <SectionLabel color='gcp'>Google Cloud Platform</SectionLabel>

                {/* Cloud Run API */}
                <div className='mb-6 flex justify-center'>
                  <div className='rounded-xl border border-blue-500/30 bg-card p-4'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600'>
                        <Server className='h-4 w-4' />
                      </div>
                      <div>
                        <p className='text-sm font-semibold'>Cloud Run - API Service</p>
                        <p className='text-xs text-muted-foreground'>
                          Fastify + TypeScript (scales 0→N)
                        </p>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-4 text-xs'>
                      <div>
                        <p className='font-medium text-muted-foreground mb-1'>REST Endpoints</p>
                        <div className='space-y-0.5 font-mono text-muted-foreground'>
                          <p>/auth, /profile, /cv</p>
                          <p>/experiences, /stories</p>
                        </div>
                      </div>
                      <div>
                        <p className='font-medium text-muted-foreground mb-1'>WebSocket</p>
                        <div className='space-y-0.5 font-mono text-muted-foreground'>
                          <p>/ws/story-event</p>
                          <p>/ws/coach, /ws/bio/:id</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <VerticalFlow />

                {/* Pub/Sub */}
                <div className='mb-6 flex justify-center'>
                  <div className='rounded-xl border border-blue-500/30 bg-card p-4'>
                    <div className='flex items-center gap-3 mb-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600'>
                        <Radio className='h-4 w-4' />
                      </div>
                      <div>
                        <p className='text-sm font-semibold'>Cloud Pub/Sub</p>
                        <p className='text-xs text-muted-foreground'>Event-driven messaging</p>
                      </div>
                    </div>
                    <div className='flex gap-2 flex-wrap'>
                      {['cv-uploaded', 'story-completed', 'experience-updated'].map(topic => (
                        <span
                          key={topic}
                          className='rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600'
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <VerticalFlow />

                {/* Cloud Run Worker + Storage */}
                <div className='flex justify-center gap-6'>
                  <div className='rounded-xl border border-blue-500/30 bg-card p-4'>
                    <div className='flex items-center gap-3 mb-2'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-600'>
                        <Zap className='h-4 w-4' />
                      </div>
                      <div>
                        <p className='text-sm font-semibold'>Cloud Run - Worker</p>
                        <p className='text-xs text-muted-foreground'>Async processing</p>
                      </div>
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      <p>CV parsing, embeddings</p>
                      <p>Story summarization</p>
                    </div>
                  </div>
                  <ArchitectureNode
                    icon={<HardDrive className='h-5 w-5' />}
                    label='Cloud Storage'
                    sublabel='CV Files'
                    variant='gcp'
                  />
                </div>
              </div>

              <VerticalFlow />

              {/* External Services */}
              <div className='mb-6'>
                <SectionLabel color='external'>External Services</SectionLabel>
                <div className='flex items-center justify-center gap-6'>
                  <ArchitectureNode
                    icon={<Cpu className='h-5 w-5' />}
                    label='OpenAI'
                    sublabel='GPT-4 + Embeddings'
                    variant='external'
                  />
                  <ArchitectureNode
                    icon={<FileText className='h-5 w-5' />}
                    label='Eden AI'
                    sublabel='CV Parsing'
                    variant='external'
                  />
                </div>
              </div>

              <VerticalFlow />

              {/* Database */}
              <SectionLabel>Database</SectionLabel>
              <div className='flex justify-center'>
                <div className='rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600'>
                      <Database className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='text-sm font-semibold'>Supabase PostgreSQL + pgvector</p>
                      <p className='text-xs text-muted-foreground'>Drizzle ORM + Vector Search</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className='absolute left-4 top-4 h-20 w-20 rounded-full bg-primary/5 blur-2xl' />
              <div className='absolute bottom-4 right-4 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl' />
            </div>
          </div>

          {/* Mobile Architecture (Simplified) */}
          <div className='lg:hidden'>
            <div className='space-y-4 rounded-2xl border border-border/50 bg-card/50 p-6'>
              <ArchitectureNode
                icon={<Globe className='h-5 w-5' />}
                label='Frontend'
                sublabel='Next.js on Vercel'
                variant='primary'
                className='w-full'
              />
              <VerticalFlow />
              <ArchitectureNode
                icon={<Server className='h-5 w-5' />}
                label='Cloud Run API'
                sublabel='Fastify + TypeScript'
                variant='gcp'
                className='w-full'
              />
              <VerticalFlow />
              <ArchitectureNode
                icon={<Radio className='h-5 w-5' />}
                label='Cloud Pub/Sub'
                sublabel='Event messaging'
                variant='gcp'
                className='w-full'
              />
              <VerticalFlow />
              <div className='grid grid-cols-2 gap-3'>
                <ArchitectureNode
                  icon={<Zap className='h-5 w-5' />}
                  label='Worker'
                  sublabel='Async jobs'
                  variant='gcp'
                  className='w-full'
                />
                <ArchitectureNode
                  icon={<HardDrive className='h-5 w-5' />}
                  label='Storage'
                  sublabel='CV Files'
                  variant='gcp'
                  className='w-full'
                />
              </div>
              <VerticalFlow />
              <div className='grid grid-cols-2 gap-3'>
                <ArchitectureNode
                  icon={<Cpu className='h-5 w-5' />}
                  label='OpenAI'
                  sublabel='GPT-4'
                  variant='external'
                  className='w-full'
                />
                <ArchitectureNode
                  icon={<FileText className='h-5 w-5' />}
                  label='Eden AI'
                  sublabel='CV Parser'
                  variant='external'
                  className='w-full'
                />
              </div>
              <VerticalFlow />
              <ArchitectureNode
                icon={<Database className='h-5 w-5' />}
                label='Supabase'
                sublabel='PostgreSQL + Drizzle'
                variant='external'
                className='w-full'
              />
            </div>
          </div>
        </div>
      </section>

      {/* RAG Pipeline Section */}
      <section className='border-b border-border/50 py-20 bg-gradient-to-b from-primary/5 to-transparent'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='mb-12 text-center'>
            <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary'>
              The Whole Point
            </div>
            <h2 className='mb-4 text-3xl font-bold'>RAG Pipeline</h2>
            <p className='mx-auto max-w-2xl text-muted-foreground'>
              This is the heart of the project. The idea is simple: when someone asks the AI a
              question, it doesn&apos;t make things up. It searches through your actual stories and
              experiences, finds the relevant bits, and answers based on that. Your data, your
              voice.
            </p>
          </div>

          <div className='grid gap-8 lg:grid-cols-2'>
            {/* Ingestion Pipeline */}
            <div className='rounded-2xl border border-border/50 bg-card p-6'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600'>
                  <Upload className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-semibold'>Ingestion</h3>
                  <p className='text-xs text-muted-foreground'>How content becomes searchable</p>
                </div>
              </div>
              <p className='mb-4 text-sm text-muted-foreground'>
                Whenever you add or update something, a background worker turns it into vectors that
                can be searched later.
              </p>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 rounded-lg bg-secondary/50 p-3'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-blue-500/20 text-xs font-bold text-blue-600'>
                    1
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Content triggers event</span>
                    <p className='text-xs text-muted-foreground'>
                      CV upload, story completion, experience update
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg bg-secondary/50 p-3'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-blue-500/20 text-xs font-bold text-blue-600'>
                    2
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Worker processes content</span>
                    <p className='text-xs text-muted-foreground'>
                      Summarize with GPT-4o-mini, format as chunks
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg bg-secondary/50 p-3'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-blue-500/20 text-xs font-bold text-blue-600'>
                    3
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Generate embeddings</span>
                    <p className='text-xs text-muted-foreground'>
                      text-embedding-3-small → 1536-dim vectors
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg bg-secondary/50 p-3'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-blue-500/20 text-xs font-bold text-blue-600'>
                    4
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Store in pgvector</span>
                    <p className='text-xs text-muted-foreground'>
                      PostgreSQL with vector similarity search
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Retrieval Pipeline */}
            <div className='rounded-2xl border border-border/50 bg-card p-6'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600'>
                  <Search className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-semibold'>Retrieval</h3>
                  <p className='text-xs text-muted-foreground'>How questions get answered</p>
                </div>
              </div>
              <p className='mb-4 text-sm text-muted-foreground'>
                When a visitor asks something, we find the most relevant chunks from your data and
                let the AI answer based on those.
              </p>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 rounded-lg bg-secondary/50 p-3'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-600'>
                    1
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Visitor asks a question</span>
                    <p className='text-xs text-muted-foreground'>
                      &ldquo;What projects have you worked on?&rdquo;
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg bg-secondary/50 p-3'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-600'>
                    2
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Embed query & vector search</span>
                    <p className='text-xs text-muted-foreground'>
                      Cosine similarity to find top 5 relevant chunks
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg bg-secondary/50 p-3'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-600'>
                    3
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Augment prompt with context</span>
                    <p className='text-xs text-muted-foreground'>
                      Inject relevant stories & experiences
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-3 rounded-lg bg-secondary/50 p-3'>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-600'>
                    4
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>AI responds as the user</span>
                    <p className='text-xs text-muted-foreground'>
                      Grounded answers, no hallucination
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Models */}
          <div className='mt-8 rounded-2xl border border-border/50 bg-card p-6'>
            <h3 className='mb-1 font-semibold'>Models I&apos;m Using</h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              Went with gpt-4o-mini for most things. Fast enough, cheap enough, good enough.
            </p>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='rounded-lg bg-secondary/50 p-3'>
                <p className='text-xs text-muted-foreground'>Embeddings</p>
                <p className='font-mono text-sm font-medium'>text-embedding-3-small</p>
              </div>
              <div className='rounded-lg bg-secondary/50 p-3'>
                <p className='text-xs text-muted-foreground'>Bio Chat / Story Chat / Coaching</p>
                <p className='font-mono text-sm font-medium'>gpt-4o-mini</p>
              </div>
              <div className='rounded-lg bg-secondary/50 p-3'>
                <p className='text-xs text-muted-foreground'>Story Summarization</p>
                <p className='font-mono text-sm font-medium'>gpt-4o-mini</p>
              </div>
              <div className='rounded-lg bg-secondary/50 p-3'>
                <p className='text-xs text-muted-foreground'>CV Parsing</p>
                <p className='font-mono text-sm font-medium'>Eden AI</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Cards */}
      <section className='py-20'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold'>The Boring Parts</h2>
            <p className='text-muted-foreground'>
              Standard stuff, really. TypeScript everywhere, serverless so I don&apos;t pay when
              nobody&apos;s using it.
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <TechCard
              icon={<Globe className='h-6 w-6' />}
              title='Next.js Frontend'
              description='React 19 with server components. Deployed on Vercel because it just works.'
              tags={['React 19', 'TypeScript', 'Tailwind CSS', 'Vercel']}
            />
            <TechCard
              icon={<Server className='h-6 w-6' />}
              title='Fastify Backend'
              description='Handles REST and WebSocket connections. Picked Fastify over Express for the schema validation.'
              tags={['Node.js 20', 'Fastify', 'TypeScript']}
            />
            <TechCard
              icon={<Cloud className='h-6 w-6' />}
              title='Cloud Run'
              description='Scales to zero when idle. I only pay when someone actually uses it, which is nice for a side project.'
              tags={['Serverless', 'Auto-scaling', 'Pay-per-use']}
            />
            <TechCard
              icon={<Radio className='h-6 w-6' />}
              title='Cloud Pub/Sub'
              description='Decouples the heavy stuff like CV parsing and embedding generation. Failed messages go to a dead letter queue.'
              tags={['Event-driven', 'Async', 'Dead Letter Queue']}
            />
            <TechCard
              icon={<Cpu className='h-6 w-6' />}
              title='OpenAI'
              description='GPT-4o-mini for the chat stuff, text-embedding-3-small for vectors. Balancing cost and quality.'
              tags={['GPT-4o-mini', 'Embeddings', 'Streaming']}
            />
            <TechCard
              icon={<Database className='h-6 w-6' />}
              title='Supabase + pgvector'
              description='PostgreSQL with the pgvector extension. Keeps everything in one database instead of a separate vector store.'
              tags={['PostgreSQL', 'pgvector', 'Drizzle ORM']}
            />
            <TechCard
              icon={<HardDrive className='h-6 w-6' />}
              title='Cloud Storage'
              description='Where uploaded CVs live. Eden AI parses them into structured data.'
              tags={['GCS', 'Eden AI', 'CV Parsing']}
            />
            <TechCard
              icon={<Layers className='h-6 w-6' />}
              title='Pulumi'
              description='All infrastructure defined in TypeScript. Easier to reason about than YAML.'
              tags={['Pulumi', 'TypeScript', 'IaC']}
            />
            <TechCard
              icon={<GitBranch className='h-6 w-6' />}
              title='GitHub Actions'
              description='Push to main, it builds and deploys. Nothing fancy, but it works.'
              tags={['CI/CD', 'Docker', 'Automation']}
            />
          </div>
        </div>
      </section>

      {/* Data Flow Section */}
      <section className='border-t border-border/50 bg-secondary/30 py-20'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold'>How Things Actually Work</h2>
            <p className='text-muted-foreground'>
              Three main flows. Each one taught me something new about async processing.
            </p>
          </div>

          <div className='grid gap-6 md:grid-cols-3'>
            <div className='rounded-2xl border border-border/50 bg-card p-6'>
              <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <FileText className='h-5 w-5' />
              </div>
              <h3 className='mb-2 font-semibold'>CV Upload & Processing</h3>
              <ol className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>1.</span>
                  <span>User uploads CV to Cloud Storage</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>2.</span>
                  <span>Pub/Sub triggers Worker service</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>3.</span>
                  <span>Eden AI extracts structured data</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>4.</span>
                  <span>Experiences saved to database</span>
                </li>
              </ol>
            </div>

            <div className='rounded-2xl border border-border/50 bg-card p-6'>
              <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <MessageSquare className='h-5 w-5' />
              </div>
              <h3 className='mb-2 font-semibold'>AI Story Creation</h3>
              <ol className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>1.</span>
                  <span>WebSocket connection established</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>2.</span>
                  <span>User messages streamed to GPT-4</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>3.</span>
                  <span>AI responses streamed back live</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>4.</span>
                  <span>Story summarized & embedded async</span>
                </li>
              </ol>
            </div>

            <div className='rounded-2xl border border-border/50 bg-card p-6'>
              <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <Globe className='h-5 w-5' />
              </div>
              <h3 className='mb-2 font-semibold'>Public Bio Chat</h3>
              <ol className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>1.</span>
                  <span>Visitor opens /{'{username}'}</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>2.</span>
                  <span>Profile data loaded as context</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>3.</span>
                  <span>AI answers as the professional</span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='font-mono text-primary'>4.</span>
                  <span>No authentication required</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='border-t border-border/50 bg-gradient-to-b from-primary/5 to-transparent py-20'>
        <div className='mx-auto max-w-2xl px-6 text-center'>
          <h2 className='mb-4 text-3xl font-bold'>Want to try it?</h2>
          <p className='mb-8 text-muted-foreground'>
            It&apos;s free to use. Add some experiences, chat with the AI to create stories, and see
            how the RAG pipeline answers questions about you.
          </p>
          <Link
            href='/signup'
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/20'
          >
            Create an Account
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-border/50 py-8'>
        <div className='mx-auto max-w-6xl px-6'>
          <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
            <div className='text-sm text-muted-foreground'>
              &copy; {new Date().getFullYear()} HireMe.dev. All rights reserved.
            </div>
            <div className='flex gap-6 text-sm text-muted-foreground'>
              <Link href='/' className='transition-colors hover:text-foreground'>
                Home
              </Link>
              <Link href='/stack' className='transition-colors hover:text-foreground'>
                Stack
              </Link>
              <Link href='/login' className='transition-colors hover:text-foreground'>
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
