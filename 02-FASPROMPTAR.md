# FASPROMPTAR — en prompt per fas, i ordning

Kör **en fas i taget**. Vänta in artifacts, skärmbilder och sammanfattning innan du går vidare.
Varje fas ska sluta i ett läge där appen går att starta och klicka runt i.

Efter varje fas: kör verifieringsprompten i `docs/05-TEST-VERIFIERING-DRIFT.md`.

---

## FAS 0 — Spaning och plan

> Innan du skriver en rad kod: kartlägg verkligheten.
>
> 1. Läs `AGENTS.md`, alla filer i `.agents/rules/` och alla filer i `docs/`.
> 2. Undersök varje kandidatkälla i `docs/03-DATAMODELL-OCH-KALLREGISTER.md` med **enstaka, försiktiga anrop** — inte en crawl. För varje källa, dokumentera:
>    - Svarar den? Vilken statuskod, vilket format?
>    - Vilka fält kommer faktiskt tillbaka? Visa ett trunkerat exempel.
>    - Vad säger `robots.txt` för domänen?
>    - Är källan officiell eller inofficiell? Krävs inloggning? (Krävs inloggning — stryk den.)
>    - Hur stabil ser den ut att vara? Versionsnummer i URL:en? Dokumenterad någonstans?
> 3. Bygg ett **källregister** i `docs/kallregister.md` med en rad per källa: id, domän, officiell/inofficiell, robots.txt-regler, datatyper den täcker, anropsbudget, bedömd risk.
> 4. Lämna en **implementationsplan** som artifact med faser 0–9, databasschema, adapterkontrakt, källprioritering per datatyp, skärmkarta, och en samlad lista med öppna frågor till mig.
>
> Skriv ingen produktionskod. Stanna när planen är lämnad.

---

## FAS 1 — Skelett och grundstruktur

> Sätt upp monorepot enligt `AGENTS.md`: `apps/web`, `apps/server`, `packages/shared`.
>
> - pnpm workspaces, TypeScript strict i alla paket, ESLint + Prettier.
> - Fastify-server som startar och svarar på `/halsa` med `{ ok: true }`.
> - React + Vite + Tailwind som startar och visar en tom "Idag"-sida med appens namn.
> - PWA-manifest och service worker på plats från start — appen ska gå att installera på Android redan nu.
> - `.env.example` med `CONTACT_EMAIL`, `PORT`, `DB_PATH`.
> - `README.md` med **två kommandon**: starta och stoppa. Skrivet så att någon som inte kan teknik förstår.
> - Ett `start.sh` / `start.cmd` som startar både server och webb med ett klick.
>
> Klart när: `pnpm dev` startar båda, sidan laddar på mobilstorlek och laptopstorlek, och installationsprompten dyker upp i Chrome på Android.

---

## FAS 2 — Databas och hälsosystemet

> Bygg lagret som allt annat vilar på. **Det här är fasen som avgör om appen tål att källor dör.**
>
> 1. SQLite-schema enligt `docs/03-DATAMODELL-OCH-KALLREGISTER.md`, via numrerade migrationer.
> 2. Tabellen `source_health` — en rad per hämtförsök: `source_id`, `status`, `attempted_at`, `succeeded_at`, `age_seconds`, `message`, `detail`.
> 3. Implementera `SourceAdapter`-kontraktet och `SourceResult` i `packages/shared`.
> 4. Implementera hälsologiken i `apps/server/src/health/`: övergångar mellan `ok`, `stale`, `degraded`, `failed`, med circuit breaker (5 raka fel → paus 30 min).
> 5. Bygg en **testadapter** `fake-source` som går att tvinga till valfri status via en flagga. Den används för att testa degradering utan att röra riktiga källor. Den ska finnas kvar permanent.
> 6. Route `GET /api/kallor` som listar alla källors status på svenska.
> 7. Enhetstester för varje statusövergång.
>
> Klart när: jag kan slå av `fake-source` och se att `/api/kallor` rapporterar `failed` medan allt annat svarar normalt.

---

## FAS 3 — Första riktiga källan: dagens omgång

