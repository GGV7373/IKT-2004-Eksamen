# Brukerveiledning – Bryllup-easy AS

## Oppsett

1. Kopier `example.env` til `.env` og fyll inn verdier for database og admin-tilgang.
2. Kjør `docker compose up -d` for å starte PostgreSQL og applikasjonen.
3. Åpne `http://localhost` i nettleseren (nginx håndterer porten).

Vil du kjøre uten Docker:

```bash
npm install
npm start   # http://localhost:3000
```

---

## Bruker – registrering og innlogging

| Steg | URL | Beskrivelse |
|------|-----|-------------|
| Registrer deg | `/register` | Fyll inn navn, e-post og passord. Du må huke av for personvernerklæringen. |
| Logg inn | `/login` | Skriv inn e-post og passord. |
| Logg ut | `/logout` | Avslutter økten. |

---

## Bruker – dine data (GDPR)

### Se dine data
Gå til `GET /user/data` i nettleseren mens du er innlogget.  
Du får tilbake en JSON-fil med kontoinformasjon og bestillingshistorikk.

### Slett kontoen din
Send en POST-forespørsel til `/user/delete` (f.eks. via et skjema på siden).  
Kontoen og alle tilknyttede data slettes permanent, og du logges ut.

### Personvernerklæring
Les erklæringen på `/personvern`. Der finner du også lenke til dataeksport og kontosletting.

---

## Admin-panel

Admin-panelet er kun tilgjengelig fra godkjente subnett (se `nginx.conf`).

| URL | Funksjon |
|-----|----------|
| `/admin/login` | Logg inn som admin (brukernavn/passord fra `.env`) |
| `/admin` | Oversikt |
| `/admin/users` | Se og slette brukere |
| `/admin/products` | Legg til, rediger eller slett produkter |
| `/admin/orders` | Se bestillinger og oppdater status |

---

## Miljøvariabler (`.env`)

| Variabel | Eksempel | Beskrivelse |
|----------|----------|-------------|
| `PORT` | `3000` | Porten applikasjonen lytter på |
| `DB_HOST` | `localhost` | Databasevert |
| `DB_PORT` | `5432` | Databaseport |
| `DB_NAME` | `navneliste` | Databasenavn |
| `DB_USER` | `postgres` | Databasebruker |
| `DB_PASSWORD` | `postgres` | Databasepassord |
| `DB_SSL` | `false` | SSL mot databasen |
| `SESSION_SECRET` | *(tilfeldig streng)* | Hemmelig nøkkel for sesjoner |
| `ADMIN_USERNAME` | `admin` | Admin-brukernavn |
| `ADMIN_PASSWORD` | `admin123` | Admin-passord |
