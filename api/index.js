import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'; 
import geminiRoutes from './routes/gemini.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.route.js';
import applianceRoutes from './routes/appliance.routes.js';
import essentialsRoutes from './routes/essentials.routes.js';
import clothingRoutes from './routes/clothing.routes.js';



import pantryRoutes from './routes/pantry.routes.js';

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log('Connected to MongoDB!!'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();

// CORS configuration
app.use(
  cors({
    origin: 'http://localhost:5173', // Match your frontend's Vite port
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  })
);

// Handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});

app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/appliances', applianceRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/essentials', essentialsRoutes);
app.use('/api/clothing', clothingRoutes); 


app.use('/api/pantry', pantryRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, statusCode, message });
});


