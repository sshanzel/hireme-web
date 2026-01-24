import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {ProfileFormData} from '@/lib/validations/profile';

interface UpdateProfileResponse {
  id: string;
  email: string;
  name: string;
  cvUploadedAt: string | null;
  title: string | null;
  bio: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
}

async function updateProfile(data: ProfileFormData): Promise<UpdateProfileResponse> {
  const response = await fetch('/api/profile', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to update profile'}));
    throw new Error(error.message || 'Failed to update profile');
  }

  return response.json();
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      queryClient.invalidateQueries({queryKey: ['profile']});
    },
  });
}
