require('dotenv').config();

const app = require('./src/app');
const { initializeDatabase, testConnection, validateDatabaseConfig } = require('./src/db');

const port = process.env.PORT || 3000;

function getErrorMessage(error) {
  if (!error) {
    return 'Ukjent feil.';
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  if (typeof error.code === 'string' && error.code.trim()) {
    return `Feilkode: ${error.code}`;
  }

  return JSON.stringify(error);
}

async function startServer() {
  try {
    validateDatabaseConfig();
    await testConnection();
    await initializeDatabase();

    app.listen(port, () => {
      console.log(`Server kjører på http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Kunne ikke starte med PostgreSQL:', getErrorMessage(error));
    process.exit(1);
  }
}

startServer();