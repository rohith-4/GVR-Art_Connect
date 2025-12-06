import 'dotenv/config'; // <-- ensure this is the first import so process.env is populated
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import connectDb from './config/mongodb.js';

const app = express();
connectDb().catch(err => console.error('Mongo connect error', err));
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// request logger (important to see incoming requests)
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl);
  next();
});

// simple health and debug endpoints
app.get('/ping', (_req, res) => res.json({ ok: true }));
app.get('/debug/auth-routes', (_req, res) => res.json({ mounted: !!authRoutes }));

// mount routers - ensure these lines exist and run before any 404 handler
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);

// fallback 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Not Found' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
