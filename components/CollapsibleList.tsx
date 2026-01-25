'use client';

import {useState, useRef, useLayoutEffect} from 'react';
import {Button} from '@/components/ui/button';
import {ChevronDown, ChevronUp} from 'lucide-react';

interface CollapsibleListProps<T> {
  items: T[];
  maxItems?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'space-y-1',
  md: 'space-y-2',
  lg: 'space-y-4',
};

export function CollapsibleList<T>({
  items,
  maxItems = 3,
  renderItem,
  keyExtractor,
  className,
  gap = 'sm',
}: CollapsibleListProps<T>) {
  const gapClass = gapClasses[gap];
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState<number | 'auto'>('auto');
  const [isInitialized, setIsInitialized] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const collapsedRef = useRef<HTMLDivElement>(null);

  const hasMore = items.length > maxItems;
  const hiddenCount = items.length - maxItems;

  useLayoutEffect(() => {
    if (!contentRef.current || !collapsedRef.current) return;

    const fullHeight = contentRef.current.scrollHeight;
    const collapsedHeight = collapsedRef.current.scrollHeight;

    // On initial mount, set height immediately without animation
    if (!isInitialized) {
      setHeight(collapsedHeight);
      setIsInitialized(true);
      return;
    }

    if (isExpanded) {
      setHeight(collapsedHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight(fullHeight);
        });
      });
    } else {
      setHeight(fullHeight);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setHeight(collapsedHeight);
        });
      });
    }
  }, [isExpanded, items.length, maxItems, isInitialized]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Hidden ref to measure collapsed height */}
      <div ref={collapsedRef} className='invisible absolute' aria-hidden='true'>
        <div className={gapClass}>
          {items.slice(0, maxItems).map((item, index) => (
            <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
          ))}
        </div>
      </div>

      <div
        ref={contentRef}
        className='overflow-hidden transition-[height] duration-300 ease-in-out'
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className={gapClass}>
          {items.map((item, index) => (
            <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
          ))}
        </div>
      </div>
      {hasMore && (
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className='mt-2 w-full'
        >
          {isExpanded ? (
            <>
              <ChevronUp className='mr-2 h-4 w-4' />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className='mr-2 h-4 w-4' />
              Show {hiddenCount} more
            </>
          )}
        </Button>
      )}
    </div>
  );
}
