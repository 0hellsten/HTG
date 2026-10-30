# Stallbacken — promptpaket för Google Antigravity

Ett komplett paket för att låta Antigravity bygga **Stallbacken**: en lugn, snygg travapp till din pappa.
Han ska kunna kolla dagens tips, jämföra hästar, se odds, se hur formen och träningen går, och läsa
tidigare lopp för både hästar och banor — utan att någonsin behöva förstå ett dugg teknik.

---

## Vad som ligger i paketet

| Fil                                       | Vad den gör                                               | Var den ska ligga |
| ----------------------------------------- | --------------------------------------------------------- | ----------------- |
| `00-LAS-MIG.md`                           | Den här guiden                                            | Var som helst     |
| `01-MASTERPROMPT.md`                      | Startprompten du klistrar in i Antigravity första gången  | Klipp & klistra   |
| `AGENTS.md`                               | Projektets grundlag — agenten läser den vid varje session | **Repo-roten**    |
| `.agents/rules/10-datakallor-och-etik.md` | Hårda regler för datainsamling, artighet och juridik      | `.agents/rules/`  |
| `.agents/rules/20-sprak-och-ui.md`        | Språk, tonfall, travord, tillgänglighet                   | `.agents/rules/`  |
| `.agents/rules/30-kod-och-kvalitet.md`    | Stack, struktur, tester, felhantering                     | `.agents/rules/`  |
| `02-FASPROMPTAR.md`                       | Fas 0–9. En prompt per fas, i rätt ordning                | Klipp & klistra   |
| `03-DATAMODELL-OCH-KALLREGISTER.md`       | Databasschema + alla datakällor med status-logik          | `docs/` i repot   |
| `04-UX-ORDLISTA-MICROCOPY.md`             | Skärmar, ordlista, färdig text på svenska                 | `docs/` i repot   |
| `05-TEST-VERIFIERING-DRIFT.md`            | Verifieringsprompter, acceptanskrav, drift och felsökning | `docs/` i repot   |

---

## Så gör du, steg för steg

1. **Skapa mappen** `stallbacken` på datorn och öppna den i Antigravity.
2. **Lägg in reglerna.** Kopiera `AGENTS.md` till roten. Skapa mappen `.agents/rules/` och lägg de tre
   regelfilerna där. Lägg `03-`, `04-` och `05-`-filerna i en `docs/`-mapp i repot.
   _(Antigravity läser `AGENTS.md`/`GEMINI.md` i roten och `.md`-filer direkt i `.agents/rules/`.
   Varje regelfil har en teckengräns på ca 12 000 tecken — filerna här ligger med god marginal under.)_
3. **Öppna Agent Manager**, sätt agenten i **Planning mode**.
4. **Klistra in hela `01-MASTERPROMPT.md`** som första meddelande.
5. **Läs planen** som agenten lämnar som artifact. Styr med kommentarer tills den känns rätt. Godkänn.
6. **Kör en fas i taget** från `02-FASPROMPTAR.md`. Vänta in artifacts och skärmbilder mellan faserna.
7. **Efter varje fas:** låt agenten köra verifieringsprompten i `05-`-filen innan du går vidare.

> **Tips:** Starta aldrig fler än en fas åt gången. Paketet är byggt så att varje fas lämnar ett
> fungerande, körbart läge. Då går det alltid att backa ett steg.

---

## Tre saker som gör just den här appen svår — och hur paketet löser dem

**1. ATG har inget öppet API.**
Den JSON-tjänst som driver atg.se (`https://www.atg.se/services/racinginfo/v1/api/`) går att nå utan
inloggning, men den är inte en officiellt dokumenterad publik API: inget publicerat schema, inga
stabilitetsgarantier, och ATG:s användarvillkor gäller. Svensk Travsports sportinfo har inget officiellt
stött API alls. Den officiella vägen för kommersiell användning går via partneravtal.
→ Därför bygger paketet **källadaptrar**: varje källa är en utbytbar modul med samma kontrakt, så att en
källa kan dö utan att appen gör det. Och därför finns en hel regelfil om artighet, cache och villkor.

**2. Pappa ska aldrig se ett tekniskt fel.**
→ Därför har varje datablock i gränssnittet en liten **färskhetsprick**: grön = färskt, gul = lite gammalt,
grå = uppdateras inte just nu. Appen visar alltid det den har och säger i klartext vad som saknas.

**3. Den ska kännas som trav, inte som en databas.**
→ Därför finns en ordlista och färdig microcopy: "Dagens spik", "Form i backspegeln", "Ryggar och lägen".
Travord som kryddning — aldrig som hinder.

---

## En rak rekommendation om tekniken

Paketet låser stacken till en **PWA** (React + TypeScript) med en liten **Node-backend** och **SQLite**.
Skälet är enkelt: din pappa får en ikon på Android-mobilen och samma app i webbläsaren på laptopen,
utan appbutik, utan uppdateringar han måste tänka på, utan konton. Ett bygge, två skärmar.
Låt agenten argumentera emot om den vill — men ändra inte utan att du vill ha extra jobb.

---

## Innan du kör: fyll i det här

Agenten frågar efter detta i Fas 0. Ha svaren redo:

- **Pappas favoritbanor:** _____________________ (t.ex. Solvalla, Åby, Bergsåker)
- **Spelformer han följer:** ☐ V75 ☐ V86 ☐ V64 ☐ V65 ☐ V5/V4 ☐ Vinnare/Plats ☐ DD/LD
- **Följer han egna hästar eller en viss tränare?** _____________________
- **Hur stor text behöver han?** ☐ Normal ☐ Stor ☐ Riktigt stor
- **Var ska appen köras?** ☐ Bara hemma på hans dator ☐ På en liten server så mobilen funkar överallt
