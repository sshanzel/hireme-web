'use client';

import {useState} from 'react';
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
import {Send, Sparkles, History, Plus, MessageCircle} from 'lucide-react';

const QUICK_PROMPTS = [
  'Tell me about a time I showed ownership',
  'What stories demonstrate my leadership?',
  'Help me practice the STAR method',
  'Give me a mock behavioral interview',
];

// Placeholder threads for UI
const PLACEHOLDER_THREADS = [
  {id: '1', title: 'Leadership examples', date: 'Today'},
  {id: '2', title: 'STAR method practice', date: 'Today'},
  {id: '3', title: 'Mock interview session', date: 'Yesterday'},
  {id: '4', title: 'Ownership stories', date: 'Yesterday'},
  {id: '5', title: 'Problem solving examples', date: 'Last week'},
];

interface ThreadItemProps {
  title: string;
  date: string;
  isActive?: boolean;
  onClick?: () => void;
}

function ThreadItem({title, date, isActive, onClick}: ThreadItemProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
        isActive ? 'bg-muted' : ''
      }`}
    >
      <MessageCircle className='h-4 w-4 shrink-0 text-muted-foreground' />
      <div className='min-w-0 flex-1'>
        <p className='truncate font-medium'>{title}</p>
        <p className='text-xs text-muted-foreground'>{date}</p>
      </div>
    </button>
  );
}

function ThreadList() {
  return (
    <div className='space-y-1'>
      {PLACEHOLDER_THREADS.map(thread => (
        <ThreadItem key={thread.id} title={thread.title} date={thread.date} />
      ))}
    </div>
  );
}

export default function CoachPage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <AppLayout>
      <div className='flex h-full flex-col overflow-hidden'>
        <div className='flex shrink-0 items-start justify-between'>
          <PageHeader
            title='Career Coach'
            description='Practice interviews and explore your stories with AI assistance.'
          />
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
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
                  <ThreadList />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className='mt-6 grid min-h-0 flex-1 grid-cols-1 gap-6 pb-6 lg:grid-cols-3'>
          {/* Chat area - takes 2 columns on desktop */}
          <Card className='flex min-h-0 flex-col py-0 lg:col-span-2'>
            {/* Empty state / placeholder - will be replaced with scrollable messages */}
            <div className='flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto p-8 text-center'>
              <div className='rounded-full bg-primary/10 p-4'>
                <Sparkles className='h-8 w-8 text-primary' />
              </div>
              <h3 className='mt-4 text-lg font-semibold'>Your AI Career Coach</h3>
              <p className='mt-2 max-w-md text-sm text-muted-foreground'>
                Ask me anything about your career stories, practice behavioral interviews, or get
                help preparing answers using the STAR method.
              </p>

              <div className='mt-6 flex flex-wrap justify-center gap-2'>
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    type='button'
                    className='rounded-full border bg-background px-3 py-1.5 text-xs transition-colors hover:bg-muted'
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className='border-t p-4'>
              <div className='flex gap-2'>
                <Textarea
                  placeholder='Ask me about your stories or practice an interview question...'
                  rows={1}
                  className='min-h-10 max-h-32 resize-none'
                />
                <Button size='icon' disabled>
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </Card>

          {/* Thread history - hidden on mobile, visible on desktop */}
          <Card className='hidden min-h-0 flex-col lg:flex'>
            <CardHeader className='shrink-0'>
              <CardTitle className='text-base'>Chat History</CardTitle>
              <CardDescription>Your previous sessions</CardDescription>
            </CardHeader>
            <CardContent className='min-h-0 flex-1 overflow-auto'>
              <ThreadList />
              <ThreadList />
              <ThreadList />
              <ThreadList />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
