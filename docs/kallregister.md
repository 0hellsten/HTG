# Källregister — Stallbacken

Dokumentation över samtliga externa och interna datakällor för Stallbacken, upprättad under Fas 0.
Alla hämtningar följer reglerna i `.agents/rules/10-datakallor-och-etik.md`.

---

## Sammanfattning av källstatus

| id | Domän | Typ | Robots.txt | Status i Fas 0 | Datatyper | Anropsbudget | Bedömd risk |
|---|---|---|---|---|---|---|---|
| `atg-racinginfo` | `atg.se` | Inofficiell JSON-tjänst | Tillåter `/services/` | **Aktiv (200 OK)** | Kalender, banor, lopp, startlistor, hästar, stamtavla, tidigare lopp, utrustning | Max 1 anrop/s per domän, cache 15–30 min | Medel (odokumenterad JSON, stabil v1-struktur) |
| `atg-odds` | `atg.se` | Inofficiell JSON-tjänst | Tillåter `/services/` | **Aktiv (200 OK)** | Vinnarodds, platsodds, streckprocent (V64, V75 m.fl.) | Max 1 anrop/s, var 2:a min nära start | Medel (separat livscykel, kan degraderas ensamt) |
| `svensk-travsport` | `travsport.se` / `sportapp.travsport.se` | Inofficiell sajt | `Disallow: /` | **Avstängd (403 Block)** | Sportdata, licenser | N/A (får ej anropas enligt våra etiska regler) | Mycket hög (bot-skydd aktivt, robots.txt förbjuder) |
| `smhi` | `opendata-download-metfcst.smhi.se` | Officiellt öppet API | Tillåter | **Aktiv (200 OK)** | Väder vid travbanan (temp, vind, nederbörd, symbol) | Var 60:e min tävlingsdag | Mycket låg (officiell svensk myndighetsdata, `snow1g/v1`) |
| `tips-expressen` | `feeds.expressen.se` | Publik RSS-feed | Tillåter | **Aktiv (200 OK)** | Travtips, V75/V86/V64-snack, skrällbud | 2 ggr/dygn | Låg (standard RSS 2.0) |
| `tips-travronden` | `travronden.se` | Publik RSS-feed | Tillåter RSS | **Aktiv (200 OK)** | Travnyheter, stallbacksrapporter | 2 ggr/dygn | Låg (standard RSS 2.0) |
| `fake-source` | — | Intern testadapter | — | **Permanent test** | Simulerad data för tester | Valfri | Ingen (intern testmodul) |

---

## Detaljerad kartläggning per källa

### 1. `atg-racinginfo`
- **Domän:** `https://www.atg.se/services/racinginfo/v1/api/`
- **Statuskod & svar:** `200 OK`, `application/json;charset=utf-8`
- **Robots.txt:** `https://www.atg.se/robots.txt` disallowar endast `/konto/`, `/kod/*`, `/ratta/*`, `/preview/`, `/*/spela-pa-skoj`. Sökvägen `/services/racinginfo/` är inte blockerad.
- **Kräver inloggning:** Nej.
- **Headers & cache:** Stödjer `ETag`, `Cache-Control: max-age=60`, `Date`.
- **Verifierade endpoints:**
  - `calendar/day` — Dagens och kvällens tävlingsdagar, banor, lopp-id:n och tider.
  - `races/{raceId}` — Fullständigt loppkort med distans, volt/auto, prispengar, villkor, samt alla startande ekipage med hästnamn, ålder, kön, tränare, kusk, rekord, intjänat, skor (barfota/skor) och sulkytyp.
  - `horses/{horseId}/results` — Tidigare lopp (form i backspegeln), placering, kilometertid, bana, datum, odds, kusk, skor, sulky samt kvallopp (`type: qualifier`).
- **Juridisk markering:**
  `// Privat, icke-kommersiell användning. Ingen vidarespridning av data.`

### 2. `atg-odds`
- **Domän:** `https://www.atg.se/services/racinginfo/v1/api/games/`
- **Statuskod & svar:** `200 OK`, `application/json;charset=utf-8`
- **Verifierade endpoints:**
  - `games/vinnare_{raceId}` — Ger aktuellt vinnarodds och platsodds per häst.
  - `games/{gameType}_{raceId}` (t.ex. `V64_...`, `V75_...`) — Ger streckprocent (`betDistribution`), omsättning och trender per start.
- **Hälsoisolering:** Egen adapter med separat felhantering. Om oddsen faller eller svarar med timeout fortsätter startlistor och baninfo att visas som färskt (`ok`), medan oddsblocket visar `–` med grå prick.

### 3. `svensk-travsport`
- **Domän:** `https://travsport.se` / `https://sportapp.travsport.se`
- **Statuskod & svar:** `403 Forbidden` (Baffin Bay Networks Threat Protection).
- **Robots.txt:** `User-Agent: * Disallow: /`
- **Etiskt beslut:** Enligt projektets regelbok (`.agents/rules/10-datakallor-och-etik.md`) maskerar vi aldrig User-Agent och kringgår aldrig bot-skydd. Källan stängs av och aktiveras inte för automatisk skörd. All nödvändig häst- och loppdata erhålls via `atg-racinginfo`.

### 4. `smhi`
- **Domän:** `https://opendata-download-metfcst.smhi.se`
- **Endpoint:** `/api/category/snow1g/version/1/geotype/point/lon/{lon}/lat/{lat}/data.json`
- **Statuskod & svar:** `200 OK`, `application/json`
- **Viktig observation:** Den gamla kategorin `pmp3g/version/2` pensionerades den 31 mars 2026. Den nya ersättaren är `snow1g/version/1`, som levererar `air_temperature`, `wind_speed`, `wind_from_direction`, `relative_humidity`, `symbol_code` och nederbördsvärden.
- **Kräver inloggning:** Nej, helt öppet och fritt API.

### 5. `tips-expressen`
- **Domän:** `https://feeds.expressen.se/sport/trav/`
- **Statuskod & svar:** `200 OK`, `text/xml` (RSS 2.0)
- **Robots.txt:** Tillåter RSS-flödet.
- **Innehåll:** Redaktionella tipsartiklar för V75, V86, V64, spikförslag, skrällvarningar och tränarkommentarer.

### 6. `tips-travronden`
- **Domän:** `https://www.travronden.se/rss/nyheter/rss.xml`
- **Statuskod & svar:** `200 OK`, `application/rss+xml`
- **Innehåll:** Nyheter från travvärlden, stallbacksrapporter och loppanalyser.

### 7. `fake-source`
- **Domän:** Intern
- **Syfte:** Tester och verifiering av degradering, kretsbrytare (circuit breaker) och färskhetsprickar.
