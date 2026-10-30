import { z } from 'zod';

export const AtgTrackRaceSummarySchema = z.object({
  id: z.string(),
  number: z.number(),
  status: z.string().optional(),
  startTime: z.string().optional(),
  name: z.string().optional(),
  distance: z.number().optional().default(2140),
  startMethod: z.string().optional().default('auto'),
});

export const AtgTrackSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  name: z.string(),
  countryCode: z.string().optional().default('SE'),
  condition: z.string().optional(),
  startTime: z.string().optional(),
  biggestGameType: z.string().optional(),
  races: z.array(AtgTrackRaceSummarySchema).optional().default([]),
});

export const AtgGameSchema = z.object({
  id: z.string().optional(),
  startTime: z.string().optional(),
  scheduledStartTime: z.string().optional(),
  trackId: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => (v ? String(v) : undefined)),
  tracks: z
    .array(z.union([z.number(), z.string()]))
    .optional()
    .default([])
    .transform((arr) => arr.map(String)),
  races: z.array(z.string()).optional().default([]),
  jackpotAmount: z.number().optional(),
  estimatedJackpot: z.number().optional(),
});

export const AtgCalendarRaceSchema = z.object({
  id: z.string(),
  number: z.number(),
  name: z.string().optional(),
  startTime: z.string(),
  status: z.string().optional(),
  distance: z.number().optional().default(2140),
  startMethod: z.string().optional().default('auto'),
  track: z
    .object({
      id: z.union([z.number(), z.string()]).transform(String),
      name: z.string().optional(),
    })
    .optional(),
});

export const AtgCalendarDaySchema = z.object({
  date: z.string(),
  tracks: z.array(AtgTrackSchema).optional().default([]),
  games: z.record(z.array(AtgGameSchema)).optional().default({}),
  races: z.array(AtgCalendarRaceSchema).optional().default([]),
});

export type AtgCalendarDay = z.infer<typeof AtgCalendarDaySchema>;
