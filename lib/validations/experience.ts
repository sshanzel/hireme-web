import {z} from 'zod';

export const experienceSchema = z
  .object({
    organization: z.string().min(1, 'Organization name is required'),
    title: z.string().min(1, 'Title is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string(),
    isCurrentRole: z.boolean(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
  })
  .refine(
    (data) => {
      if (!data.isCurrentRole && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date is required unless this is your current role',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

export type ExperienceFormData = z.infer<typeof experienceSchema>;
