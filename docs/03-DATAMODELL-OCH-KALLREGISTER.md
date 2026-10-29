# Datamodell och källregister

Läggs i `docs/` i repot. Agenten läser den före planering.

---

## Del 1 — Källregister

### Vad som faktiskt gäller

ATG har **inget öppet, officiellt dokumenterat publikt API**. Den JSON-tjänst som driver atg.se,
`https://www.atg.se/services/racinginfo/v1/api/`, går att nå utan inloggning — men den har inget
publicerat schema, inga stabilitetsgarantier, och ATG:s användarvillkor gäller. Den som bygger något
publikt eller kommersiellt ska gå via partneravtal; ATG levererar data till certifierade partners via
sin egen informationstjänst, och kräver i praktiken firma och befintlig sajt för avtal.
Svensk Travsports sportinfo på `travsport.se` har **inget officiellt stött API alls** — den är i första
hand ett webbgränssnitt för hästsök, licenser och sportdata, och den innehåller lopp som aldrig dyker
upp på atg.se eftersom det inte spelas på dem.

**Konsekvensen för det här projektet:** appen är privat och icke-kommersiell, hämtar försiktigt och
sparsamt, cachar hårt, identifierar sig ärligt, och är byggd för att fungera även när en källa försvinner.
Reglerna står i `.agents/rules/10-datakallor-och-etik.md` och de går före allt annat.

### Kandidatkällor — agenten verifierar var och en i Fas 0

| id                 | Domän                                    | Status                                    | Täcker                                                           | Anmärkning                                                                                                                                                                                                                                                                       |
| ------------------ | ---------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `atg-racinginfo`   | `atg.se`                                 | Inofficiell JSON-tjänst som driver atg.se | Kalender, banor, lopp, startlistor, hästar, resultat, spelformer | Utan autentisering men odokumenterad. ID-format: lopp `YYYY-MM-DD_{banId}_{loppNr}`, spel `{spelform}_YYYY-MM-DD_{banId}_{loppNr}`. Loppstatus observerade: `upcoming`, `bettable`, `results`. Arkivet sträcker sig flera år bakåt. Dagsgranularitet — månadsuppslag finns inte. |
| `atg-odds`         | `atg.se`                                 | Samma tjänst, egen adapter                | Vinnarodds, streckprocent, spelfördelning                        | **Egen adapter med egen status** även om domänen är densamma — odds har helt annan uppdateringstakt och ska kunna falla ensamt.                                                                                                                                                  |
| `svensk-travsport` | `travsport.se` / `sportapp.travsport.se` | Officiell sajt, inget stött API           | Hästsök, sportdata, licenser, lopp utan spel, avelsdata          | Hästsök finns på `sportapp.travsport.se/sportinfo/horse`. Behandlas som **sekundär** källa och komplement där atg-källan har luckor. Extra försiktig hämttakt.                                                                                                                   |
| `tips-*`           | Flera                                    | Publika tipssidor och RSS                 | Experttips, rankingar                                            | En adapter per tipsgivare, alla **valfria**. Avsändaren visas alltid i appen. Faller en, visas de andra.                                                                                                                                                                         |
| `smhi`             | `opendata.smhi.se`                       | Officiellt öppet API                      | Väder vid banan                                                  | Dokumenterat och öppet. Den enda helt bekymmersfria källan i registret. Bra att börja med i Fas 3 om de andra krånglar.                                                                                                                                                          |
| `fake-source`      | —                                        | Intern testadapter                        | Inget                                                            | Går att tvinga till valfri status. Används för att testa degradering. **Tas aldrig bort.**                                                                                                                                                                                       |

### Källprioritering per datatyp

| Datatyp               | Primär                    | Sekundär           | Faller allt                                |
| --------------------- | ------------------------- | ------------------ | ------------------------------------------ |
| Dagens banor och lopp | `atg-racinginfo`          | `svensk-travsport` | Visa senast sparade, grå prick             |
| Startlistor           | `atg-racinginfo`          | `svensk-travsport` | Visa senast sparade                        |
| Odds och streck       | `atg-odds`                | —                  | Kolumn visar `–`, grå prick, resten intakt |
| Hästens tidigare lopp | `atg-racinginfo`          | `svensk-travsport` | Visa det vi redan sparat                   |
| Tränar- och kuskform  | Beräknas ur egen historik | —                  | Visa "Bygger på för få lopp"               |
| Banstatistik          | Beräknas ur egen historik | —                  | Visa antal lopp statistiken bygger på      |
| Tips                  | `tips-*` var för sig      | —                  | Visa de som svarar                         |
| Väder                 | `smhi`                    | —                  | Dölj väderraden                            |

**Viktigt:** statistik som räknas ur vår egen sparade historik blir bättre ju längre appen varit igång.
Visa alltid hur många lopp en siffra bygger på. En procent från 12 lopp ska inte se ut som en sanning.

### Regel för nya källor

En ny källa får inte läggas till utan att den förs in i `docs/kallregister.md` med:
id, domän, officiell/inofficiell, vad `robots.txt` säger, krävs inloggning (ja → stryk),
vilka datatyper den täcker, anropsbudget, och bedömd risk att den försvinner.

---

## Del 2 — Databasschema

