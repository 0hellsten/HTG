# Test, verifiering, drift och felsökning

Läggs i `docs/` i repot.

---

## Verifieringsprompt — kör efter varje fas

> Verifiera fasen innan vi går vidare. Gör allt detta och svara på svenska:
>
> 1. Starta appen. Öppna den i din browser på **390×844** och på **1440×900**. Klicka igenom varje ny vy och lämna skärmbilder som artifacts.
> 2. Stäng av `fake-source` och minst en riktig källa. Gå igenom appen igen. Visa med skärmbilder att allt annat fungerar, att rätt prick syns och att rätt svensk text visas.
> 3. Koppla bort nätet. Visa att appen öppnas och visar senast sparade data med tidsstämpel.
> 4. Sök igenom hela `apps/web` efter de förbjudna orden i regelfilen. Rapportera varje träff som kan nå en skärm.
> 5. Kör `pnpm test` och `pnpm lint`. Visa resultatet.
> 6. Sammanfatta: vad byggdes, vad fungerar, vad återstår, vad du är osäker på.

---

## Acceptanskrav — hela appen

Appen är klar när **varje** punkt nedan stämmer.

### Funktion
- [ ] Dagens och kvällens banor syns på startsidan, favoritbanor överst
- [ ] Ett lopp öppnas och visar hela startlistan med kusk, tränare, skor, sulky, rekord
- [ ] Odds och streckprocent visas med tidsstämpel
- [ ] Ett hästkort visar bakgrund, de 10 senaste starterna, spårutfall och formkurva
- [ ] Tränarens och kuskens aktuella form visas, med antal lopp den bygger på
- [ ] 2–6 hästar går att ställa mot varandra, läsbart på mobil
- [ ] Tips visas med synlig avsändare för varje tips
- [ ] Banvisaren visar banlängd, spårstatistik, ledarstatistik och väder
- [ ] Favoriter går att lägga till och tas bort, och markeras när de är anmälda
- [ ] Sidan "Hur färskt är det här?" listar alla källor på svenska

### Tålighet — projektets viktigaste krav
- [ ] Med **odds avstängt** fungerar hela resten av appen
- [ ] Med **tips avstängt** fungerar hela resten av appen
- [ ] Med **historik avstängt** fungerar hela resten av appen
- [ ] Med **två källor samtidigt avstängda** fungerar hela resten av appen
- [ ] Med **alla källor avstängda** öppnas appen och visar senast sparade data
- [ ] Ett trasigt block tar aldrig ner sidan runt omkring
- [ ] En källa som svarar med fel format ger `degraded`, aldrig en krasch
- [ ] Circuit breaker slår in efter 5 raka fel och pausar källan i 30 minuter
- [ ] Ingen källa anropas oftare än frekvenstabellen tillåter
- [ ] Ingen källa anropas parallellt mot samma domän

### Språk och UI
- [ ] Inget tekniskt ord syns någonstans i gränssnittet
- [ ] Ingen felkod, ingen stacktrace, inget engelskt felmeddelande
- [ ] Varje källberoende block har en färskhetsprick med svensk förklaring och "Försök igen"
- [ ] Ingen modal, inget rött varningsfält, inget utropstecken
- [ ] Saknade värden visas som `–`, aldrig som `0`, `null` eller tomt
- [ ] Ingen text om insatser, inga vinstlöften, aldrig "säker" eller "garanterad"

### Mobil och laptop
- [ ] Installerbar som app på Android, med egen ikon och startskärm
- [ ] Öppnas utan webbläsarens adressfält när den är installerad
- [ ] Fungerar i stående och liggande läge
- [ ] Hela appen går att använda med en tumme
- [ ] Laptop-layout vid ≥1024 px, max två kolumner
- [ ] Textstorleksvalet påverkar hela appen

### Data
- [ ] Inget värde i appen är påhittat — allt går att spåra till en källa och en tidpunkt
- [ ] Statistik med tunt underlag märks med antal lopp
- [ ] Ny hämtning skriver aldrig över bra data med sämre

