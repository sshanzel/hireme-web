import {z} from 'zod';

const urlSchema = z
  .string()
  .refine(val => val === '' || z.url().safeParse(val).success, {
    message: 'Must be a valid URL',
  })
  .optional();

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  githubUrl: urlSchema,
  linkedinUrl: urlSchema,
  twitterUrl: urlSchema,
  websiteUrl: urlSchema,
});

export type ProfileFormData = z.infer<typeof profileSchema>;
