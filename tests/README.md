# Pulse Labs — Test Suite

Automated UAT (User Acceptance Testing) met [Playwright](https://playwright.dev/).

## Snel starten

```bash
# Publieke tests (geen login nodig):
npm run test:public

# Alle tests (inclusief authenticated):
TEST_ADMIN_EMAIL=jouw@email.com TEST_ADMIN_PASSWORD=wachtwoord npm test

# Visueel debuggen:
npm run test:ui
```

## Playwright Projecten

De tests zijn opgesplitst in 3 Playwright projecten:

| Project | Wat | Auth |
|---------|-----|------|
| `setup` | Eenmalig inloggen, session cookie opslaan | — |
| `authenticated` | Tests die ingelogd moeten zijn | Ja (via storageState) |
| `public` | Tests zonder login | Nee |

### Public project (geen auth nodig)

| Bestand | Tests | Wat wordt getest |
|---------|-------|------------------|
| `home.spec.ts` | 5 | Homepage branding, core tools sectie, "Way of Work" label, CTA navigatie, taalwissel |
| `login.spec.ts` | 3 | Login formulier rendering, foutmelding bij foute credentials, redirect bij ongeauthenticeerde toegang |
| `participation.spec.ts` | 2 | Foutmelding bij ongeldige sessiecode, geen "Ceremonies" tekst |

### Authenticated project (admin login vereist)

| Bestand | Tests | Wat wordt getest |
|---------|-------|------------------|
| `teams.spec.ts` | 4 | Teams lijst laden, team detail met tool cards (Vibe + Way of Work), wow tab, settings tab |
| `wow-session.spec.ts` | 2 | Nieuwe WoW sessie pagina met angle grid (9 angles), angle selectie activeert start knop |
| `rename-verification.spec.ts` | 4 | Verificatie dat "Ceremonies" nergens meer in de UI voorkomt (teams lijst, team detail, wow tab, wow/new) |

**Totaal: 20 tests**

## Wat is gedekt

- Homepage content en navigatie
- Login flow (formulier, foutafhandeling, redirect)
- Teams lijst en team detail pagina (home, wow, settings tabs)
- Way of Work sessie aanmaken (angle selectie, Shu-Ha-Ri level)
- Participatie pagina (publiek, sessie code validatie)
- Rename verificatie ("Ceremonies" -> "Way of Work") op alle pagina's

## Authenticated tests draaien

Stel environment variabelen in met je admin account:

```bash
# Eenmalig:
export TEST_ADMIN_EMAIL="jouw@email.com"
export TEST_ADMIN_PASSWORD="jouw-wachtwoord"

# Dan:
npm test
```

Of in een `.env.test` bestand (voeg toe aan `.gitignore`!):

```
TEST_ADMIN_EMAIL=jouw@email.com
TEST_ADMIN_PASSWORD=jouw-wachtwoord
```

## Structuur

```
tests/
  .auth/                     # Session state (gitignored)
  helpers/
    auth.ts                  # Login helper (form-based)
  auth.setup.ts              # Eenmalige login, slaat session op
  home.spec.ts               # Homepage tests (public)
  login.spec.ts              # Login pagina tests (public)
  participation.spec.ts      # Publieke participatie pagina tests (public)
  teams.spec.ts              # Teams lijst en detail tests (authenticated)
  wow-session.spec.ts        # Way of Work sessie aanmaken (authenticated)
  rename-verification.spec.ts  # "Ceremonies" -> "Way of Work" check (authenticated)
  README.md                  # Dit bestand
```

## Backlog

### Hoge prioriteit

| Test | Beschrijving | Auth |
|------|-------------|------|
| Vibe tab flow | Share link genereren, kopieer knop, metrics weergave | Ja |
| WoW sessie detail | Sessie openen, responses bekijken, sessie sluiten, experiment invullen | Ja |
| Participatie flow (happy path) | Volledige flow: intro -> statements beantwoorden -> bedankpagina | Nee* |
| Team aanmaken | Formulier invullen, team verschijnt in lijst | Ja |

*\*Vereist een actieve sessie met geldige code*

### Medium prioriteit

| Test | Beschrijving | Auth |
|------|-------------|------|
| Results pagina | Publieke resultaten met radar chart, Shu-Ha-Ri banner, scores | Cookie |
| Tool enable/disable | Vibe en WoW aan/uitzetten in settings, UI update check | Ja |
| Team verwijderen | Danger zone, confirm dialog, redirect na delete | Ja |
| Coach vragen | Coach tab openen, vragen worden gegenereerd op basis van data | Ja |
