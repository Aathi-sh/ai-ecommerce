// utils/db.js - CORRECT VERSION
import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

// Use MONGODB_URI (most common) or MONGO_URI
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MongoDB URI not found. Check your .env file.');
  console.error('Add either MONGODB_URI or MONGO_URI to .env');
  throw new Error('MongoDB URI is not defined in environment variables');
}

// Global cache for mongoose connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  console.log('🔌 Attempting MongoDB connection...');
  
  // If we have a cached connection and it's still alive, use it
  if (cached.conn) {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Using existing MongoDB connection');
      return cached.conn;
    }
    // Connection is dead, reset cache
    console.log('⚠️ Cached connection is dead, resetting...');
    cached.conn = null;
    cached.promise = null;
  }

  // If no connection promise exists, create a new one
  if (!cached.promise) {
    console.log('🔄 Creating new MongoDB connection...');
    
    // ⭐ REMOVED DEPRECATED OPTIONS ⭐
    cached.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,     // 30 seconds for server selection
      socketTimeoutMS: 45000,              // 45 seconds socket timeout
      maxPoolSize: 10,                     // Max connections in pool
      connectTimeoutMS: 10000,             // 10 seconds for initial connection
      family: 4,                           // Use IPv4, skip IPv6
    })
    .then((mongooseInstance) => {
      console.log('✅ MongoDB Connected Successfully');
      return mongooseInstance;
    })
    .catch((error) => {
      console.error('❌ MongoDB Connection Failed:', error.message);
      console.error('Full error:', error);
      cached.promise = null; // Reset on error
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Reset on error
    console.error('❌ Failed to get MongoDB connection:', error.message);
    throw error;
  }

  return cached.conn;
}

// Optional: Add event listeners for better debugging
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from DB');
});