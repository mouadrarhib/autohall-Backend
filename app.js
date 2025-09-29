// app.js
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/config/swagger.js';

import routes from './src/routes/index.js';
import { initDb } from './src/models/index.js';
import { errorHandler } from './src/helpers/errors.js';
import { auditAll } from './src/middlewares/auditAll.js';


const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// health check
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

// swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// 🌟 mount the global audit for everything under /api
app.use('/api', auditAll());

// main API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// centralized error handler
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
let server;

(async () => {
  try {
    await initDb();
    server = app.listen(port, () => {
      console.log(`🚀 Server listening on http://localhost:${port}`);
      console.log(`📖 Swagger docs available at http://localhost:${port}/docs`);
    });
  } catch (err) {
    console.error('❌ Application startup failed.');
    process.exit(1);
  }
})();

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
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
