# Pulse Labs - Release Checklist v1.0

## Status Overview

| # | Taak | Status | Prioriteit |
|---|------|--------|------------|
| 1 | Git repo rename | ⬜ Todo | P1 |
| 2 | Vercel project rename | ⬜ Todo | P1 |
| 3 | Package.json name update | ⬜ Todo | P1 |
| 4 | Domein kopen & configureren | ⬜ Todo | P2 |
| 5 | Favicon checken/updaten | ⬜ Todo | P2 |
| 6 | CI/CD pipeline setup | ⬜ Todo | P3 |
| 7 | Unit tests kritieke flows | ⬜ Todo | P3 |
| 8 | Code cleanup/refactor | ⬜ Todo | P4 |

---

## 1. Naming Sync

### Beslissingen nodig:
- [ ] **Definitieve naam:** `pulse-labs` / `pulselabs` / `pulse`?
- [ ] **GitHub repo naam:** _________________
- [ ] **Vercel project naam:** _________________

### Acties:
- [ ] GitHub: Settings → Rename repository
- [ ] Vercel: Settings → General → Project Name
- [ ] Update `package.json` name field
- [ ] Update `NEXT_PUBLIC_APP_URL` in Vercel env vars

---

## 2. Domein

### Beslissingen nodig:
- [ ] **Gewenst domein:** pulselabs.io / pulselabs.app / anders?
- [ ] **Registrar:** Waar kopen? (Namecheap, Google Domains, Vercel)

### Acties:
- [ ] Domein registreren
- [ ] DNS configureren in Vercel
- [ ] SSL automatisch via Vercel
- [ ] `NEXT_PUBLIC_APP_URL` updaten

---

## 3. Favicon & Branding

### Checken:
- [ ] `/app/favicon.ico` - huidige staat?
- [ ] `/app/apple-touch-icon.png` - bestaat?
- [ ] `/app/manifest.json` of `site.webmanifest`
- [ ] OG images voor social sharing

---

## 4. CI/CD Pipeline

### Optie A: Minimaal (aanbevolen voor nu)
```yaml
# .github/workflows/ci.yml
- Lint check (ESLint)
- Type check (TypeScript)
- Build check
```

### Optie B: Uitgebreid (later)
```yaml
- Unit tests (Vitest)
- Integration tests (Playwright)
- Preview deployments
- Production deploy guards
```

---

## 5. Testing Strategie

### Kritieke flows om te testen:
1. [ ] Auth flow (login/logout)
2. [ ] Team creation
3. [ ] Vibe check-in flow
4. [ ] Ceremonies session flow
5. [ ] Share link generation

### Test stack suggestie:
- **Unit tests:** Vitest
- **Component tests:** React Testing Library
- **E2E tests:** Playwright (later)

---

## 6. Code Quality

### Quick wins:
- [ ] Unused imports verwijderen
- [ ] Console.logs verwijderen
- [ ] TypeScript strict mode errors fixen

### Later:
- [ ] Component extraction waar nodig
- [ ] Shared hooks identificeren
- [ ] API route consolidatie

---

## 7. Definition of Done (DoD)

### Voor elke feature:
- [ ] Code compileert zonder errors
- [ ] Lint checks passeren
- [ ] Handmatig getest in browser
- [ ] Dark mode werkt
- [ ] Mobile responsive
- [ ] NL + EN vertalingen aanwezig

---

## Notities

_Gebruik deze sectie voor aantekeningen tijdens de review_

```
[datum] - notitie
```

---

## Volgende stappen

1. Eerst: Beslis definitieve naam
2. Dan: Quick wins (favicon, naming)
3. Daarna: CI/CD basis
4. Later: Testing uitbreiden
