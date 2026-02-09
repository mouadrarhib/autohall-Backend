import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';
import { pathToFileURL } from 'url';
import { swaggerSpec } from './src/config/swagger.js';
import routes from './src/routes/index.js';
import { initDb } from './src/models/index.js';
import { errorHandler } from './src/helpers/errors.js';
import { auditAll } from './src/middlewares/auditAll.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(cookieParser());

  app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  app.use('/api', auditAll());
  app.use('/api', routes);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);

  return app;
};

const port = Number(process.env.PORT || 4000);
let server;

export const startServer = async () => {
  await initDb();
  const app = createApp();

  server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/docs`);
  });

  return server;
};

const shutdown = (signal) => {
  console.log(`${signal} received, shutting down...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  startServer().catch(() => {
    console.error('Application startup failed.');
    process.exit(1);
  });

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
