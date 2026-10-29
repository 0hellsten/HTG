# Skärmar, ordlista och färdig microcopy

Läggs i `docs/` i repot. **All text nedan används ordagrant.** Hitta inte på egna formuleringar
där det redan står en här.

---

## Skärmkarta

```
Idag ──────── Loppkort ──── Hästkort ──── Tidigare lopp
  │                │
  │                └──────── Ställ dem mot varandra
  │
Hästar ─────── Sök häst ──── Hästkort
  │
Tips ───────── Vad tycker stallbacken?
  │
Mitt stall ─── Favoriter
  │
Mer ────────── Banvisaren
               Hur färskt är det här?
               Textstorlek
               Hjälp
```

Navigering längst ner på mobil, max 5 val: **Idag · Hästar · Tips · Mitt stall · Mer**.
På laptop: samma val som en smal kolumn till vänster.

---

## Skärm för skärm

### Idag

Rubrik: **"Dagens omgång"** (efter 16:00: **"Kvällens omgång"**)
Stora lugna kort per bana. Favoritbanor överst med en liten hästsko-markering.

Per kort: banans namn · spelform (V75, V86 …) · första start · antal lopp · väder om det finns.
Tomt: _"Inga lopp idag. Nästa omgång är lör 8 nov."_

### Loppkort

Rubrikrad: **"Lopp 4 · 2 140 m · volt"** · starttid · prissumma.
Block, var och en med egen prick:

1. **Startlista** — nr, häst, kusk, tränare, skor, sulky, rekord, intjänat
2. **Odds och streck** — vinnarodds, streckprocent, med "Odds från 18:42"
3. **Vad tycker stallbacken?** — tips för just det här loppet, med avsändare
4. Knapp: **"Ställ dem mot varandra"**

Struken häst: nedtonad rad, överstruket nummer, etikett **"Struken"**.

### Hästkort

Rubrik: hästens namn · ålder, kön · tränare.
Block:

1. **Om hästen** — färg, ägare, uppfödare, stamtavla, rekord auto/volt, intjänat, starter/segrar/platser
2. **Form i backspegeln** — de 10 senaste starterna
3. **Ryggar och lägen** — utfall per spår och startsätt
4. **Hur går det i träningen?** — formkurva, tränarens form, kuskens form, kvallopp om det finns
5. **Alla starter** — hela historiken, hopfälld

### Ställ dem mot varandra

Rubrik: **"Ställ dem mot varandra"**
Hopfällbar rad överst: _"Så här läser du tabellen"_.
Mobil: horisontell scroll med **fast första kolumn**. Laptop: hela tabellen synlig.
Bästa värdet per rad får en lätt bakgrund — ingen skrikig färg.

### Vad tycker stallbacken?

Tips grupperade per lopp. **Varje tips har en synlig avsändare: "Tips från X".**
Ingen egen sammanvägning utan att det tydligt står: _"Appens egen hopslagning av tipsen ovan."_

### Banvisaren

Per bana: banlängd · öppen/täckt · underlag · **"Så brukar spåren gå"** (vinstprocent per startspår,
volt och auto var för sig) · **"Leder man, vinner man?"** · vanliga vinnartider · väder.
Under varje statistikblock: _"Bygger på 184 lopp"_.

### Mitt stall

Favoriter i grupper: Hästar · Kuskar · Tränare · Banor.
Är en favorit anmäld idag: markering **"Anmäld idag — Solvalla lopp 6, kl 20:12"**.
Tomt: _"Du har inte lagt till något än. Tryck på hästskon på en häst, kusk eller bana så hamnar den här."_

### Hur färskt är det här?

Enda stället i appen där källor nämns vid namn, och då på svenska.
En rad per källa: namn · prick · status · senaste lyckade hämtning.
Knapp längst ner: **"Uppdatera allt"**.

---

## Microcopy — använd ordagrant

### Färskhetspricken

| Läge            | Text                              |
| --------------- | --------------------------------- |
| Färskt          | (ingen text — grön prick räcker)  |
| Lite gammalt    | "Uppdaterat för 18 minuter sedan" |
| Delvis          | "Delvis uppdaterat"               |
| Uppdateras inte | "Uppdateras inte just nu"         |
| Saknas helt     | "Den här uppgiften saknas"        |