> Bygg adaptern för dagens kalender och startlistor — den primära källan enligt källregistret.
>
> - Adaptern följer artighetsreglerna i `.agents/rules/10-datakallor-och-etik.md` till punkt och pricka: en anropskö per domän, max 1/s, ärlig User-Agent med kontaktadress, timeout 10 s, backoff, respekt för `Retry-After`.
> - zod-schema för svaret. Oväntat format → `degraded`, aldrig krasch.
> - Normalisera till våra egna typer i `packages/shared`. Spara i `tracks`, `races`, `starts`, `horses`.
> - Scheduler som hämtar enligt frekvenstabellen i regelfilen.
> - Routes: `GET /api/idag`, `GET /api/lopp/:id`.
> - Tester med sparade exempelsvar i `test/fixtures/` — testerna ska gå utan nät.
>
> Klart när: databasen fylls med dagens banor och lopp, och `/api/idag` svarar med rätt data plus status.

---

## FAS 4 — Skärmarna "Idag" och "Loppkort"

> Bygg de två första vyerna enligt `docs/04-UX-ORDLISTA-MICROCOPY.md`. Använd microcopyn ordagrant.
>
> **Idag** — dagens och kvällens banor som stora, lugna kort. Spelform, första start, antal lopp. Favoritbanor överst.
>
> **Loppkort** — ett lopp: nummer, distans, startsätt, pris, och startlistan med nummer, häst, kusk, tränare, skor, sulky, rekord, intjänat. Strukna hästar syns tydligt men nedtonat.
>
> Krav:
> - **Färskhetspricken i varje blockrubrik**, enligt regelfilen. Diskret, med "Försök igen"-knapp vid tryck.
> - Felgräns per block, inte per sida.
> - Skelettkort vid laddning, aldrig spinner mitt på skärmen.
> - Text minst 17 px, klickytor minst 44 px.
> - Mobil först. Laptop får två kolumner.
>
> Verifiera i browsern på 390×844 och 1440×900 och lämna skärmbilder som artifacts.
>
> Klart när: jag kan öppna appen i mobilen, se kvällens banor, trycka på ett lopp och läsa hela startlistan.

---

## FAS 5 — Odds och streck, med degradering på riktigt

> Lägg till odds och streckprocent som **egen källa, egen adapter, egen status**.
>
> - Tätare intervall nära start enligt frekvenstabellen.
> - Odds visas i startlistan med tidsstämpel: "Odds från 18:42".
> - **Det här är provet på hela arkitekturen:** stäng av oddskällan och verifiera i browsern att loppkortet fortfarande visar allt annat, att oddskolumnen visar `–`, att pricken är grå, och att texten lyder "Oddsen uppdateras inte just nu. Allt annat på sidan är färskt."
> - Lämna skärmbilder på både fungerande och avstängt läge som artifacts.
>
> Klart när: jag ser med egna ögon att appen är fullt användbar utan odds.

---

## FAS 6 — Hästkortet och "Form i backspegeln"

> Bygg hästsidan — appens hjärta.
>
> - Grunduppgifter: ålder, kön, färg, tränare, ägare, uppfödare, stamtavla, rekord, intjänat, starter/segrar/platser.
> - **"Form i backspegeln"** — de 10 senaste starterna i en läsbar rad per lopp: datum, bana, lopp, distans, spår, startsätt, kusk, placering, kilometertid, odds, skor, sulky. Galopp som `g`, diskad som `d`.
> - **"Ryggar och lägen"** — hur hästen presterat per spår och per startsätt.
> - **"Hur går det i träningen?"** — formkurva över senaste starterna, tränarens aktuella form (segerprocent senaste 30 dagarna), kuskens form, och träningsnoteringar/kvallopp där det finns att hämta. Finns det inte — säg det rakt ut, hitta inte på.
> - Historik hämtas lazy första gången en häst öppnas, sedan sparas den.
> - Varje block har sin egen prick och sin egen felgräns. Att formkurvan saknas får inte dölja stamtavlan.
>
> Klart när: jag kan söka upp en häst, se hela dess bakgrund, och blocken degraderar var för sig.

---

## FAS 7 — "Ställ dem mot varandra"

