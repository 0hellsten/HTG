# Stallbacken

En lugn travapp som samlar dagens lopp, startlistor, odds och tips i ett tydligt och läsbart gränssnitt.

---

## Så här gör du

Det finns bara **två saker** du behöver veta för att använda appen:

### 1. Starta appen
Dubbelklicka på filen **`start.cmd`** på datorn.
En webbläsare öppnas automatiskt och visar dagens omgång.

*(Vill du köra från kommandotolken: skriv `pnpm dev` och tryck Enter.)*

### 2. Stänga appen
Stäng bara webbläsarfliken.
Vill du stänga serverfönstret: tryck **Ctrl + C** och tryck **J** (eller stäng det svarta fönstret).

---

## För utvecklare

- Byggd som ett pnpm-monorepo:
  - `apps/web`: React 18, TypeScript, Vite, Tailwind CSS (PWA)
  - `apps/server`: Node 20+, Fastify, SQLite
  - `packages/shared`: Gemensamma typer och adapterkontrakt
- Starta utvecklingsserver: `pnpm dev`
- Köra tester: `pnpm test`
- Lint: `pnpm lint`
