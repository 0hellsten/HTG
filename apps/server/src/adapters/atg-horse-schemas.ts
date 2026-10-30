import { z } from 'zod';
import { AtgKmTimeSchema, AtgShoeInfoSchema, AtgPedigreeParentSchema } from './atg-base-schemas.js';

export const AtgHorseProfileSchema = z.object({
  id: z.union([z.number(), z.string()]).transform(String),
  name: z.string(),
  age: z.number().optional(),
  sex: z.string().optional(),
  color: z.string().optional(),
  breed: z.string().optional(),
  money: z.number().optional().default(0),
  homeTrack: z
    .object({
      id: z.union([z.number(), z.string()]).optional(),
      name: z.string().optional(),
    })
    .optional(),
  owner: z
    .object({
      id: z.union([z.number(), z.string()]).optional(),
      name: z.string().optional(),
    })
    .optional(),
  breeder: z
    .object({
      id: z.union([z.number(), z.string()]).optional(),
      name: z.string().optional(),
      location: z.string().optional(),
    })
    .optional(),
  trainer: z
    .object({
      id: z
        .union([z.number(), z.string()])
        .optional()
        .transform((v) => (v ? String(v) : undefined)),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      name: z.string().optional(),
      license: z.string().optional(),
    })
    .optional(),
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
});

export type AtgHorseProfile = z.infer<typeof AtgHorseProfileSchema>;

export const AtgHorseResultRecordSchema = z.object({
  date: z.string(),
  place: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v !== undefined ? String(v) : undefined)),
  scratched: z.boolean().optional(),
  galloped: z.boolean().optional(),
  disqualified: z.boolean().optional(),
  oddsCode: z.string().optional(),
  odds: z.number().nullable().optional(),
  kmTime: AtgKmTimeSchema.nullable().optional(),
  race: z
    .object({
      id: z.string().optional(),
      sport: z.string().optional(),
      type: z.string().optional().default('regular'),
      number: z.number().optional(),
      startMethod: z.string().optional().default('auto'),
      firstPrize: z.number().optional().default(0),
    })
    .optional(),
  track: z.object({
    id: z.union([z.number(), z.string()]).optional(),
    name: z.string(),
  }),
  start: z
    .object({
      distance: z.number().optional().default(2140),
      postPosition: z.number().optional(),
      driver: z
        .object({
          id: z.union([z.number(), z.string()]).optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          shortName: z.string().optional(),
        })
        .optional(),
      horse: z
        .object({
          shoes: z
            .object({
              front: z.union([z.boolean(), AtgShoeInfoSchema]).optional(),
              back: z.union([z.boolean(), AtgShoeInfoSchema]).optional(),
            })
            .optional(),
          sulky: z
            .object({
              type: z
                .object({
                  code: z.string().optional(),
                  text: z.string().optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
});

export const AtgHorseResultsSchema = z.object({
  records: z.array(AtgHorseResultRecordSchema).optional().default([]),
});

export type AtgHorseResults = z.infer<typeof AtgHorseResultsSchema>;
