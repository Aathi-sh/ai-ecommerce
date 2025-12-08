// utils/db.js - FIXED VERSION
import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error('Please define the MONGO_URI environment variable inside .env.local');

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) {
    // Check if connection is still alive
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    }
    // Connection is dead, reset it
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased from default
      socketTimeoutMS: 45000, // Increased socket timeout
      maxPoolSize: 10, // Added connection pooling
    }).then((mongoose) => {
      console.log('✅ MongoDB Connected');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB Connection Error:', error.message);
      cached.promise = null; // Reset on error
      throw error;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}