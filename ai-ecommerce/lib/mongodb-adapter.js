import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb';

/**
 * Professional MongoDB Adapter for NextAuth.js
 */

// Create the MongoDB adapter with configuration
const createMongoDBAdapter = (options = {}) => {
  return MongoDBAdapter(clientPromise, {
    // Database name
    databaseName: process.env.MONGODB_DATABASE || 'steponext',
    
    // Collections configuration
    collections: {
      Users: 'users',
      Accounts: 'accounts',
      Sessions: 'sessions',
      VerificationTokens: 'verification_tokens',
    },
    
    // MongoDB options
    mongoOptions: {
      maxPoolSize: process.env.NODE_ENV === 'production' ? 20 : 10,
      minPoolSize: process.env.NODE_ENV === 'production' ? 5 : 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      w: 'majority',
      wtimeoutMS: 5000,
      journal: true,
      readPreference: 'primaryPreferred',
    },
    ...options
  });
};

// Create the adapter instance
const mongodbAdapter = createMongoDBAdapter();

// Enhanced adapter with custom functionality
const enhancedAdapter = {
  ...mongodbAdapter,
  
  // Custom methods can be added here
  async getUser(id) {
    try {
      const user = await mongodbAdapter.getUser(id);
      // Add any custom logic here
      return user;
    } catch (error) {
      console.error('❌ [MongoDB Adapter] Error getting user:', error);
      return null;
    }
  },
  
  async getUserByEmail(email) {
    try {
      const user = await mongodbAdapter.getUserByEmail(email);
      return user;
    } catch (error) {
      console.error('❌ [MongoDB Adapter] Error getting user by email:', error);
      return null;
    }
  },
};

// Export the adapter instance
export default enhancedAdapter;

// Also export as named export for convenience
export { enhancedAdapter };

// Export function to create adapter with custom options
export const createAdapter = createMongoDBAdapter;

// Helper function to test connection
export async function testAdapterConnection() {
  try {
    const client = await clientPromise;
    await client.db().admin().ping();
    
    console.log('✅ [MongoDB Adapter] Connection test: SUCCESS');
    return {
      success: true,
      message: 'MongoDB adapter connected successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ [MongoDB Adapter] Connection test: FAILED', error);
    return {
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}