import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {formatDateRange} from '@/lib/strings/format';

interface ExperienceModalProps {
  experience: {
    title: string;
    organization: string;
    startDate: string;
    endDate: string | null;
    description: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDescription(text: string): React.ReactNode {
  const lines = text.split('\n').filter(line => line.trim());
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className='space-y-1.5 pl-4'>
          {currentList.map((item, i) => (
            <li key={i} className='list-disc text-sm text-muted-foreground'>
              {item}
            </li>
          ))}
        </ul>,
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-•*]\s*(.+)$/);
    const numberedMatch = trimmed.match(/^\d+[.)]\s*(.+)$/);

    if (bulletMatch || numberedMatch) {
      currentList.push(bulletMatch?.[1] || numberedMatch?.[1] || trimmed);
    } else {
      flushList();
      elements.push(
        <p key={`p-${index}`} className='text-sm leading-relaxed text-muted-foreground'>
          {trimmed}
        </p>,
      );
    }
  });

  flushList();
  return <div className='space-y-3'>{elements}</div>;
}

export function ExperienceModal({experience, open, onOpenChange}: ExperienceModalProps) {
  if (!experience) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{experience.title}</DialogTitle>
          <DialogDescription>
            {experience.organization} &bull;{' '}
            {formatDateRange(experience.startDate, experience.endDate)}
          </DialogDescription>
        </DialogHeader>
        <div className='pt-2'>
          {experience.description ? (
            formatDescription(experience.description)
          ) : (
            <p className='text-sm text-muted-foreground'>No additional details available.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
