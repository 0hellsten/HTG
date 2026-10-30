import { z } from 'zod';

export const SmhiWeatherSchema = z.object({
  approvedTime: z.string().optional(),
  referenceTime: z.string().optional(),
  timeSeries: z.array(
    z.object({
      time: z.string(),
      data: z.object({
        air_temperature: z.number().optional(),
        wind_speed: z.number().optional(),
        precipitation_amount_mean: z.number().optional(),
        symbol_code: z.number().optional(),
      }),
    })
  ),
});

export type SmhiWeatherResponse = z.infer<typeof SmhiWeatherSchema>;

export function getSymbolDescription(code?: number): string {
  switch (code) {
    case 1:
      return 'Klart';
    case 2:
      return 'Lätt molnighet';
    case 3:
      return 'Halvklart';
    case 4:
      return 'Molnigt';
    case 5:
      return 'Mycket moln';
    case 6:
      return 'Mulet';
    case 7:
      return 'Dimma';
    case 8:
      return 'Lätta regnskurar';
    case 9:
      return 'Måttliga regnskurar';
    case 10:
      return 'Kraftiga regnskurar';
    case 11:
      return 'Åskskurar';
    case 18:
      return 'Lätt regn';
    case 19:
      return 'Måttligt regn';
    case 20:
      return 'Kraftigt regn';
    case 25:
      return 'Lätt snöfall';
    case 26:
      return 'Måttligt snöfall';
    case 27:
      return 'Kraftigt snöfall';
    default:
      return 'Uppehåll och växlande molnighet';
  }
}
