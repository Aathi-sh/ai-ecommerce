// services/firebase/firebase-service-account.js

/**
 * Firebase Service Account Configuration
 * Loads credentials from environment variables with fallback to local file
 */
import 'dotenv/config';

// Function to safely load local JSON (for Node.js compatibility)
async function loadLocalConfig() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const configPath = path.join(process.cwd(), 'firebase-service-account.json');
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Failed to load local Firebase config:', error.message);
  }
  return null;
}

const serviceAccount = {
  type: process.env.FIREBASE_TYPE || 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com'
};

// Validate required fields
const requiredFields = ['project_id', 'private_key', 'client_email'];
const missingFields = requiredFields.filter(field => {
  const value = serviceAccount[field];
  return !value || (typeof value === 'string' && value.trim() === '');
});

if (missingFields.length > 0) {
  console.error('❌ Missing Firebase service account fields:', missingFields);
  
  // Try to load from local file as fallback
  try {
    const localConfig = await loadLocalConfig();
    if (localConfig) {
      Object.assign(serviceAccount, localConfig);
      console.log('✅ Loaded Firebase config from local file');
    } else {
      console.error('❌ Failed to load Firebase configuration from any source');
      throw new Error(`Firebase configuration missing: ${missingFields.join(', ')}`);
    }
  } catch (error) {
    console.error('❌ Failed to load Firebase configuration:', error.message);
    throw error;
  }
} else {
  console.log('✅ Firebase configuration loaded from environment variables');
}

export default serviceAccount;