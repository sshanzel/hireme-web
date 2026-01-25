export interface Story {
  id: string;
  title: string;
  context: string;
  actions: string;
  impact: string;
  constraints?: string;
  tags?: string[];
}

export type ExperienceType = 'work' | 'education';

export interface Experience {
  id: string;
  type: ExperienceType;
  organization: string;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string;
  stories: Story[];
}
