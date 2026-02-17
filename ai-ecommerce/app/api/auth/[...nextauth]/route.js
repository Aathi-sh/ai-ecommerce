import NextAuth from 'next-auth';
import { authOptions } from '@/lib/nextauth';

/**
 * NextAuth API Route Handler
 * 
 * This file handles all NextAuth API routes:
 * - /api/auth/signin
 * - /api/auth/signout  
 * - /api/auth/callback
 * - /api/auth/session
 * - /api/auth/csrf
 * - /api/auth/providers
 * - /api/auth/verify-request
 * - /api/auth/error
 */

// Create NextAuth handler with configuration
const handler = NextAuth(authOptions);

// Export handlers for all HTTP methods
export { handler as GET, handler as POST };