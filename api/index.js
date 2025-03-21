import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import geminiRoutes from './routes/gemini.js'; // Use .js extension for ES modules

import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.route.js';
import applianceRoutes from './routes/appliance.routes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB!!');
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(express.json());
app.use(cookieParser());

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/gemini', geminiRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});