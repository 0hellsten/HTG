# MASTERPROMPT — klistra in detta som första meddelande i Antigravity (Planning mode)

---

Du ska bygga en app som heter **Stallbacken**.

## Vem den är till för

Min pappa. Han är en van travintresserad man som följt sporten i decennier och kan sporten utan och innan.
Han är däremot **helt ointresserad av teknik**. Han vill inte veta vad ett API är, han vill inte se
felmeddelanden, han vill inte konfigurera något, och han kommer aldrig att öppna en terminal.
Han vill öppna appen, se dagens omgång, och känna att han har koll.

**Designa för honom.** Varje gång du står inför ett val mellan "tekniskt elegant" och "begripligt för pappa",
väljer du begripligt. Varje gång du funderar på om något behöver förklaras — förklara det, på travspråk.

## Vad appen ska göra

1. **Dagens omgång** — vilka banor som kör idag/ikväll, vilka lopp, vilken spelform (V75, V86, V64, V65, V5, V4, DD, LD, vinnare/plats), och när det drar igång.
2. **Travtips** — samlade tips och rankingar från flera håll, alltid med tydlig avsändare. Aldrig presenterade som sanning, alltid som "så här tycker X".
3. **Jämför hästar** — välj 2–6 hästar i ett lopp och ställ dem sida vid sida: form, kilometertider, spårstatistik, skor, kusk, tränarform, intjänat per start.
4. **Odds** — aktuella vinnarodds och streckprocent, med tydlig tidsstämpel på när de hämtades.
5. **Hur träningen gått** — formkurva, senaste starterna, träningsnoteringar och kvallopp där sådant finns att hämta, tränarens aktuella form.
6. **Tidigare lopp** — hästens hela startlista bakåt med tid, spår, kusk, placering, galopp/diskning, skor och sulky.
7. **Banstatistik** — per travbana: banlängd, hur spåren brukar gå, hur ofta ledaren vinner, vanliga vinnartider, väder.
8. **Favoriter** — hästar, kuskar, tränare och banor han vill bevaka, samlade på en egen sida.

## Den svåraste delen — läs noga

**ATG har inget öppet, dokumenterat publikt API.** Appen måste därför **samla ihop data från flera håll**
och sy ihop det till en helhet. Det betyder att delar kommer att gå sönder, ibland mitt i en omgång.

Det här är inte ett undantagsfall. **Det är arkitekturen.** Bygg efter den principen från första raden kod:

- Varje datakälla är en **adapter** bakom ett gemensamt kontrakt. Adaptrar är utbytbara, isolerade och får aldrig kunna krascha appen.
- Varje adapter rapporterar sin **hälsa**: `ok`, `stale`, `degraded` eller `failed`, med tidsstämpel och ett begripligt svenskt meddelande.
- **Appen ska alltid vara användbar med det den har.** Om oddsen inte går att hämta ska startlistan, formen, statistiken och tipsen fungera precis som vanligt.
- Varje block i gränssnittet som bygger på en källa visar en **liten diskret färskhetsprick**. Grön = färskt. Gul = lite gammalt, med ålder. Grå = uppdateras inte just nu. Trycker man på pricken får man en mening på vanlig svenska: _"Oddsen uppdateras inte just nu. Allt annat på sidan är färskt."_
- Aldrig en tom skärm. Aldrig en felkod. Aldrig en stacktrace. Aldrig ordet "API" eller "fetch" i gränssnittet.
- Senast hämtade data sparas lokalt och visas när nätet är borta, märkt med när det hämtades.

Detaljerna för källor, hälsologik och tröskelvärden står i `docs/03-DATAMODELL-OCH-KALLREGISTER.md`
och i regelfilen `.agents/rules/10-datakallor-och-etik.md`. **Läs båda innan du planerar.**

## Teknikval (låsta — ifrågasätt bara om du har ett starkt skäl, och gör det i planen)

- **Frontend:** React + TypeScript + Vite, byggd som **installerbar PWA**. Samma kodbas ger en ikon på Android och en vanlig sida på laptopen.
- **UI:** Tailwind + en lätt komponentbas. Mobil först, 390×844. Laptop-layout vid ≥1024 px.
- **Backend:** Node 20 + TypeScript + Fastify. Den sköter all insamling — frontend pratar aldrig direkt med en extern källa.
- **Lagring:** SQLite via `better-sqlite3`. Hela historiken i en fil. Enkel att backa upp, enkel att flytta.
- **Schemaläggning:** en enkel intern scheduler i backend, ingen extern tjänst.
- **Monorepo:** pnpm workspaces — `apps/web`, `apps/server`, `packages/shared`.
- **Inga konton, ingen inloggning, ingen analys, inga tredjepartsspårare.**

## Tonfall och språk

Allt i gränssnittet är på **svenska**. Texten ska låta som en lugn, kunnig vän på stallbacken — inte som
ett spelbolag och inte som en databas. **Travord används diskret som krydda**, inte som hinder:
"Dagens spik", "Skrällkandidat", "Form i backspegeln", "Ryggar och lägen", "Banvisaren".
Ordlistan och färdig microcopy ligger i `docs/04-UX-ORDLISTA-MICROCOPY.md`. Använd den ordagrant där den finns. Tips presenteras alltid med avsändare.

## Så här vill jag att du arbetar

1. **Planera först.** Lämna en implementationsplan som artifact innan du rör en enda fil. Jag vill se faser, datamodell, adapterkontrakt och skärmflöde.
2. **Ställ dina frågor i klump i planen** — jag svarar på allt på en gång. Avbryt inte mitt i ett bygge för att fråga.
3. **En fas i taget.** Varje fas ska sluta i ett läge där appen går att starta och klicka runt i.
4. **Verifiera i webbläsaren.** Efter varje UI-fas: öppna appen i din browser, klicka igenom flödet, och lämna skärmbilder på både 390×844 och 1440×900 som artifacts.
5. **Commit per fas** med tydligt svenskt meddelande. Aldrig `git push --force`, aldrig rewrite av historik, aldrig `rm -rf` utanför projektmappen.
6. **Inga hemligheter i repot.** Allt konfigurerbart går via `.env`, med en `.env.example` i repot.
7. **Hittepå är förbjudet.** Hittar du ingen källa för ett fält — lämna det tomt och markera det som saknat i gränssnittet. Fyll aldrig i data du inte faktiskt hämtat. Låtsasdata får bara finnas i tester, och då tydligt namngivet som mockdata.

## Din första uppgift

Gör **inget annat** än detta nu:

1. Läs `AGENTS.md`, alla filer i `.agents/rules/`, och alla filer i `docs/`.
2. Kartlägg vilka datakällor som faktiskt svarar just nu. Använd din browser och försiktiga, enstaka
   anrop — inte en crawl. Dokumentera för varje källa: svarar den, vilka fält kommer tillbaka, vad säger
   robots.txt och villkoren, och hur stabil ser den ut att vara.
3. Lämna en **implementationsplan** som artifact med:
   - Faser 0–9 med tydligt avslut för varje fas
   - Databasschema
   - Adapterkontraktet (typsignatur + hälsostatus)
   - Vilka källor du föreslår per datatyp, med första- och andrahandsval
   - Skärmkarta med alla vyer och hur man navigerar mellan dem
   - En lista på öppna frågor till mig
4. **Stanna där.** Skriv ingen produktionskod förrän jag godkänt planen.

---
