import express from 'express';
import cors from 'cors';
import { createApiRouter } from './infrastructure/http/routes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Logging Middleware
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Register Hexagonal API Router under /api and / (for serverless rewrites resilience)
const apiRouter = createApiRouter();
app.use('/api', apiRouter);
app.use('/', apiRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏥 Salud Kawsay API (Hexagonal Architecture) running on http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

export default app;
module.exports = app;
