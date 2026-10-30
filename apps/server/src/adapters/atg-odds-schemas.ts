import { z } from 'zod';

export const AtgGamePoolStartSchema = z.object({
  id: z.string().optional(),
  number: z.number(),
  postPosition: z.number().optional(),
  distance: z.number().optional(),
  pools: z
    .record(
      z.object({
        odds: z.number().nullable().optional(),
        minOdds: z.number().nullable().optional(),
        maxOdds: z.number().nullable().optional(),
        betDistribution: z.number().nullable().optional(),
      })
    )
    .optional(),
});

export const AtgGameRaceSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  date: z.string().optional(),
  number: z.number(),
  distance: z.number().optional().default(2140),
  startMethod: z.string().optional().default('auto'),
  startTime: z.string().optional(),
  scheduledStartTime: z.string().optional(),
  track: z
    .object({
      id: z.union([z.number(), z.string()]).optional(),
      name: z.string().optional(),
    })
    .optional(),
  starts: z.array(AtgGamePoolStartSchema).optional().default([]),
});

export const AtgGameResponseSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  type: z.string().optional(),
  pools: z.record(z.unknown()).optional(),
  races: z.array(AtgGameRaceSchema).optional().default([]),
});

export type AtgGameResponse = z.infer<typeof AtgGameResponseSchema>;
