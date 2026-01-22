export interface Story {
  id: string;
  title: string;
  context: string;
  actions: string;
  impact: string;
  constraints?: string;
  traits: string[];
}

export interface Experience {
  id: string;
  organization: string;
  title: string;
  startDate: string;
  endDate: string | null;
  description: string;
  stories: Story[];
}
