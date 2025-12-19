import express from 'express';
import { notificationService } from '../services/notifications/notification-service.js';

const router = express.Router();

// Debug route to explore database
router.get('/explore', async (req, res) => {
  try {
    console.log('\n🔍========================================');
    console.log('🔍 MANUAL DATABASE EXPLORATION');
    console.log('========================================');
    
    await notificationService.exploreDatabase();
    
    res.json({
      timestamp: new Date().toISOString(),
      message: 'Database exploration completed',
      status: 'Check server logs for details'
    });
    
  } catch (error) {
    console.error('❌ Debug route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create test admin user
router.post('/create-test-admin', async (req, res) => {
  try {
    const testAdmin = await notificationService.createTestAdmin();
    
    res.json({
      timestamp: new Date().toISOString(),
      message: 'Test admin created',
      admin: testAdmin
    });
    
  } catch (error) {
    console.error('❌ Error creating test admin:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test database connection
router.get('/test-connection', async (req, res) => {
  try {
    console.log('\n🔧========================================');
    console.log('🔧 TESTING DATABASE CONNECTION');
    console.log('========================================');
    
    const tokens = await notificationService.getAdminTokensFromDB();
    
    res.json({
      timestamp: new Date().toISOString(),
      connection: 'success',
      tokensFound: tokens.length,
      tokens: tokens.slice(0, 3) // Show first 3 tokens for debugging
    });
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;