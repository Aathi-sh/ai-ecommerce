// Load from environment variables (production best practice)
const serviceAccount = {
  type: process.env.FIREBASE_TYPE || 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
const missingFields = requiredFields.filter(field => !serviceAccount[field]);

if (missingFields.length > 0) {
  console.error('❌ Missing Firebase service account fields:', missingFields);
  
  // Try to load from local file as fallback
  try {
    const localConfig = await import('../../../firebase-service-account.json', {
      assert: { type: 'json' }
    }).then(module => module.default);
    
    Object.assign(serviceAccount, localConfig);
    console.log('✅ Loaded Firebase config from local file');
  } catch (error) {
    console.error('❌ Failed to load Firebase configuration');
    throw new Error(`Firebase configuration missing: ${missingFields.join(', ')}`);
  }
}

export default serviceAccount;