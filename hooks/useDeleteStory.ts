import {useMutation, useQueryClient} from '@tanstack/react-query';
import {apiFetch, endpoints} from '@/lib/api';

export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyId: string) =>
      apiFetch(endpoints.story(storyId), {method: 'DELETE'}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['profile']});
    },
  });
}
