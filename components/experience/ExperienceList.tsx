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
import {ExperienceForm} from './ExperienceForm';
import {ExperienceItem} from './ExperienceItem';
import {Briefcase, Plus} from 'lucide-react';
import {useStoryChatContext} from '@/contexts/StoryChatContext';
import {CollapsibleList} from '@/components/common/CollapsibleList';
import {ConfirmDialog} from '@/components/common/ConfirmDialog';
import {apiFetch, endpoints} from '@/lib/api';
import {useDeleteStory} from '@/hooks/useDeleteStory';
import type {Experience} from '@/types/experience';

interface ExperienceListProps {
  experiences: Experience[];
  onMutate?: () => void;
}

const deleteExperience = (id: string) =>
  apiFetch<void>(endpoints.experience(id), {method: 'DELETE'});

export function ExperienceList({experiences, onMutate}: ExperienceListProps) {
  const {selectStory, selectedStoryId, story, clearSelection} = useStoryChatContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingStoryId, setConfirmingStoryId] = useState<string | null>(null);

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

  const deleteStoryMutation = useDeleteStory();

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

  const handleStoryDeleteClick = (storyId: string) => {
    setConfirmingStoryId(storyId);
  };

  const handleStoryDeleteConfirm = () => {
    if (!confirmingStoryId) return;
    deleteStoryMutation.mutate(confirmingStoryId, {
      onSuccess: () => {
        if (selectedStoryId === confirmingStoryId || story?.id === confirmingStoryId) {
          clearSelection();
        }
      },
      onSettled: () => setConfirmingStoryId(null),
    });
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
            <CollapsibleList
              items={experiences}
              maxItems={2}
              keyExtractor={exp => exp.id}
              gap='lg'
              renderItem={experience => (
                <ExperienceItem
                  experience={experience}
                  onEdit={() => handleEdit(experience)}
                  onDelete={() => handleDelete(experience.id)}
                  onStorySelect={selectStory}
                  onStoryDelete={handleStoryDeleteClick}
                  isDeleting={deletingId === experience.id}
                  deletingStoryId={confirmingStoryId}
                />
              )}
            />
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

      <ConfirmDialog
        open={!!confirmingStoryId}
        onOpenChange={open => !open && setConfirmingStoryId(null)}
        title='Delete story'
        description='Are you sure you want to delete this story? This action cannot be undone.'
        confirmLabel='Delete'
        onConfirm={handleStoryDeleteConfirm}
        isLoading={deleteStoryMutation.isPending}
        variant='destructive'
      />
    </>
  );
}
