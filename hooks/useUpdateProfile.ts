import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {ProfileFormData} from '@/lib/validations/profile';
import {apiFetch, endpoints} from '@/lib/api';

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

const updateProfile = (data: ProfileFormData) =>
  apiFetch<UpdateProfileResponse>(endpoints.profile, {method: 'PUT', body: data});

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
