'use client';

import {useRef} from 'react';
import {useMutation} from '@tanstack/react-query';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Upload, Loader2} from 'lucide-react';
import {ExperienceList} from '@/components/ExperienceList';
import {UntaggedStories} from '@/components/UntaggedStories';
import {useProfile} from '@/hooks/useProfile';

async function uploadCV(file: File): Promise<{success: boolean}> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('cv', file);

  const response = await fetch('/api/cv/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Upload failed'}));
    throw new Error(error.message || 'Failed to upload CV');
  }

  return response.json();
}

export function ProfileSection() {
  const {data, isLoading, invalidate} = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadCV,
    onSuccess: () => {
      invalidate();
    },
  });

  const user = data?.user;
  const experiences = data?.experiences ?? [];
  const untaggedStories = data?.untaggedStories ?? [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col gap-6 overflow-auto'>
      <Card>
        <CardHeader>
          <div className='flex items-start justify-between'>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type='file'
                accept='.pdf,.doc,.docx'
                onChange={handleFileChange}
                className='hidden'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={handleUploadClick}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Upload className='mr-2 h-4 w-4' />
                )}
                {uploadMutation.isPending ? 'Uploading...' : 'Re-upload CV'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <label className='text-sm font-medium'>Name</label>
            <p className='text-sm text-muted-foreground'>{user?.name || '-'}</p>
          </div>
          <div>
            <label className='text-sm font-medium'>Email</label>
            <p className='text-sm text-muted-foreground'>{user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <UntaggedStories stories={untaggedStories} />

      <ExperienceList experiences={experiences} onMutate={invalidate} />
    </div>
  );
}
