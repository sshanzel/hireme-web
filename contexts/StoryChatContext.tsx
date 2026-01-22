import {createContext, useCallback, useContext, useState} from 'react';

export interface StoryEvent {
  content: string;
  role: 'user' | 'assistant' | 'error';
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  events: StoryEvent[];
}

interface StoryChatContextValue {
  story: Story | null;
  selectedStoryId: string | null;
  setStory: (story: Story | null) => void;
  addEvent: (event: StoryEvent) => void;
  selectStory: (storyId: string) => void;
  clearSelection: () => void;
}

const StoryChatContext = createContext<StoryChatContextValue | null>(null);

export const StoryChatProvider = ({children}: React.PropsWithChildren) => {
  const [story, setStory] = useState<Story | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const addEvent = useCallback((event: StoryEvent) => {
    setStory(previous => {
      if (!previous) return previous;

      const events = previous.events || [];

      return {
        ...previous,
        events: [...events, event],
      };
    });
  }, []);

  const selectStory = useCallback((storyId: string) => {
    setSelectedStoryId(storyId);
    setStory(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStoryId(null);
    setStory(null);
  }, []);

  return (
    <StoryChatContext.Provider
      value={{story, selectedStoryId, setStory, addEvent, selectStory, clearSelection}}
    >
      {children}
    </StoryChatContext.Provider>
  );
};

export const useStoryChatContext = () => {
  const context = useContext(StoryChatContext);
  if (!context) {
    throw new Error('useStoryChatContext must be used within a StoryChatProvider');
  }
  return context;
};
