import {useMutation, useQueryClient} from '@tanstack/react-query';
import type {Experience, Story} from '@/types/experience';

interface ProfileData {
  user: {
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
  };
  experiences: Experience[];
  untaggedStories: Story[];
}

interface TagStoryParams {
  storyId: string;
  experienceId: string;
}

async function tagStory({storyId, experienceId}: TagStoryParams): Promise<Story> {
  const response = await fetch(`/api/stories/${storyId}/experience`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({experienceId}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({message: 'Failed to tag story'}));
    throw new Error(error.message || 'Failed to tag story');
  }

  return response.json();
}

export function useTagStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagStory,
    onMutate: async ({storyId, experienceId}) => {
      await queryClient.cancelQueries({queryKey: ['profile']});

      const previousData = queryClient.getQueryData<ProfileData>(['profile']);

      if (previousData) {
        const story = previousData.untaggedStories.find(s => s.id === storyId);

        if (story) {
          queryClient.setQueryData<ProfileData>(['profile'], {
            ...previousData,
            untaggedStories: previousData.untaggedStories.filter(s => s.id !== storyId),
            experiences: previousData.experiences.map(exp =>
              exp.id === experienceId ? {...exp, stories: [...exp.stories, story]} : exp,
            ),
          });
        }
      }

      return {previousData};
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['profile'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['profile']});
    },
  });
}
