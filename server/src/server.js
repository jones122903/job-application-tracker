import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

async function startServer() {
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  await connectDB(process.env.MONGODB_URI);
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
  server.on('error', () => {
    console.error('Server could not listen. Check PORT and whether it is already in use.');
    process.exit(1);
  });
}

startServer().catch(() => {
  console.error('Startup failed. Check server/.env, MongoDB availability, and connection permissions.');
  process.exit(1);
});
