---
description: Kodstandard, struktur, felhantering, tester och arbetssätt för Stallbacken.
trigger: always_on
---

# Regel: kod, kvalitet och arbetssätt

## Stack — låst

React 18 + TypeScript + Vite (PWA) · Tailwind · TanStack Query ·
Node 20 + TypeScript + Fastify · SQLite (`better-sqlite3`) · zod · Vitest · Playwright · pnpm workspaces.

Byt inte stack, lägg inte till tunga beroenden, och introducera inte ett ramverk till utan att fråga först.
Varje nytt beroende ska motiveras i en mening i commit-meddelandet.

## Struktur

```
apps/web/src/screens|components|lib
apps/server/src/adapters|collect|db|routes|health|lib
packages/shared/src/types|constants
docs/
data/            SQLite — gitignorerad
```

- **Frontend pratar bara med egen backend.** Aldrig ett direkt anrop till en extern adress från webben.
- **Delade typer bor i `packages/shared`.** Duplicera aldrig en typ mellan web och server.
- En adapter per fil. Filnamn = källans id, t.ex. `atg-racinginfo.ts`.

## TypeScript

- `strict: true`. **Inga `any`** i produktionskod. `unknown` + zod i stället.
- Inga `@ts-ignore` utan kommentar på raden ovanför som förklarar varför.
- Exportera typer explicit. Inga implicita returtyper på publika funktioner.
- Datum hanteras som ISO 8601-strängar i lagret, formateras först i UI.

## Felhantering — projektets viktigaste regel

**Ett fel i en del får aldrig ta ner en annan.**

- Varje adapter fångar allt internt och returnerar `SourceResult` med `status: 'failed'`. Den kastar aldrig.
- Varje insamlingsjobb kör i egen try/catch och loggar resultatet i `source_health`.
- Varje vy i frontend har en egen felgräns (error boundary) per block, inte per sida.
- Ett trasigt block renderas som den lugna "uppgiften saknas"-raden med grå prick. Resten av sidan lever.
- Fastify-routes returnerar alltid `200` med ett nyttolastobjekt som innehåller status — aldrig
  ett råfel upp till klienten.

```ts
// Så här ser ett route-svar alltid ut
{ data: T | null, status: SourceStatus, fetchedAt: string, message: string }
```

- Loggning sker via `apps/server/src/lib/logger.ts`. **Inga `console.log` i produktionskod.**
- Tekniska detaljer loggas — de når aldrig gränssnittet.

## Data

- All extern data valideras med zod före skrivning till databasen.
- Databasändringar sker via numrerade migrationer i `apps/server/src/db/migrations/`,
  t.ex. `003_lagg_till_banstatistik.sql`. Ändra aldrig en migration som redan körts.
- Varje tabell har `created_at` och `updated_at`.
- Varje hämtad post har `source_id` och `fetched_at` — vi ska alltid kunna svara på var en siffra kom ifrån.
- **Skriv aldrig över bra data med sämre.** Saknas fält i ett nytt svar, behåll det gamla värdet.

## Hittepå är förbjudet

- Fyll aldrig i ett värde du inte faktiskt hämtat. Saknas det — lämna tomt och markera som saknat.
- Gissa aldrig fram en kilometertid, ett odds, en placering eller en statistik.
- Mockdata får bara finnas i tester och ska namnges `mock*`. Den får aldrig nå en körande app.
- Om en källa inte går att nå: säg det. Fabricera inte en rimlig siffra.

## Tester

- **Varje adapter:** minst ett test för lyckat svar, ett för trasigt svar, ett för oväntat format.
- **Hälsologiken:** test för varje övergång mellan `ok`, `stale`, `degraded`, `failed`.
- **Flödestest (Playwright):** öppna appen med en källa avstängd och verifiera att resten fungerar
  och att rätt prick visas. Det här testet är obligatoriskt och får aldrig tas bort.
- Enhetstester för all formatering (tid, pengar, kilometertid, datum).
- Testerna ska gå att köra utan nätverk. Externa svar ligger som sparade exempel i `apps/server/test/fixtures/`.

## Kodhygien

- Filer över 300 rader delas upp. Funktioner över 50 rader delas upp.
- Kod, variabler, typer och funktioner på **engelska**. Kommentarer och commit-meddelanden på **svenska**.
- Kommentera varför, inte vad.
- Inga oanvända exports, ingen utkommenterad kod, inga kvarlämnade TODO utan datum och initialer.
- Formatering med Prettier, linting med ESLint. Båda ska vara gröna före commit.

## Säkerhet

- Inga hemligheter i repot. `.env` är gitignorerad, `.env.example` är incheckad.
- Inga användarkonton, ingen inloggning, ingen analys, inga tredjepartsspårare, inga externa typsnitt.
- Loggar innehåller aldrig personuppgifter.
- Beroenden hålls få och välkända.

## Arbetssätt

1. **Planera först.** Implementationsplan som artifact, invänta godkännande innan kod skrivs.
2. **En fas i taget.** Varje fas slutar i ett läge där appen går att starta och klicka runt i.
3. **Verifiera i browsern** efter varje UI-fas. Skärmbilder på 390×844 och 1440×900 som artifacts.
4. **Commit per fas**, svenskt meddelande i formen `fas 3: hämta startlistor och visa loppkort`.
5. Aldrig `git push --force`, aldrig omskriven historik, aldrig `rm -rf` utanför projektmappen,
   aldrig en destruktiv databasoperation utan att fråga.
6. Samla frågor och ställ dem i klump. Avbryt inte ett pågående bygge för en fråga som kan vänta.
7. Lämna en kort svensk sammanfattning efter varje fas: vad som byggdes, vad som fungerar,
   vad som återstår, vad du är osäker på.