---

## Obligatoriska tester

**Enhet (Vitest)**
- Varje adapter: lyckat svar · trasigt svar · oväntat format · timeout
- Hälsologiken: varje övergång mellan `ok`, `stale`, `degraded`, `failed` · circuit breaker
- Formatering: tid · datum · kilometertid · pengar · odds · placeringskoder

**Flöde (Playwright) — får aldrig tas bort**
1. `degradering.spec.ts` — stäng av två källor, gå igenom hela appen, verifiera att allt annat
   fungerar och att rätt prickar och texter visas.
2. `offline.spec.ts` — koppla bort nätet, verifiera att appen öppnas med sparad data och rätt remsa.
3. `inga-tekniska-ord.spec.ts` — gå igenom varje vy och leta efter de förbjudna orden i synlig text.
4. `mobil.spec.ts` — kör hela flödet på 390×844 och verifiera att ingen text klipps.

Alla tester ska gå **utan nätverk**. Externa svar ligger som sparade exempel i
`apps/server/test/fixtures/`.

---

## Drift

**Backup**
Script som kopierar SQLite-filen till `backups/stallbacken-YYYY-MM-DD.db` och behåller de 14 senaste.
Körs en gång per dygn. Hela appens historik ligger i den filen — den är det enda som inte går att bygga om.

**Loggar**
Rullande fil, 7 dagar. Varje hämtförsök loggas med källa, status, svarstid och antal försök.
Inga personuppgifter.

**Att hålla ögonen på**
- Källor som gått till `failed` och stannat där i mer än 24 timmar
- Källor som ofta går till `degraded` — det betyder att formatet håller på att ändras
- Databasfilens storlek

---

## Felsökningsprompter

**En källa har slutat fungera**
> Källan `<id>` har stått på `failed` sedan igår. Undersök vad som hänt: svarar domänen,
> har formatet ändrats, blockeras vi? Visa det faktiska svaret. Uppdatera zod-schemat och
> normaliseringen om formatet ändrats, och lägg till ett testfall. Rör inget annat.
> Är källan permanent borta: föreslå en ersättare ur källregistret och visa vad vi förlorar.

**Något ser fel ut i appen**
> På sidan `<vy>` ser `<sak>` fel ut. Ta en skärmbild, hitta orsaken och fixa **bara** det.
> Ändra inget annat. Visa före- och efterbild.

**En siffra ser konstig ut**
> Värdet `<x>` på `<plats>` ser fel ut. Spåra det bakåt: vilken källa, vilken hämtning, vilket råsvar.
> Visa kedjan. Är det källans fel ska vi visa det som saknat, inte som ett värde.

**Appen känns långsam**
> Mät var tiden går: databasfrågor, antal anrop, storlek på svaren, renderingstid.
> Visa de fem värsta. Föreslå åtgärder i ordning efter effekt. Ändra inget än.

**Pappa-testet — kör inför överlämning**
> Gå igenom hela appen som om du vore min pappa: 72 år, kan trav utan och innan, kan ingenting om teknik.
> Lista allt som skulle kunna förvirra honom, varje tekniskt ord som läckt ut, varje ställe som kräver
> en förklaring han inte får. Fixa det. Visa listan före och efter.

---

## Två saker att ha i bakhuvudet

**Statistiken växer med tiden.** Spår- och banstatistik räknas ur den historik appen själv samlat.
De första veckorna blir siffrorna tunna. Därför visar appen alltid hur många lopp en siffra bygger på —
det är skillnaden mellan en uppgift och en gissning.

**Källorna kommer att ändra sig.** En inofficiell datakälla har inget löfte att hålla sitt format.
Räkna med att något går sönder några gånger per år. Det är därför hela arkitekturen bygger på att det
ska märkas med en grå prick i stället för med en vit skärm.
