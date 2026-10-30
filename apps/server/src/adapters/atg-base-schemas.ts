import { z } from 'zod';

export const AtgShoeInfoSchema = z.object({
  hasShoe: z.boolean().optional(),
  changed: z.boolean().optional(),
});

export const AtgPersonRefSchema = z.object({
  id: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => (v ? String(v) : undefined)),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  shortName: z.string().optional(),
  silks: z.string().optional(),
});

export const AtgPedigreeParentSchema = z.object({
  id: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => (v ? String(v) : undefined)),
  name: z.string().optional(),
  nationality: z.string().optional(),
});

export const AtgKmTimeSchema = z.object({
  minutes: z.number().optional(),
  seconds: z.number().optional(),
  tenths: z.number().optional(),
  code: z.string().optional(),
});
