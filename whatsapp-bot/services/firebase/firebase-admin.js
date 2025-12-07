// services/firebase/firebase-admin.js

/**
 * Firebase Admin SDK Initialization
 * Singleton pattern to ensure single initialization
 */

import admin from 'firebase-admin';
import serviceAccount from './firebase-service-account.js';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    throw error;
  }
}

// Export Firebase services
export const messaging = admin.messaging();
export const firestore = admin.firestore();
export const auth = admin.auth();
export const database = admin.database();

// Export admin for other uses
export default admin;