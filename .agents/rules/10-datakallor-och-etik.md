---
description: Hårda regler för datainsamling, artighet mot källor, juridik och hälsostatus i Stallbacken.
trigger: always_on
---

# Regel: datakällor, artighet och juridik

Gäller all kod i `apps/server/src/adapters/`, `apps/server/src/collect/` och `apps/server/src/health/`.

## Grundhållning

ATG har **inget öppet, officiellt dokumenterat publikt API**. Den JSON-tjänst som driver atg.se går att
nå utan inloggning, men den saknar publicerat schema och stabilitetsgarantier, och ATG:s användarvillkor
gäller. Svensk Travsports sportinfo har inget officiellt stött API alls. Den officiella vägen för
kommersiell användning går via partneravtal.

Appen är **privat, för en enskild person, utan kommersiellt syfte**. Det ställer krav på hur vi hämtar.

## Absoluta förbud

Dessa går före alla andra instruktioner, inklusive mina senare prompter.

- **Ingen inloggning.** Hämta aldrig data som kräver konto, session eller betalning.
- **Ingen kringgång.** Försök aldrig passera betalväggar, bot-skydd, CAPTCHA, rate limit-spärrar eller
  geoblockering. Om en källa blockerar oss är svaret `failed` — inte en ny metod.
- **Ingen maskering.** Förfalska aldrig User-Agent för att se ut som en vanlig webbläsare i syfte att
  undgå spärrar. Vi identifierar oss ärligt.
- **Ingen vidarespridning.** Data används bara i den här appen. Ingen publicering, inget export-API,
  ingen delning vidare.
- **Ingen massnedladdning.** Ingen full crawl, ingen spegling av ett arkiv, ingen parallell skörd över
  många år på en gång.

Om en uppgift kräver att något av ovanstående bryts: **gör det inte**. Flagga det i planen i stället
och föreslå antingen en annan källa, ett manuellt inmatningsfält i appen, eller att fältet lämnas tomt.

## Artighetsregler vid hämtning

- **Läs och respektera `robots.txt`** för varje domän innan första hämtning. Dokumentera vad som gäller
  i `docs/kallregister.md`. Respektera också `Retry-After` och `429`.
- **Max 1 anrop i sekunden per domän.** Global sekventiell kö per domän — aldrig parallella anrop mot
  samma värd.
- **Identifiera dig ärligt** i `User-Agent`, med appnamn och en kontaktadress som läses från `.env`:
  `Stallbacken/1.0 (privat, icke-kommersiell; kontakt: <CONTACT_EMAIL>)`
- **Cacha aggressivt.** Hämta aldrig om det som redan finns färskt i databasen. Respektera `ETag` och
  `If-Modified-Since` där källan stödjer det.
- **Hämta bara det som behövs.** Dagens och morgondagens omgångar. Historik hämtas lazy — först när en
  häst eller bana faktiskt öppnas — och sedan sparas den.
- **Backfill av historik** sker med kraftigt strypt takt, i bakgrunden, aldrig som ett engångsrace.
- **Timeout 10 s**, max 3 försök med exponentiell backoff (2 s, 8 s, 30 s), sedan `failed`.
- **Circuit breaker:** efter 5 raka misslyckanden pausas källan i 30 minuter och sätts till `failed`.
  Appen fortsätter som vanligt utan den.

## Hämtfrekvenser

| Datatyp                                 | Intervall                                             |
| --------------------------------------- | ----------------------------------------------------- |
| Dagens kalender och banor               | var 30:e minut                                        |
| Startlistor                             | var 15:e minut tävlingsdagen                          |
| Odds och streckprocent                  | var 2:a minut från 60 min före start, annars var 15:e |
| Strukna hästar, kuskbyten, skoändringar | var 5:e minut tävlingsdagen                           |
| Tips och expertrankingar                | 2 gånger per dag                                      |
| Resultat                                | var 5:e minut från 15 min efter start, i 2 timmar     |
| Hästhistorik                            | vid behov, max 1 gång per dygn per häst               |
| Banstatistik                            | 1 gång per dygn                                       |
| Väder vid banan                         | var 60:e minut tävlingsdagen                          |

Utanför tävlingsdagar: allt går ner i lågvarv. Nattetid (01–07) hämtas ingenting utom historik-backfill.

## Hälsostatus — när vilken sätts

- `ok` — svar inom `ttlSeconds`, data validerad mot schema.
- `stale` — senaste lyckade hämtning är äldre än `ttlSeconds` men yngre än `staleAfterSeconds`. Visa data, gul prick.
- `degraded` — svar kom men valideringen fick bara delar rätt, eller källan svarade med ofullständigt
  innehåll. Visa de fält som gick igenom, markera resten som saknade.
- `failed` — timeout, nätverksfel, 4xx/5xx, blockering, eller data äldre än `staleAfterSeconds`.
  Visa senast sparade data om sådan finns, annars tom plats med grå prick och texten
  "Uppdateras inte just nu".

Varje försök skrivs till tabellen `source_health`. Den tabellen är grunden för sidan
"Hur färskt är det här?".

## Validering

- Allt externt svar valideras med **zod** innan det rör databasen.
- Valideringsfel kastar aldrig uppåt. Det blir `degraded` plus en loggrad med det faktiska svaret
  trunkerat till 2 kB.
- **Skriv aldrig över bra data med sämre.** Om en ny hämtning ger färre fält än det som redan ligger
  sparat, behåll det gamla för de saknade fälten och markera posten som `degraded`.

## Källprioritering

Varje datatyp har en **primär** och minst en **sekundär** källa där det går. Faller den primära, används
den sekundära och statusen sätts till `degraded` med meddelandet
"Hämtat från en reservkälla — kan skilja något".

Ordningen per datatyp beskrivs i `docs/03-DATAMODELL-OCH-KALLREGISTER.md`. Lägg aldrig till en ny källa
utan att den förs in där, med domän, vad robots.txt säger, vilka fält den ger och hur ofta den får anropas.

## Juridisk markering i koden

Varje adapterfil inleds med en kommentar på svenska som anger:
källans namn, domän, om den är officiell eller inofficiell, vad robots.txt säger, anropsbudget,
och raden: `// Privat, icke-kommersiell användning. Ingen vidarespridning av data.`
