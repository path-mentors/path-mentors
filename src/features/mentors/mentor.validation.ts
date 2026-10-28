import { z } from 'zod';

export const mentorApplicationSchema = z.object({
  field: z.string().min(2, 'Field is required'),
  current_position: z.string().min(2, 'Current role/position is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  bio: z.string().optional(),
  availability: z.string().optional(),
});

export type MentorApplicationDTO = z.infer<typeof mentorApplicationSchema>;