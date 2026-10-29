// Zod-scheman för validering av ATG:s externa JSON-svar
// Privat, icke-kommersiell användning. Ingen vidarespridning av data.

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
  trackId: z
    .union([z.number(), z.string()])
    .optional()
    .transform((v) => (v ? String(v) : undefined)),
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
    owner: z
      .union([z.string(), z.object({ name: z.string().optional() })])
      .optional()
      .transform((v) => (typeof v === 'string' ? { name: v } : v)),
    trainer: AtgPersonRefSchema.optional(),
    records: z
      .object({
        auto: z.string().optional(),
        volt: z.string().optional(),
      })
      .optional(),
    record: z.unknown().optional(),
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
      color: z.union([z.string(), z.object({ text: z.string().optional() })]).optional().transform((v) => (typeof v === 'object' && v ? v.text : v)),
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

// Scheman för Hästprofil (horses/{id})
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

// Scheman för Hästresultat (horses/{id}/results)
export const AtgHorseResultRecordSchema = z.object({
  date: z.string(),
  place: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v !== undefined ? String(v) : undefined)),
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
