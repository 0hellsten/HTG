import { z } from 'zod';
import {
  AtgTrackRaceSummarySchema,
  AtgTrackSchema,
  AtgGameSchema,
  AtgCalendarRaceSchema,
  AtgCalendarDaySchema,
  AtgCalendarDay,
} from './atg-calendar-schemas.js';

export {
  AtgTrackRaceSummarySchema,
  AtgTrackSchema,
  AtgGameSchema,
  AtgCalendarRaceSchema,
  AtgCalendarDaySchema,
};
export type { AtgCalendarDay };

import {
  AtgShoeInfoSchema,
  AtgPersonRefSchema,
  AtgPedigreeParentSchema,
  AtgKmTimeSchema,
} from './atg-base-schemas.js';

export { AtgShoeInfoSchema, AtgPersonRefSchema, AtgPedigreeParentSchema, AtgKmTimeSchema };

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
    homeTrack: z
      .union([
        z.string(),
        z.object({
          id: z.union([z.number(), z.string()]).optional(),
          name: z.string().optional(),
        }),
      ])
      .optional()
      .transform((v) => (typeof v === 'string' ? v : v?.name)),
    owner: z
      .union([z.string(), z.object({ name: z.string().optional() })])
      .optional()
      .transform((v) => (typeof v === 'string' ? { name: v } : v)),
    breeder: z
      .union([z.string(), z.object({ name: z.string().optional() })])
      .optional()
      .transform((v) => (typeof v === 'string' ? { name: v } : v)),
    trainer: AtgPersonRefSchema.optional(),
    pedigree: z
      .object({
        father: AtgPedigreeParentSchema.optional(),
        mother: AtgPedigreeParentSchema.optional(),
        grandfather: AtgPedigreeParentSchema.optional(),
      })
      .optional(),
    statistics: z
      .object({
        life: z
          .object({
            starts: z.number().optional().default(0),
            earnings: z.number().optional().default(0),
            placement: z.record(z.number()).optional().default({}),
            winPercentage: z.number().optional().default(0),
            placePercentage: z.number().optional().default(0),
            earningsPerStart: z.number().optional().default(0),
            records: z
              .array(
                z.object({
                  code: z.string().optional(),
                  startMethod: z.string().optional(),
                  distance: z.string().optional(),
                  time: AtgKmTimeSchema.optional(),
                })
              )
              .optional()
              .default([]),
          })
          .optional(),
      })
      .optional(),
    records: z
      .object({
        auto: z.string().optional(),
        volt: z.string().optional(),
      })
      .optional(),
    record: z
      .object({
        code: z.string().optional(),
        startMethod: z.string().optional(),
        time: AtgKmTimeSchema.optional(),
      })
      .optional(),
    shoes: z
      .object({
        reported: z.boolean().optional(),
        front: AtgShoeInfoSchema.optional(),
        back: AtgShoeInfoSchema.optional(),
      })
      .optional(),
    sulky: z
      .object({
        reported: z.boolean().optional(),
        type: z
          .object({
            code: z.string().optional(),
            text: z.string().optional(),
          })
          .optional(),
        colour: z
          .object({
            code: z.string().optional(),
            text: z.string().optional(),
          })
          .optional(),
        color: z
          .union([z.string(), z.object({ text: z.string().optional() })])
          .optional()
          .transform((v) => (typeof v === 'object' && v ? v.text : v)),
      })
      .optional(),
    money: z.number().optional(),
  }),
  driver: AtgPersonRefSchema.optional(),
  shoes: z
    .object({
      front: AtgShoeInfoSchema.optional(),
      back: AtgShoeInfoSchema.optional(),
    })
    .optional(),
  sulky: z
    .object({
      type: z.object({ text: z.string().optional() }).optional(),
      color: z
        .union([z.string(), z.object({ text: z.string().optional() })])
        .optional()
        .transform((v) => (typeof v === 'object' && v ? v.text : v)),
    })
    .optional(),
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
  scheduledStartTime: z.string().optional(),
  status: z.string().optional().default('upcoming'),
  purse: z.string().optional(),
  prize: z.string().optional(),
  terms: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (Array.isArray(v) ? v.join('. ') : v)),
  track: AtgTrackSchema.optional(),
  starts: z.array(AtgStartSchema).optional().default([]),
});

export type AtgRaceDetail = z.infer<typeof AtgRaceDetailSchema>;

export {
  AtgHorseProfileSchema,
  AtgHorseResultRecordSchema,
  AtgHorseResultsSchema,
} from './atg-horse-schemas.js';
export type { AtgHorseProfile, AtgHorseResults } from './atg-horse-schemas.js';
