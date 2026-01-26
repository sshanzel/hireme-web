import type {Story} from '@/types/experience';

interface StoryItemProps {
  story: Story;
  onClick: () => void;
}

export function StoryItem({story, onClick}: StoryItemProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='w-full rounded-md border bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50'
    >
      <div className='flex items-start justify-between gap-2'>
        <h5 className='text-sm font-medium line-clamp-1'>{story.title}</h5>
        <div className='flex flex-wrap gap-1'>
          {story.tags?.slice(0, 2).map(tag => (
            <span
              key={tag}
              className='inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>{story.impact}</p>
    </button>
  );
}
