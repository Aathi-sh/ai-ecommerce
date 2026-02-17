import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};

let client;
let clientPromise;

if (!process.env.MONGO_URI) {
  throw new Error('❌ Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    console.log('🔧 Creating new MongoDB client for development...');
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
    console.log('✅ MongoDB client connected for development');
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  console.log('🔧 Creating new MongoDB client for production...');
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  console.log('✅ MongoDB client connected for production');
}

// Helper function to check connection
export async function testConnection() {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    console.log('✅ MongoDB connection test: SUCCESS');
    return { success: true, message: 'MongoDB connected successfully' };
  } catch (error) {
    console.error('❌ MongoDB connection test: FAILED', error);
    return { success: false, message: error.message };
  }
}

// Helper to get database instance
export async function getDatabase(dbName = process.env.MONGODB_DATABASE || 'steponext') {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error('❌ Failed to get database:', error);
    throw error;
  }
}

// Export for NextAuth adapter
export default clientPromise;