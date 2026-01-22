'use client';

import {useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {ExperienceForm} from '@/components/ExperienceForm';
import {Briefcase, Plus, Pencil, Trash2, Loader2, BookOpen, Sparkles} from 'lucide-react';
import type {Experience, Story} from '@/types/experience';

interface ExperienceListProps {
  experiences: Experience[];
  onMutate?: () => void;
}

async function deleteExperience(id: string): Promise<void> {
  const token = localStorage.getItem('token');

  const response = await fetch(`/api/experiences/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to delete experience'}));
    throw new Error(error.message || 'Failed to delete experience');
  }
}

function formatDate(dateString: string): string {
  const [year, month] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
}

function formatDateRange(startDate: string, endDate: string | null): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Present';
  return `${start} - ${end}`;
}

interface ExperienceItemProps {
  experience: Experience;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function StoryItem({story}: {story: Story}) {
  return (
    <div className='rounded-md border bg-muted/30 p-3'>
      <div className='flex items-start justify-between gap-2'>
        <h5 className='text-sm font-medium'>{story.title}</h5>
        <div className='flex flex-wrap gap-1'>
          {story.traits.map(trait => (
            <span
              key={trait}
              className='inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
      <p className='mt-1 text-xs text-muted-foreground line-clamp-2'>{story.impact}</p>
    </div>
  );
}

function ExperienceItem({experience, onEdit, onDelete, isDeleting}: ExperienceItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isStoriesExpanded, setIsStoriesExpanded] = useState(false);
  const storiesCount = experience.stories.length;
  const hasStories = storiesCount > 0;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className='rounded-lg border'>
      <div className='flex gap-4 p-4'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
          <Briefcase className='h-5 w-5 text-primary' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-start justify-between gap-x-4 gap-y-1'>
            <div>
              <h4 className='font-medium'>{experience.title}</h4>
              <p className='text-sm text-muted-foreground'>{experience.organization}</p>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-muted-foreground'>
                {formatDateRange(experience.startDate, experience.endDate)}
              </span>
              <Button variant='ghost' size='icon' className='h-8 w-8' onClick={onEdit}>
                <Pencil className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-destructive hover:text-destructive'
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Trash2 className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>
          <p className='mt-2 text-sm'>{experience.description}</p>

          {showDeleteConfirm && (
            <div className='mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3'>
              <p className='flex-1 text-sm text-destructive'>Delete this experience?</p>
              <Button variant='ghost' size='sm' onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant='destructive' size='sm' onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className='border-t px-4 py-3'>
        <Button
          variant='ghost'
          onClick={() => setIsStoriesExpanded(!isStoriesExpanded)}
          className='flex h-auto w-full items-center justify-between p-0 text-left hover:bg-transparent'
        >
          <div className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium'>
              Stories{' '}
              <span className={hasStories ? 'text-primary' : 'text-muted-foreground'}>
                ({storiesCount})
              </span>
            </span>
          </div>
          <span className='text-xs text-muted-foreground'>
            {isStoriesExpanded ? 'Hide' : 'Show'}
          </span>
        </Button>

        {isStoriesExpanded && (
          <div className='mt-3 space-y-2'>
            {hasStories ? (
              experience.stories.map(story => <StoryItem key={story.id} story={story} />)
            ) : (
              <div className='rounded-md border border-dashed bg-muted/20 p-4 text-center'>
                <Sparkles className='mx-auto h-6 w-6 text-muted-foreground/50' />
                <p className='mt-2 text-sm font-medium'>No stories yet</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  Stories help you remember specific achievements and answer interview questions
                  like &quot;Tell me about a time when...&quot;
                </p>
                <Button variant='outline' size='sm' className='mt-3'>
                  <Plus className='mr-2 h-3 w-3' />
                  Add a story
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExperienceList({experiences, onMutate}: ExperienceListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      onMutate?.();
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setEditingExperience(null);
    onMutate?.();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingExperience(null);
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const handleAddClick = () => {
    setEditingExperience(null);
    setIsDialogOpen(true);
  };

  const isEditing = editingExperience !== null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Your professional history</CardDescription>
            </div>
            <Button size='sm' onClick={handleAddClick}>
              <Plus className='mr-2 h-4 w-4' />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Briefcase className='h-10 w-10 text-muted-foreground/50' />
              <p className='mt-4 text-sm text-muted-foreground'>No experiences yet.</p>
              <p className='text-sm text-muted-foreground'>
                Upload your CV or add your work history manually.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {experiences.map(experience => (
                <ExperienceItem
                  key={experience.id}
                  experience={experience}
                  onEdit={() => handleEdit(experience)}
                  onDelete={() => handleDelete(experience.id)}
                  isDeleting={deletingId === experience.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Update the details of your work experience.'
                : 'Add a new work experience to your profile.'}
            </DialogDescription>
          </DialogHeader>
          <ExperienceForm
            experience={editingExperience ?? undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
