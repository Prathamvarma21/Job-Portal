import express from 'express';
import cors from 'cors';
import mongoose from "mongoose";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import companyRoute from './routes/company.route.js';
import jobRoute from './routes/job.route.js';
import applicationRoute from './routes/application.route.js';
import messageRoute from './routes/message.route.js';
import postRoute from './routes/post.route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { app, server } from './socket.js';

app.use(cookieParser());   
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://job-portal-theta-six-54.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};
app.use(cors(corsOptions));

connectDB();

let port = process.env.PORT || 8000;

app.use('/api/v1/user', userRoute);
app.use('/api/v1/company', companyRoute);
app.use('/api/v1/job', jobRoute);
app.use('/api/v1/application', applicationRoute);
app.use('/api/v1/message', messageRoute);
app.use('/api/v1/post', postRoute);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
