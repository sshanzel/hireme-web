import {useQuery, useQueryClient} from '@tanstack/react-query';
import type {Experience, Story} from '@/types/experience';
import {apiFetch, endpoints} from '@/lib/api';

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

const fetchProfile = () => apiFetch<ProfileData>(endpoints.profile);

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
