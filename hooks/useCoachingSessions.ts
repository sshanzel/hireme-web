import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

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

async function fetchCoachingSessions(): Promise<CoachingSession[]> {
  const token = localStorage.getItem('token');

  const response = await fetch('/api/coachings', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to fetch sessions'}));
    throw new Error(error.message || 'Failed to fetch sessions');
  }

  return response.json();
}

async function deleteCoachingSession(id: string): Promise<void> {
  const token = localStorage.getItem('token');

  const response = await fetch(`/api/coachings/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to delete session'}));
    throw new Error(error.message || 'Failed to delete session');
  }
}

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