### Förklaringar vid tryck på pricken

- "Oddsen uppdateras inte just nu. Allt annat på sidan är färskt."
- "Tipsen är från i morse. De brukar komma in på nytt vid lunch."
- "Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer."
- "Startlistan är från 17:30. Kuskbyten efter det kan saknas."
- "Hämtat från en reservkälla — kan skilja något."
- "Vädret går inte att hämta just nu."

Alltid med knappen **"Försök igen"** bredvid.

### Offline

Högst upp, lugn remsa: _"Du är inte uppkopplad. Det här hämtades lör 8 nov 14:20."_

### Tomma lägen

- Lopp: _"Inga lopp idag. Nästa omgång är lör 8 nov."_
- Sök: _"Hittade ingen häst med det namnet. Prova med en del av namnet."_
- Tips: _"Inga tips har kommit in för det här loppet än."_
- Historik: _"Vi har inga tidigare lopp sparade för den här hästen än."_
- Statistik med tunt underlag: _"För få lopp för att säga något säkert."_

### Knappar

"Försök igen" · "Uppdatera allt" · "Ställ dem mot varandra" · "Visa alla starter" ·
"Lägg till i Mitt stall" · "Ta bort från Mitt stall" · "Visa mer" · "Dölj"

### Förbjudet i all text

API · fetch · endpoint · request · response · server · timeout · cache · parse · null · undefined ·
error · JSON · scraping · adapter · 404 · 500 · "Något gick fel" · "Ett oväntat fel inträffade" ·
"Kunde inte ansluta" · "Försök igen senare" (utan knapp)

---

## Ordlista — travord i appen

**Används som rubriker och etiketter (appens egna):**

| Ord                      | Var                                  |
| ------------------------ | ------------------------------------ |
| Dagens omgång            | Startsidan                           |
| Dagens spik              | Mest streckade hästen i loppet       |
| Skrällkandidat           | Lågt streckad häst med stigande form |
| Form i backspegeln       | Hästens senaste starter              |
| Ryggar och lägen         | Spår- och positionsstatistik         |
| Banvisaren               | Bansidan                             |
| Ställ dem mot varandra   | Jämförvyn                            |
| Mitt stall               | Favoriter                            |
| Vad tycker stallbacken?  | Tipsvyn                              |
| Hur går det i träningen? | Formblocket                          |
| Så brukar spåren gå      | Spårstatistik på bansidan            |
| Leder man, vinner man?   | Ledarstatistik                       |

**Används rakt av i data — förklaras aldrig:**
volt · auto · galopp (`g`) · diskad (`d`) · struken (`str`) · barfota fram/bak · amerikansk sulky ·
kilometertid · rekord · tillägg · streck · vinnarodds · plats · grundlopp · kvalitetslopp · upplopp ·
dödens · rygg · spår · kusk · tränare · uppfödare · stamtavla

**Används aldrig:**
"säker" · "garanterad" · "kan inte förlora" · "satsa" · "insats" som råd · "vinstchans" som löfte ·
allt som låter som en uppmaning att spela mer

---

## Tillgänglighet — checklista före överlämning

- [ ] Brödtext ≥ 17 px på mobil, rubriker ≥ 22 px
- [ ] Textstorleksval: Normal / Stor / Riktigt stor, påverkar hela appen
- [ ] Alla klickytor ≥ 44×44 px med tydligt avstånd
- [ ] Kontrast ≥ 4,5:1 i både ljust och mörkt läge
- [ ] Färg aldrig ensam informationsbärare — pricken har alltid text eller symbol
- [ ] Fungerar i stående och liggande läge
- [ ] Fungerar utan nät
- [ ] Inga självstartande animationer, inget autospelande ljud eller video
- [ ] Går att använda helt med en tumme på mobil
- [ ] Går att nå varje funktion på max två tryck från startsidan
- [ ] Inget tekniskt ord någonstans i gränssnittet
- [ ] Hjälpsidan finns inne i appen under "Mer"