SQLite. Numrerade migrationer i `apps/server/src/db/migrations/`.
Alla tabeller har `created_at` och `updated_at`. Alla hämtade poster har `source_id` och `fetched_at` —
vi ska alltid kunna svara på var en siffra kom ifrån.

```sql
-- Banor
tracks(
  id TEXT PRIMARY KEY, name TEXT, country TEXT,
  length_m INTEGER, surface TEXT, covered INTEGER,
  source_id TEXT, fetched_at TEXT
)

-- Tävlingsdagar
race_days(
  id TEXT PRIMARY KEY,          -- YYYY-MM-DD_{trackId}
  date TEXT, track_id TEXT, biggest_game TEXT, first_start TEXT,
  source_id TEXT, fetched_at TEXT
)

-- Lopp
races(
  id TEXT PRIMARY KEY,          -- YYYY-MM-DD_{trackId}_{raceNo}
  race_day_id TEXT, number INTEGER, name TEXT,
  distance_m INTEGER, start_method TEXT,   -- 'volt' | 'auto'
  purse TEXT, terms TEXT, status TEXT,     -- 'kommande' | 'spelbart' | 'avgjort'
  scheduled_start TEXT, actual_start TEXT,
  track_condition TEXT,
  source_id TEXT, fetched_at TEXT
)

-- Hästar
horses(
  id TEXT PRIMARY KEY, name TEXT, nationality TEXT,
  birth_year INTEGER, sex TEXT, color TEXT, breed TEXT,
  trainer_id TEXT, owner TEXT, breeder TEXT,
  sire_id TEXT, dam_id TEXT, damsire_id TEXT,
  earnings_total INTEGER,
  record_auto TEXT, record_volt TEXT,
  starts INTEGER, wins INTEGER, places INTEGER,
  source_id TEXT, fetched_at TEXT
)

people(id TEXT PRIMARY KEY, name TEXT, role TEXT, license TEXT, source_id TEXT, fetched_at TEXT)

-- Starter: en rad per häst och lopp. Tabellens mittpunkt.
starts(
  id TEXT PRIMARY KEY,          -- {raceId}_{startNo}
  race_id TEXT, horse_id TEXT, start_number INTEGER,
  post_position INTEGER, handicap_m INTEGER,
  driver_id TEXT, trainer_id TEXT,
  shoes_front INTEGER, shoes_back INTEGER, shoes_changed INTEGER,
  sulky_type TEXT, sulky_color TEXT,
  scratched INTEGER, scratch_reason TEXT,
  finish_position INTEGER,      -- NULL om ej avgjort
  finish_code TEXT,             -- 'g' galopp | 'd' diskad | 'str' struken
  km_time TEXT, total_time TEXT, margin TEXT,
  prize_money INTEGER,
  source_id TEXT, fetched_at TEXT
)

-- Odds och streck: egen tabell, egen livscykel, tidsserie
odds(
  start_id TEXT, recorded_at TEXT,
  win_odds REAL, place_odds REAL, stake_percent REAL, game_type TEXT,
  source_id TEXT,
  PRIMARY KEY (start_id, recorded_at, game_type)
)

-- Tips: en rad per tipsgivare och start
tips(
  id TEXT PRIMARY KEY, race_id TEXT, start_id TEXT,
  provider TEXT,                -- visas alltid i appen
  rank INTEGER, comment TEXT, published_at TEXT,
  source_id TEXT, fetched_at TEXT
)

-- Väder
weather(track_id TEXT, observed_at TEXT, temp_c REAL, wind_ms REAL,
        precip_mm REAL, description TEXT, source_id TEXT,
        PRIMARY KEY (track_id, observed_at))

-- Favoriter
favorites(id INTEGER PRIMARY KEY, entity_type TEXT, entity_id TEXT, added_at TEXT)

-- Källhälsa: grunden för alla prickar och för sidan "Hur färskt är det här?"
source_health(
  id INTEGER PRIMARY KEY,
  source_id TEXT, status TEXT,
  attempted_at TEXT, succeeded_at TEXT,
  age_seconds INTEGER,
  message TEXT,                 -- svensk, visas i UI
  detail TEXT,                  -- teknisk, loggas, visas aldrig
  consecutive_failures INTEGER,
  paused_until TEXT
)

-- Rå cache för att slippa hämta om
raw_cache(url TEXT PRIMARY KEY, etag TEXT, last_modified TEXT,
          body TEXT, fetched_at TEXT, expires_at TEXT)
```

### Härledd statistik (beräknas, lagras inte som sanning)

Räkna i databasfrågor, inte i förväg. Visa alltid underlaget.

- **Spårstatistik per bana:** vinstprocent per startspår, uppdelat på volt och auto.
- **Ledarstatistik per bana:** hur ofta den som leder vid sista sväng vinner.
- **Hästens spårutfall:** placeringar per spår och startsätt.
- **Tränarform:** segerprocent och platsprocent senaste 30 dagarna.
- **Kuskform:** samma mått.
- **Formkurva:** placering och kilometertid över de senaste 10 starterna.
- **Intjänat per start:** `earnings_total / starts`.
- **Vila:** dagar sedan senaste start.

Varje sådan siffra levereras tillsammans med `basedOnRaces`. Är den under 20 skriver appen ut
"Bygger på 12 lopp" bredvid värdet.