> Jämförvyn. Välj 2–6 hästar ur ett lopp och se dem sida vid sida.
>
> - Rader: form senaste 5, bästa kilometertid, rekord auto/volt, spårets utfall, intjänat per start, segerprocent, kusk, kuskens form, tränarens form, skor, sulky, vila sedan senaste start, odds och streck.
> - **Det bästa värdet per rad markeras diskret** — en lätt bakgrund, inte en färgkod som skriker.
> - Mobil: horisontell scroll med **fast första kolumn**, så radnamnen alltid syns. Aldrig hopklämd text.
> - Laptop: hela tabellen synlig på en gång.
> - Saknade värden visas som `–`. En häst med lucker data får aldrig se sämre ut än den är — markera luckan, inte hästen.
> - En kort rad överst: "Så här läser du tabellen" som går att fälla ihop.
>
> Verifiera i browsern på båda storlekarna. Skärmbilder som artifacts.

---

## FAS 8 — Tips och "Banvisaren"

> Två delar.
>
> **"Vad tycker stallbacken?"** — samlade tips och rankingar från de källor källregistret godkänt.
> - **Alltid synlig avsändare** på varje tips: "Tips från X".
> - Aldrig presenterat som sanning. Aldrig sammanvägt till ett eget "rätt svar" utan att det tydligt står att det är appens egen hopslagning.
> - Varje tipskälla har egen prick. Faller en, visas de andra.
> - Inga insatsråd, inga vinstlöften, aldrig "säker" eller "garanterad".
>
> **"Banvisaren"** — per travbana: banlängd, öppen/täckt, underlag, hur ofta ledaren vinner, vinstprocent per startspår, vanliga vinnartider, och väder vid banan på tävlingsdagen.
> - Statistiken räknas ur vår egen sparade historik där den finns — visa hur många lopp den bygger på. Bygger den på få lopp, säg det: "Bygger på 34 lopp".

---

## FAS 9 — "Mitt stall", polering och överlämning

> Sista fasen. Gör den klar för en man som inte vill fråga någon om hjälp.
>
> 1. **"Mitt stall"** — favoritmarkera hästar, kuskar, tränare och banor. Samlad sida. Markering när en favorit är anmäld till ett lopp.
> 2. **"Hur färskt är det här?"** — statussidan. Alla källor med svenskt namn, status, senaste lyckade hämtning, och en "Uppdatera allt"-knapp. Enda stället i appen där källor nämns vid namn.
> 3. **Offline** — appen öppnas och visar senast sparade data utan nät, märkt med tidpunkt.
> 4. **Installation** — testa att installera som app på Android och verifiera ikon, startskärm och att den öppnas utan webbläsarens adressfält.
> 5. **Textstorlek** — ett val i "Mer": Normal / Stor / Riktigt stor. Påverkar hela appen.
> 6. **Backup** — ett script som kopierar SQLite-filen med datum i namnet.
> 7. **Playwright-flödestest** som kör igenom hela appen med två källor avstängda och verifierar att allt annat fungerar.
> 8. **`HJALP.md`** — en sida i repot skriven direkt till pappa, på vanlig svenska: hur man öppnar appen, vad prickarna betyder, vad man gör om något ser gammalt ut. Inga tekniska ord. Den ska också finnas som en sida inne i appen under "Mer".
>
> Klart när: jag kan lämna över appen utan att förklara någonting.

---

## Extraprompter att ha i bakfickan

**När en källa dör på riktigt:**
> Källan `<id>` svarar inte längre som förut. Undersök vad som ändrats, uppdatera zod-schemat och
> normaliseringen, och lägg till ett testfall för det nya formatet. Rör inget annat. Om källan är
> permanent borta: föreslå en ersättare från källregistret och visa vad vi förlorar.

**När något ser konstigt ut i appen:**
> På sidan `<vy>` ser `<sak>` fel ut. Ta en skärmbild, hitta orsaken, och fixa **bara** det.
> Ändra inget annat. Visa före- och efterbild.

**När du vill lägga till en källa:**
> Lägg till en ny adapter för `<källa>` för datatypen `<typ>`. Följ artighetsreglerna, för in den i
> `docs/kallregister.md` med robots.txt-besked och anropsbudget, och koppla den som **sekundär** källa
> under den befintliga. Ingen annan fil än adapterregistret får ändras.

**Inför överlämning:**
> Gå igenom hela appen som om du vore min pappa: 72 år, kan trav, kan inte teknik.
> Lista allt som skulle kunna förvirra honom, allt tekniskt ord som läckt ut, allt som kräver
> förklaring. Fixa det. Visa listan före och efter.
