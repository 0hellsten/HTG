// Zod-scheman för validering av ATG:s externa JSON-svar
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { z } from 'zod';

export const AtgTrackSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  name: z.string(),
  countryCode: z.string().optional().default('SE'),
  condition: z.string().optional(),
});

export const AtgGameSchema = z.object({
  id: z.string().optional(),
  startTime: z.string().optional(),
  trackId: z.union([z.number(), z.string()]).optional().transform((v) => (v ? String(v) : undefined)),
  races: z.array(z.string()).optional().default([]),
});

export const AtgCalendarRaceSchema = z.object({
  id: z.string(),
  number: z.number(),
  name: z.string().optional(),
  startTime: z.string(),
  status: z.string().optional(),
  distance: z.number().optional().default(2140),
  startMethod: z.string().optional().default('auto'),
  track: z.object({
    id: z.union([z.number(), z.string()]).transform(String),
    name: z.string().optional(),
  }).optional(),
});

export const AtgCalendarDaySchema = z.object({
  date: z.string(),
  tracks: z.array(AtgTrackSchema).optional().default([]),
  games: z.record(z.array(AtgGameSchema)).optional().default({}),
  races: z.array(AtgCalendarRaceSchema).optional().default([]),
});

export type AtgCalendarDay = z.infer<typeof AtgCalendarDaySchema>;

export const AtgShoeInfoSchema = z.object({
  hasShoe: z.boolean().optional(),
  changed: z.boolean().optional(),
});

export const AtgStartSchema = z.object({
  number: z.number(),
  postPosition: z.number().optional(),
  distance: z.number().optional(),
  horse: z.object({
    id: z.union([z.number(), z.string()]).transform(String),
    name: z.string(),
    age: z.number().optional(),
    sex: z.string().optional(),
    color: z.string().optional(),
    owner: z.object({ name: z.string().optional() }).optional(),
    trainer: z.object({
      id: z.union([z.number(), z.string()]).optional().transform((v) => (v ? String(v) : undefined)),
      name: z.string().optional(),
    }).optional(),
    records: z.object({
      auto: z.string().optional(),
      volt: z.string().optional(),
    }).optional(),
    money: z.number().optional(),
  }),
  driver: z.object({
    id: z.union([z.number(), z.string()]).optional().transform((v) => (v ? String(v) : undefined)),
    name: z.string().optional(),
  }).optional(),
  shoes: z.object({
    front: AtgShoeInfoSchema.optional(),
    back: AtgShoeInfoSchema.optional(),
  }).optional(),
  sulky: z.object({
    type: z.object({ text: z.string().optional() }).optional(),
    color: z.string().optional(),
  }).optional(),
  scratched: z.boolean().optional().default(false),
  scratchReason: z.string().optional(),
});

export const AtgRaceDetailSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  number: z.number(),
  distance: z.number().optional().default(2140),
  startMethod: z.string().optional().default('auto'),
  startTime: z.string(),
  status: z.string().optional().default('upcoming'),
  purse: z.string().optional(),
  terms: z.string().optional(),
  track: AtgTrackSchema.optional(),
  starts: z.array(AtgStartSchema).optional().default([]),
});

export type AtgRaceDetail = z.infer<typeof AtgRaceDetailSchema>;
