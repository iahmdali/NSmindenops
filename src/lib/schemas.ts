import { z } from 'zod';

export const reportSchema = z.object({
  operatorName: z.string().min(2, { message: 'Operator name is required.' }),
  date: z.date({
    required_error: 'A date for the report is required.',
  }),
  shift: z.coerce.number().min(1).max(3),
  materialId: z.string().optional(),
  tasksCompleted: z.coerce.number().optional(),
  downtime: z.coerce.number().optional(),
  comments: z.string().optional(),
  leadComments: z.string().optional(),
});
