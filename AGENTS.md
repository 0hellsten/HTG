# AGENTS.md — Stallbacken

Projektets grundlag. Läs den vid varje sessionsstart. Vid konflikt gäller filerna i `.agents/rules/` före denna.

## Vad projektet är

**Stallbacken** är en privat travapp byggd åt en enskild person: en travkunnig man i 70-årsåldern som är
helt ointresserad av teknik. Den samlar startlistor, tips, odds, form, tidigare lopp och banstatistik
från flera källor och visar det i ett lugnt, läsbart gränssnitt.

Den ska gå att använda på **Android-mobil** och **bärbar dator**. Den säljs inte, publiceras inte och
har inga användarkonton.

## Den bärande principen

ATG har inget öppet, dokumenterat publikt API. Data kommer därför från flera håll, och **delar kommer
att gå sönder**. Appen är byggd för att fungera ändå.

> Att en källa slutar svara är ett **normalt driftläge**, inte ett fel. Appen visar det den har,
> markerar det som saknas, och fortsätter.

Tre krav som aldrig får brytas:

1. En trasig källa får aldrig påverka en annan del av appen.
2. Varje block som bygger på en källa visar sin färskhet med en diskret prick.
3. Användaren får aldrig se en felkod, en stacktrace, ett engelskt felmeddelande eller ordet "API".

## Stack

| Lager          | Val                                            |
| -------------- | ---------------------------------------------- |
| Frontend       | React 18 + TypeScript + Vite, installerbar PWA |
| Styling        | Tailwind CSS                                   |
| State/data     | TanStack Query                                 |
| Backend        | Node 20 + TypeScript + Fastify                 |
| Databas        | SQLite via `better-sqlite3`                    |
| Schemaläggning | Intern scheduler i backend                     |
| Paketering     | pnpm workspaces                                |
| Tester         | Vitest (enhet), Playwright (flöde)             |

## Mappstruktur

```
apps/web/          React-PWA
  src/screens/     En mapp per vy
  src/components/  Delade komponenter
  src/lib/         API-klient, formatering, hooks
apps/server/
  src/adapters/    En fil per datakälla
  src/collect/     Scheduler och insamlingsjobb
  src/db/          Schema, migrationer, queries
  src/routes/      Fastify-routes
  src/health/      Källhälsa och statuslogik
packages/shared/   Typer och konstanter som delas
docs/              Specifikationer — läs före planering
data/              SQLite-filen (gitignorerad)
```

## Adapterkontraktet

Varje datakälla är en adapter. Alla ser likadana ut utåt:

```ts
type SourceStatus = 'ok' | 'stale' | 'degraded' | 'failed';

interface SourceResult<T> {
  sourceId: string; // 'atg-racinginfo', 'svensk-travsport', ...
  status: SourceStatus;
  data: T | null; // null endast vid 'failed'
  fetchedAt: string; // ISO 8601
  ageSeconds: number;
  message: string; // kort, svensk, begriplig för en icke-tekniker
  detail?: string; // teknisk orsak — loggas, visas aldrig i UI
}

interface SourceAdapter<T> {
  id: string;
  label: string; // visningsnamn på svenska
  ttlSeconds: number; // hur länge data räknas som färskt
  staleAfterSeconds: number;
  fetch(ctx: FetchContext): Promise<SourceResult<T>>;
}
```

Regler för adaptrar:

- En adapter **kastar aldrig uppåt**. Den fångar allt och returnerar `status: 'failed'` med `data: null`.
- En adapter har **timeout** (10 s), **retry med exponentiell backoff** (max 3 försök) och **respekterar Retry-After**.
- En adapter skriver alltid en rad i `source_health` — både vid lyckat och misslyckat försök.
- En adapter känner inte till UI och UI känner inte till adapterns interna format. Översättning sker i ett normaliseringssteg.
- Nya källor läggs till genom att registrera en adapter i `src/adapters/index.ts`. Ingen annan fil ska behöva ändras.

## Statuslogik i gränssnittet

