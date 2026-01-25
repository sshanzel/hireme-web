import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {apiFetch, endpoints} from '@/lib/api';

export interface CoachingEvent {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  createdAt: string;
}

export interface CoachingSession {
  id: string;
  title: string;
  events: CoachingEvent[];
  createdAt: string;
  updatedAt: string;
}

const fetchCoachingSessions = () =>
  apiFetch<CoachingSession[]>(endpoints.coachings);

const deleteCoachingSession = (id: string) =>
  apiFetch<void>(endpoints.coaching(id), {method: 'DELETE'});

export function useCoachingSessions() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['coaching-sessions'],
    queryFn: fetchCoachingSessions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoachingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['coaching-sessions']});
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['coaching-sessions']});
  };

  return {
    ...query,
    invalidate,
    deleteSession: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
