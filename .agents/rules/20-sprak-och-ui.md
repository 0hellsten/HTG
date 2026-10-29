---
description: Språk, tonfall, travtermer, microcopy och tillgänglighet för Stallbacken-gränssnittet.
trigger: always_on
---

# Regel: språk, ton och gränssnitt

Gäller all text som en människa kan se, och all kod i `apps/web/`.

## Mottagaren

En travkunnig man i 70-årsåldern. **Kan sporten utan och innan. Vill inte veta något om teknik.**
Han ska aldrig behöva fundera på varför något ser ut som det gör. Han ska känna igen sig.

Skriv som en lugn, kunnig vän på stallbacken. Inte som ett spelbolag. Inte som en databas.

## Grundregler för text

- **Allt på svenska.** Även datum, veckodagar, tal, enheter och felmeddelanden.
- **Korta meningar.** En tanke per mening. Hellre två korta än en lång.
- **Inga tekniska ord.** Förbjudna i UI: API, fetch, endpoint, request, response, timeout, cache,
  parse, null, undefined, error, exception, JSON, scraping, adapter, server, 404, 500, "kunde inte ansluta".
- **Inga engelska ord** där ett svenskt finns. Undantag: etablerade travtermer och namn.
- **Ingen utropstecken-entusiasm.** Lugnt, sakligt, vänligt.
- **Tips har alltid avsändare.** Aldrig "Dagens bästa häst" — alltid "Tips från X: ...".
- **Aldrig insatsråd.** Inga formuleringar om hur mycket man bör satsa. Aldrig "säker", "garanterad",
  "kan inte förlora". Appen informerar.

## Travord — diskret krydda

Använd travspråk i rubriker och etiketter, sparsamt och med precision. Det ska kännas hemtamt, inte tillgjort.

| Plats i appen | Använd |
|---|---|
| Dagens översikt | "Dagens omgång", "Kvällens banor" |
| Mest spelade i loppet | "Dagens spik" |
| Lågt streckad med bra form | "Skrällkandidat" |
| Hästens senaste starter | "Form i backspegeln" |
| Spår och positionsstatistik | "Ryggar och lägen" |
| Bansidan | "Banvisaren" |
| Jämförvyn | "Ställ dem mot varandra" |
| Favoriter | "Mitt stall" |
| Tipsvyn | "Vad tycker stallbacken?" |
| Tränarform | "Hur går det i träningen?" |
| Statussidan | "Hur färskt är det här?" |

Sporttermer i data skrivs rakt av, utan förklaring: volt, auto, galopp, diskad, struken, barfota fram/bak,
amerikansk sulky, kilometertid, rekord, tillägg, streck, vinnarodds, plats, grundlopp, upplopp, dödens, rygg.
**Dem kan han.** Förklara dem inte.

## Formatering

| Sak | Format | Exempel |
|---|---|---|
| Tid | `HH:mm` | `14:35` |
| Datum | `vd d mån` | `lör 8 nov` |
| Kilometertid | `m.ss,t` + startsätt | `1.12,3a` |
| Pengar | mellanslag som tusental | `1 245 300 kr` |
| Odds | en decimal | `4,8` |
| Streck | heltal + procent | `23 %` |
| Placering | siffra, galopp `g`, diskad `d`, struken `str` | `2`, `g`, `d` |
| Distans | meter med mellanslag | `2 140 m` |

Decimalkomma, inte punkt. Svenska veckodagsförkortningar.

## Färskhetspricken

Varje block som bygger på en hämtad källa har en liten prick i rubrikraden. Diskret — 8 px, dämpade färger.

- **Grön** = färskt. Ingen text. Det är normalläget och ska inte ta plats.
- **Gul** = lite gammalt. Text: "Uppdaterat för 18 minuter sedan".
- **Grå** = uppdateras inte just nu.

Vid tryck öppnas en liten rad under rubriken med **en mening på svenska** och en **"Försök igen"**-knapp.

Exempel på meningar:
- "Oddsen uppdateras inte just nu. Allt annat på sidan är färskt."
- "Tipsen är från i morse. De brukar komma in på nytt vid lunch."
- "Den här hästens tidigare lopp går inte att hämta för tillfället. Resten stämmer."
- "Hämtat från en reservkälla — kan skilja något."

**Förbjudet:** modaler, röda varningsfält, utropstecken, felkoder, "Något gick fel", "Försök igen senare"
utan knapp. Det ska kännas som en upplysning, inte som ett larm.

## Tomma och saknade värden

- Saknat enskilt värde: `–` (tankstreck), inte `0`, inte tomt, inte `null`.
- Helt saknat block: en lugn rad i stället för blockets innehåll —
  "Den här uppgiften saknas just nu" — plus grå prick.
- **Aldrig en tom skärm.** Finns ingenting alls att visa, visa det senast sparade med datum.

## Layout

**Mobil först, 390×844.** Laptop-layout vid ≥1024 px, med två kolumner där det ger lugn, aldrig fler.

- Brödtext minst **17 px** på mobil, 16 px på laptop. Rubriker minst 22 px.
- Klickytor minst **44×44 px**. Rejäla mellanrum — han ska inte träffa fel med tummen.
- Kontrast minst **4,5:1**. Färg är aldrig enda informationsbäraren — pricken har alltid text eller form också.
- En skärm = en uppgift. Inga flikar inuti flikar. Max ett djup av undersidor.
- Navigering längst ner på mobil, max 5 val: **Idag · Hästar · Tips · Mitt stall · Mer**.
- Tabeller på mobil blir kort eller horisontellt scrollbara tabeller med fast första kolumn — aldrig
  hopklämd text.
- Inga animationer som rör sig av sig själva. Inget autospelande ljud eller video.
- Fungerar i både stående och liggande läge.
- Ljust läge som standard, mörkt läge som val. Båda ska klara kontrastkravet.

## Offline

Appen fungerar utan nät och visar senast sparade data, märkt högst upp:
"Du är inte uppkopplad. Det här hämtades lör 8 nov 14:20."

## Laddning

Skelettkort, aldrig snurrande spinners mitt på skärmen. Laddning får aldrig låsa hela sidan —
delar som redan finns visas direkt.
