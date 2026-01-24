import {useQuery, useQueryClient} from '@tanstack/react-query';
import type {Experience, Story} from '@/types/experience';

interface ProfileUser {
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

interface ProfileData {
  user: ProfileUser;
  experiences: Experience[];
  untaggedStories: Story[];
}

async function fetchProfile(): Promise<ProfileData> {
  const token = localStorage.getItem('token');

  const response = await fetch('/api/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to fetch profile'}));
    throw new Error(error.message || 'Failed to fetch profile');
  }

  return response.json();
}

export function useProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['profile']});
  };

  return {
    ...query,
    invalidate,
  };
}
