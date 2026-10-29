// Zod-scheman för validering av ATG:s odds- och speldata
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

import { z } from 'zod';

export const AtgWinnerOddsItemSchema = z.object({
  startNumber: z.number(),
  odds: z.number().nullable().optional(),
});

export const AtgPlaceOddsItemSchema = z.object({
  startNumber: z.number(),
  minOdds: z.number().nullable().optional(),
  maxOdds: z.number().nullable().optional(),
});

export const AtgStakeDistributionItemSchema = z.object({
  startNumber: z.number(),
  percent: z.number().nullable().optional(),
});

export const AtgOddsPoolsSchema = z.object({
  vinnare: z
    .object({
      odds: z.array(AtgWinnerOddsItemSchema).optional().default([]),
    })
    .optional(),
  plats: z
    .object({
      odds: z.array(AtgPlaceOddsItemSchema).optional().default([]),
    })
    .optional(),
  streck: z
    .object({
      distribution: z.array(AtgStakeDistributionItemSchema).optional().default([]),
    })
    .optional(),
});

export const AtgOddsResponseSchema = z.object({
  id: z.string().optional(),
  raceId: z.string(),
  gameType: z.string().optional().default('Vinnare'),
  status: z.string().optional(),
  recordedAt: z.string().optional(),
  pools: AtgOddsPoolsSchema.optional(),
});

export type AtgOddsResponse = z.infer<typeof AtgOddsResponseSchema>;
