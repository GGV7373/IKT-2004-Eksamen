## Oppsett

For å sette opp denne nettsiden, følg disse trinnene:

1. Kopier `example.env` til `.env` og fyll inn dine egne verdier for database og admin-tilgang.
2. Start PostgreSQL-databasen ved å kjøre `docker compose up -d` i terminalen.
3. Kjør `npm install` for å installere nødvendige avhengigheter, og deretter `npm start` for å starte serveren.
4. Åpne nettleseren og gå til `http://localhost:3000` for å se forsiden, eller `http://localhost:3000/admin` for admin-området.