| Status      | Prick  | Text i UI                           |
| ----------- | ------ | ----------------------------------- |
| `ok`        | ● grön | Inget visas — färskt är normalläget |
| `stale`     | ● gul  | "Uppdaterat för X minuter sedan"    |
| `degraded`  | ● gul  | "Delvis uppdaterat"                 |
| `failed`    | ○ grå  | "Uppdateras inte just nu"           |
| saknas helt | ○ grå  | "Den här uppgiften saknas"          |

Pricken sitter diskret i blockets rubrikrad. Vid tryck/klick öppnas en kort mening på svenska plus en
**"Försök igen"**-knapp. Ingen modal, ingen varningsfärg, inget utropstecken. Det ska kännas som en
upplysning, inte som ett larm.

Sidan **"Hur färskt är det här?"** listar alla källor med namn på svenska, status och senaste hämtning.
Det är den enda plats i appen där källor nämns vid namn.

## Språk

- **Allt** i gränssnittet är svenska. Även datum, tider, tal och felmeddelanden.
- Tonfall: lugn, kunnig, varm. Som en vän på stallbacken — inte ett spelbolag, inte en databas.
- **Travord används diskret som krydda.** "Dagens spik", "Form i backspegeln", "Ryggar och lägen",
  "Banvisaren", "Skrällkandidat". Sporttermer i data (volt, auto, galopp, diskad, barfota, kilometertid,
  streck) används rakt av — dem kan han.
- Förbjudet i UI: API, fetch, endpoint, request, timeout, cache, parse, null, undefined, error,
  JSON, scraping, adapter, 404, 500.
- Tider skrivs `14:35`, datum `lör 8 nov`, kilometertider `1.12,3a`, pengar `1 245 300 kr`.
- Tips har **alltid** en synlig avsändare: "Tips från X".

## Tillgänglighet (icke förhandlingsbart)

- Brödtext minst 17 px på mobil, 16 px på laptop. Rubriker rejält större.
- Klickytor minst 44×44 px.
- Kontrast minst 4,5:1. Aldrig färg som enda informationsbärare — pricken har alltid text eller symbol också.
- Fungerar i liggande och stående läge.
- Fungerar utan nät: visar senast sparade data, tydligt märkt med när den hämtades.
- Inga animationer som rör sig av sig själva. Inga autospelande ljud eller videor.
- Hela appen ska gå att använda med en tumme på en mobil och med tangentbord på laptopen.

## Kodregler

- **TypeScript strict.** Inga `any` i produktionskod. Inga `@ts-ignore` utan kommentar som förklarar varför.
- All extern data valideras med **zod** innan den rör databasen. Oväntat format = `degraded`, inte krasch.
- Inga `console.log` i produktionskod — använd loggern i `apps/server/src/lib/logger.ts`.
- Filer över 300 rader delas upp. Funktioner över 50 rader delas upp.
- Databasändringar sker alltid via numrerade migrationer i `apps/server/src/db/migrations/`.
- Varje adapter har minst ett test för lyckat svar och ett för trasigt svar.
- Kommentarer på svenska. Kod, variabelnamn och typer på engelska.

## Säkerhet och drift

- Inga hemligheter i repot. All konfiguration via `.env`, med `.env.example` incheckad.
- Backend är den enda som pratar med externa källor. Frontend anropar aldrig en extern adress direkt.
- SQLite-filen ligger i `data/` och är gitignorerad. Backup-script ska finnas.
- Loggar innehåller aldrig personuppgifter.

## Arbetssätt

- **Planera först.** Lämna implementationsplan som artifact och invänta godkännande innan kod skrivs.
- **En fas i taget.** Varje fas slutar i ett körbart läge.
- **Verifiera i browsern** efter varje UI-fas. Skärmbilder på 390×844 och 1440×900 som artifacts.
- **Commit per fas**, svenskt commit-meddelande. Aldrig `--force`, aldrig omskriven historik.
- Samla frågor och ställ dem i klump. Avbryt inte ett bygge för en fråga som kan vänta.
- **Hitta aldrig på data.** Saknas en uppgift lämnas fältet tomt och markeras som saknat i UI.
  Påhittade värden får bara finnas i tester och ska heta `mock*`.
