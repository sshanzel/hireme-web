'use client';

import {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Send, MessageSquare, X, Tag} from 'lucide-react';
import {cn} from '@/lib/utils';
import {useAuthContext} from '@/contexts/AuthContext';
import {useWebSocket} from '@/hooks/useWebSocket';
import {useStoryChatContext} from '@/contexts/StoryChatContext';
import {useProfile} from '@/hooks/useProfile';
import {useTagStory} from '@/hooks/useTagStory';
import {MessageBubble} from '@/components/chat/MessageBubble';
import {TypingIndicator} from '@/components/chat/TypingIndicator';
import {WS_URL} from '@/lib/config';

interface Message {
  role: 'user' | 'assistant' | 'error';
  content: string;
  createdAt: string;
}

const STORY_PROMPTS = [
  'I led a project that was behind schedule...',
  'I had to convince my team to try a new approach...',
  'I solved a tricky bug that no one else could figure out...',
  'I had a disagreement with a coworker about...',
];

export function Chat() {
  const {user} = useAuthContext();
  const {story, selectedStoryId, setStory, addEvent, clearSelection} = useStoryChatContext();
  const {data: profileData} = useProfile();
  const tagMutation = useTagStory();
  const experiences = profileData?.experiences ?? [];
  const messages = useMemo(() => story?.events ?? [], [story?.events]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleTagStory = (experienceId: string) => {
    if (!story?.id) return;
    tagMutation.mutate(
      {storyId: story.id, experienceId},
      {
        onSuccess: () => {
          clearSelection();
        },
      },
    );
  };

  const wsUrl = selectedStoryId
    ? `${WS_URL}/ws/story-event?storyId=${selectedStoryId}`
    : `${WS_URL}/ws/story-event`;

  const {isConnected, send} = useWebSocket(
    {
      url: wsUrl,
      enabled: !!user,
    },
    {
      onResponse: message => {
        addEvent({
          createdAt: new Date().toISOString(),
          role: 'assistant',
          content: message.data.content,
        });
        setIsLoading(false);
      },
      onError: message => {
        addEvent({
          createdAt: new Date().toISOString(),
          role: 'error',
          content: message.error,
        });
        setIsLoading(false);
      },
      onConnectionError: () => {
        setIsLoading(false);
      },
      onConnected: ({story}) => {
        setStory(story);
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
      createdAt: new Date().toISOString(),
      role: 'user',
      content: input.trim(),
    };

    addEvent(userMessage);
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

  const title = story?.title || 'Tell us a story from your work/project!';

  return (
    <Card className='flex h-full flex-col gap-0 py-0'>
      <div className='flex items-center justify-between border-b px-4 py-3'>
        <div className='flex min-w-0 flex-1 items-center gap-2'>
          <h3 className='truncate text-sm font-medium'>{title}</h3>
          {selectedStoryId && (
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 shrink-0'
              onClick={clearSelection}
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>
        <div className='flex shrink-0 items-center gap-2'>
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
              <MessageBubble key={message.createdAt} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {story?.id && experiences.length > 0 && !story?.experienceId && (
        <div className='mt-6 flex items-center gap-3 border-t bg-muted/30 px-4 py-2'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Tag className='h-4 w-4' />
            <span>Tag this story:</span>
          </div>
          <Select onValueChange={handleTagStory} disabled={tagMutation.isPending}>
            <SelectTrigger className='h-8 w-48'>
              <SelectValue placeholder='Select experience...' />
            </SelectTrigger>
            <SelectContent>
              {experiences.map(exp => (
                <SelectItem key={exp.id} value={exp.id}>
                  {exp.organization}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
            className='max-h-32 min-h-10 resize-none'
          />
          <Button type='submit' size='icon' disabled={!input.trim() || isLoading}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </form>
    </Card>
  );
}
