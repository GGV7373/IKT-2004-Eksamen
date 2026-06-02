# Bryllup-easy AS

En komplett nettbutikk for bryllupsplanlegging, bygget med Node.js, Express og PostgreSQL.

Eksamensoppgave utviklet av Victor — IKT-2004.

## Om prosjektet

Bryllup-easy AS er en nettbasert tjeneste der kunder kan registrere seg, logge inn, bla gjennom bryllupstjenester og legge inn bestillinger. Nettstedet tilbyr fire kategorier: musikere, blomster, kake og bordkort.

## Funksjoner

- Brukerregistrering og innlogging med krypterte passord
- Produktkatalog med kategorier (musikere, blomster, kake, bordkort)
- Handlekurv og bestilling
- Ordrehistorikk for innloggede brukere
- Administrasjonspanel for produkter, bestillinger og brukere

## Kom i gang

1. Kopier miljøvariabler: `cp example.env .env`
2. Start database: `docker compose up -d`
3. Installer avhengigheter: `npm install`
4. Start serveren: `npm start`
5. Åpne [localhost:3000](http://localhost:3000) i nettleseren

## Admin

Tilgang til admin-panelet på [localhost:3000/admin](http://localhost:3000/admin):

| Brukernavn | Passord   |
|------------|-----------|
| `admin`    | `admin123` |

Se [brukerveiledning.md](docs/brukerveiledning.md) for mer detaljert oppsett.

## Teknologier

| Teknologi | Bruk |
|-----------|------|
| Node.js + Express 5 | Backend og ruting |
| PostgreSQL | Database (via Docker) |
| EJS | HTML-maler |
| bcrypt | Passordkryptering |
| express-session | Brukersesjon |
| multer | Bildeopplasting |
