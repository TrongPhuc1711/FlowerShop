import app from './app';
import { env } from './config/env';

const startServer = async () => {
  try {
    app.listen(env.port, () => {
      console.log(`
  🌸 Flower Shop API Server
  ─────────────────────────
  Environment : ${env.nodeEnv}
  Port        : ${env.port}
  URL         : http://localhost:${env.port}
  API Docs    : http://localhost:${env.port}/api/health
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
