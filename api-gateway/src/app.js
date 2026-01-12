import express from 'express';
import healthRoutes from './routes/health.routes.js';
import metadataRoutes from './routes/metadata.routes.js';
import authRoutes from './routes/auth.routes.js';
import screenerRoutes from './routes/screener.routes.js';

const app = express();

app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/screener', screenerRoutes);

export default app;
