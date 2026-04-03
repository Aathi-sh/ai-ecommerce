// // lib/nextauth.js
// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import { connectDB } from '../utils/db';
// import User from '../models/user';
// import Company from '../models/Company';
// import Counter from '../models/Counter';
// import bcrypt from 'bcryptjs';

// /**
//  * Professional NextAuth Configuration with SaaS Multi-tenancy
//  * 
//  * Features:
//  * - Company-based isolation
//  * - Super admin vs company admin distinction
//  * - Company status validation
//  * - Session contains company context
//  * - Proper error codes for AuthContext
//  */

// export const authOptions = {
//   // ========== PROVIDERS ==========
//   providers: [
//     CredentialsProvider({
//       id: 'credentials',
//       name: 'Credentials',
//       type: 'credentials',
//       credentials: {
//         email: { 
//           label: 'Email', 
//           type: 'email',
//           placeholder: 'example@domain.com',
//           required: true 
//         },
//         password: { 
//           label: 'Password', 
//           type: 'password',
//           placeholder: '••••••••',
//           required: true 
//         },
//       },
      
//       async authorize(credentials) {
//         try {
//           if (!credentials?.email || !credentials?.password) {
//             throw new Error('Email and password are required');
//           }

//           const email = credentials.email.toLowerCase().trim();
//           const password = credentials.password;

//           console.log('🔐 [NextAuth] Authorization attempt for:', email);

//           // Connect to database
//           await connectDB();

//           // Find user with password field (which is normally excluded)
//           const user = await User.findOne({ email })
//             .select('+password +security.failedLoginAttempts +security.lastFailedLogin')
//             .populate('companyId', 'companyName status subscription')
//             .lean();

//           // User not found
//           if (!user) {
//             console.log('❌ [NextAuth] User not found for email:', email);
//             throw new Error('No account found with this email');
//           }

//           // Check user status
//           if (user.status !== 'active') {
//             console.log('⚠️ [NextAuth] Account not active:', {
//               email: user.email,
//               status: user.status,
//               isVerified: user.isVerified
//             });

//             switch (user.status) {
//               case 'pending':
//                 throw new Error('PENDING_VERIFICATION');
//               case 'inactive':
//                 throw new Error('ACCOUNT_INACTIVE');
//               case 'suspended':
//                 throw new Error('ACCOUNT_SUSPENDED');
//               case 'deleted':
//                 throw new Error('ACCOUNT_DELETED');
//               default:
//                 throw new Error('ACCOUNT_INACTIVE');
//             }
//           }

//           // Check if email is verified
//           if (!user.isVerified) {
//             console.log('⚠️ [NextAuth] Unverified email attempt:', email);
//             throw new Error('PENDING_VERIFICATION');
//           }

//           // ===== COMPANY VALIDATION (SAAS) =====
//           // For non-super-admin users, check company status
//           const isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
          
//           if (!isSuperAdmin && user.companyId) {
//             const company = await Company.findById(user.companyId).lean();
            
//             if (!company) {
//               console.log('⚠️ [NextAuth] Company not found for user:', email);
//               throw new Error('COMPANY_NOT_FOUND');
//             }
            
//             if (company.status !== 'active') {
//               console.log('⚠️ [NextAuth] Company not active:', {
//                 company: company.companyName,
//                 status: company.status
//               });
              
//               switch (company.status) {
//                 case 'inactive':
//                   throw new Error('COMPANY_INACTIVE');
//                 case 'suspended':
//                   throw new Error('COMPANY_SUSPENDED');
//                 case 'pending':
//                   throw new Error('COMPANY_PENDING');
//                 default:
//                   throw new Error('COMPANY_INACTIVE');
//               }
//             }

//             // Check subscription expiry
//             if (company.subscription?.expiryDate && new Date(company.subscription.expiryDate) < new Date()) {
//               console.log('⚠️ [NextAuth] Company subscription expired:', company.companyName);
//               throw new Error('COMPANY_SUBSCRIPTION_EXPIRED');
//             }
//           }

//           // Verify password
//           const isPasswordValid = await bcrypt.compare(password, user.password);
          
//           if (!isPasswordValid) {
//             console.log('❌ [NextAuth] Invalid password for user:', email);
            
//             // Track failed login attempts for security
//             try {
//               await User.updateOne(
//                 { _id: user._id },
//                 {
//                   $inc: { 'security.failedLoginAttempts': 1 },
//                   $set: { 'security.lastFailedLogin': new Date() }
//                 }
//               );

//               // Auto-suspend after 5 failed attempts
//               const failedAttempts = (user.security?.failedLoginAttempts || 0) + 1;
//               if (failedAttempts >= 5) {
//                 await User.updateOne(
//                   { _id: user._id },
//                   { 
//                     $set: { 
//                       status: 'suspended',
//                       'suspensionReason': 'Too many failed login attempts'
//                     } 
//                   }
//                 );
//                 console.log('⚠️ [NextAuth] Account auto-suspended due to failed attempts:', email);
//               }
//             } catch (trackError) {
//               console.error('Failed to track login attempts:', trackError);
//             }
            
//             throw new Error('Invalid password');
//           }

//           // Reset failed login attempts on successful login
//           await User.updateOne(
//             { _id: user._id },
//             {
//               $set: { 
//                 lastLogin: new Date(),
//                 'security.failedLoginAttempts': 0,
//                 'security.lastFailedLogin': null
//               },
//               $inc: { loginCount: 1 }
//             }
//           );

//           console.log('✅ [NextAuth] User authorized successfully:', {
//             id: user._id.toString(),
//             email: user.email,
//             role: user.role,
//             adminType: user.adminType,
//             companyId: user.companyId?._id || user.companyId,
//             status: user.status,
//             isVerified: user.isVerified
//           });

//           // Return user object with ALL necessary data
//           return {
//             id: user._id.toString(),
//             email: user.email,
//             name: user.fullName || user.email.split('@')[0],
//             fullName: user.fullName || user.email.split('@')[0],
//             role: user.role || 'user',
//             adminType: user.adminType || null, // For distinguishing super vs company admin
//             status: user.status,
//             isVerified: user.isVerified,
//             phone: user.phone || '',
//             companyId: user.companyId?._id?.toString() || user.companyId?.toString() || null,
//             companyName: user.companyId?.companyName || null,
//             companyStatus: user.companyId?.status || null,
//             notificationSettings: user.notificationSettings || {},
//             adminPreferences: user.adminPreferences || {},
//             image: null,
//           };
          
//         } catch (error) {
//           console.error('❌ [NextAuth] Authorization error:', error.message);
          
//           // Pass through specific error codes for AuthContext
//           const validErrors = [
//             'PENDING_VERIFICATION',
//             'ACCOUNT_INACTIVE',
//             'ACCOUNT_SUSPENDED', 
//             'ACCOUNT_DELETED',
//             'COMPANY_NOT_FOUND',
//             'COMPANY_INACTIVE',
//             'COMPANY_SUSPENDED',
//             'COMPANY_PENDING',
//             'COMPANY_SUBSCRIPTION_EXPIRED',
//             'No account found with this email',
//             'Invalid password'
//           ];
          
//           if (validErrors.includes(error.message)) {
//             throw new Error(error.message);
//           }
          
//           // Generic error for other cases
//           throw new Error('Authentication failed. Please try again.');
//         }
//       }
//     })
//   ],

//   // ========== SESSION MANAGEMENT ==========
//   session: {
//     strategy: 'jwt',
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//     updateAge: 24 * 60 * 60, // 24 hours
//   },

//   // ========== JWT CALLBACK ==========
//   callbacks: {
//     async jwt({ token, user, trigger, session }) {
//       try {
//         // Initial sign in - add user data to token
//         if (user) {
//           token.id = user.id;
//           token.email = user.email;
//           token.name = user.name;
//           token.fullName = user.fullName || user.name;
//           token.role = user.role || 'user';
//           token.adminType = user.adminType || null;
//           token.status = user.status || 'active';
//           token.isVerified = user.isVerified || false;
//           token.phone = user.phone || '';
//           token.companyId = user.companyId || null;
//           token.companyName = user.companyName || null;
//           token.companyStatus = user.companyStatus || null;
//           token.notificationSettings = user.notificationSettings || {};
//           token.adminPreferences = user.adminPreferences || {};
//           token.isAdmin = user.role === 'admin';
//           token.isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
//           token.isCompanyAdmin = user.role === 'admin' && user.adminType === 'company';
//           token.isManager = user.role === 'manager';
//         }

//         // Refresh user data from database on each JWT update
//         if (token.id) {
//           try {
//             await connectDB();
//             const dbUser = await User.findById(token.id)
//               .select('role adminType phone isVerified notificationSettings adminPreferences fullName status email companyId')
//               .populate('companyId', 'companyName status subscription')
//               .lean();
            
//             if (dbUser) {
//               // Update token with latest DB data
//               token.role = dbUser.role || 'user';
//               token.adminType = dbUser.adminType || null;
//               token.status = dbUser.status || 'active';
//               token.isVerified = dbUser.isVerified || false;
//               token.phone = dbUser.phone || '';
//               token.fullName = dbUser.fullName || token.name;
//               token.notificationSettings = dbUser.notificationSettings || {};
//               token.adminPreferences = dbUser.adminPreferences || {};
//               token.email = dbUser.email;
              
//               // Update company info
//               if (dbUser.companyId) {
//                 token.companyId = dbUser.companyId._id?.toString() || dbUser.companyId.toString();
//                 token.companyName = dbUser.companyId.companyName || null;
//                 token.companyStatus = dbUser.companyId.status || null;
//               } else {
//                 token.companyId = null;
//                 token.companyName = null;
//                 token.companyStatus = null;
//               }
              
//               token.isAdmin = dbUser.role === 'admin';
//               token.isSuperAdmin = dbUser.role === 'admin' && dbUser.adminType === 'super';
//               token.isCompanyAdmin = dbUser.role === 'admin' && dbUser.adminType === 'company';
//               token.isManager = dbUser.role === 'manager';
//             }
//           } catch (dbError) {
//             console.error('JWT: Failed to fetch user from DB:', dbError);
//             // Continue with existing token if DB fetch fails
//           }
//         }

//         // Handle session updates (e.g., after profile update)
//         if (trigger === 'update' && session) {
//           token = { ...token, ...session.user };
//         }

//         return token;
        
//       } catch (error) {
//         console.error('JWT callback error:', error);
//         return token;
//       }
//     },

//     // ========== SESSION CALLBACK ==========
//     async session({ session, token }) {
//       try {
//         if (session?.user && token) {
//           // Include ALL necessary user data in session for AuthContext
//           session.user = {
//             id: token.id,
//             email: token.email,
//             name: token.name || token.email?.split('@')[0],
//             fullName: token.fullName || token.name || token.email?.split('@')[0],
//             role: token.role || 'user',
//             adminType: token.adminType || null,
//             status: token.status || 'active',
//             isVerified: token.isVerified || false,
//             phone: token.phone || '',
            
//             // Company context (CRITICAL for multi-tenancy)
//             companyId: token.companyId || null,
//             companyName: token.companyName || null,
//             companyStatus: token.companyStatus || null,
            
//             notificationSettings: token.notificationSettings || {},
//             adminPreferences: token.adminPreferences || {},
            
//             // Role helpers
//             isAdmin: token.role === 'admin',
//             isSuperAdmin: token.role === 'admin' && token.adminType === 'super',
//             isCompanyAdmin: token.role === 'admin' && token.adminType === 'company',
//             isManager: token.role === 'manager',
//             isActive: token.status === 'active',
            
//             // Company helper
//             hasCompany: !!token.companyId,
//           };
          
//           session.user.isAuthenticated = true;
//         }
        
//         return session;
        
//       } catch (error) {
//         console.error('Session callback error:', error);
//         return session;
//       }
//     },

//     // ========== SIGN IN CALLBACK ==========
//     async signIn({ user, account, profile }) {
//       try {
//         if (user) {
//           console.log('✅ [NextAuth] Sign in successful for:', {
//             email: user.email,
//             role: user.role,
//             adminType: user.adminType,
//             companyId: user.companyId
//           });
//           return true;
//         }
//         return false;
//       } catch (error) {
//         console.error('Sign in callback error:', error);
//         return false;
//       }
//     },

//     // ========== REDIRECT CALLBACK ==========
//     async redirect({ url, baseUrl }) {
//       // Allows relative callback URLs
//       if (url.startsWith('/')) {
//         return `${baseUrl}${url}`;
//       }
      
//       // Allows callback URLs on the same origin
//       if (new URL(url).origin === baseUrl) {
//         return url;
//       }
      
//       return baseUrl;
//     }
//   },

//   // ========== PAGES ==========
//   pages: {
//     signIn: '/login',
//     signOut: '/logout',
//     error: '/login', // Will show error as query param
//     verifyRequest: '/auth/verify-request',
//     newUser: '/auth/new-user',
//   },

//   // ========== SECURITY ==========
//   secret: process.env.NEXTAUTH_SECRET,
//   useSecureCookies: process.env.NODE_ENV === 'production',
  
//   // ========== COOKIES ==========
//   cookies: {
//     sessionToken: {
//       name: process.env.NODE_ENV === 'production' 
//         ? '__Secure-next-auth.session-token' 
//         : 'next-auth.session-token',
//       options: {
//         httpOnly: true,
//         sameSite: 'lax',
//         path: '/',
//         secure: process.env.NODE_ENV === 'production',
//         maxAge: 30 * 24 * 60 * 60, // 30 days
//       }
//     },
//     callbackUrl: {
//       name: process.env.NODE_ENV === 'production' 
//         ? '__Secure-next-auth.callback-url' 
//         : 'next-auth.callback-url',
//       options: {
//         httpOnly: true,
//         sameSite: 'lax',
//         path: '/',
//         secure: process.env.NODE_ENV === 'production',
//       }
//     },
//     csrfToken: {
//       name: process.env.NODE_ENV === 'production' 
//         ? '__Host-next-auth.csrf-token' 
//         : 'next-auth.csrf-token',
//       options: {
//         httpOnly: true,
//         sameSite: 'lax',
//         path: '/',
//         secure: process.env.NODE_ENV === 'production',
//       }
//     }
//   },

//   // ========== EVENTS ==========
//   events: {
//     async signIn({ user, account, isNewUser }) {
//       console.log('📝 [NextAuth] User signed in:', {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         adminType: user.adminType,
//         companyId: user.companyId,
//         status: user.status,
//         isNewUser,
//         timestamp: new Date().toISOString()
//       });
//     },
    
//     async signOut({ session, token }) {
//       console.log('📝 [NextAuth] User signed out:', {
//         email: session?.user?.email || token?.email,
//         companyId: session?.user?.companyId || token?.companyId,
//         timestamp: new Date().toISOString()
//       });
//     },
    
//     async createUser({ user }) {
//       console.log('📝 [NextAuth] User created:', {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//         adminType: user.adminType,
//         companyId: user.companyId,
//         status: 'pending',
//         timestamp: new Date().toISOString()
//       });

//       // Initialize company counters if this is a company admin
//       if (user.role === 'admin' && user.adminType === 'company' && user.companyId) {
//         try {
//           await Counter.initializeCompanyCounters(user.companyId, user.id);
//           console.log('✅ [NextAuth] Company counters initialized for:', user.companyId);
//         } catch (counterError) {
//           console.error('Failed to initialize company counters:', counterError);
//         }
//       }
//     },
    
//     async updateUser({ user }) {
//       console.log('📝 [NextAuth] User updated:', {
//         id: user.id,
//         email: user.email,
//         status: user.status,
//         timestamp: new Date().toISOString()
//       });
//     },
    
//     async linkAccount({ user, account, profile }) {
//       console.log('📝 [NextAuth] Account linked:', {
//         user: user.email,
//         provider: account.provider,
//         timestamp: new Date().toISOString()
//       });
//     },
    
//     async session({ session, token }) {
//       console.debug('📝 [NextAuth] Session accessed:', {
//         user: session?.user?.email,
//         companyId: session?.user?.companyId,
//         timestamp: new Date().toISOString()
//       });
//     }
//   },

//   // ========== DEBUG & DEVELOPMENT ==========
//   debug: process.env.NODE_ENV === 'development',
  
//   // ========== THEME ==========
//   theme: {
//     colorScheme: 'auto',
//     brandColor: '#667eea',
//     logo: '/logo.png',
//     buttonText: 'Sign in'
//   },

//   // ========== LOGGER ==========
//   logger: {
//     error(code, metadata) {
//       console.error('[NextAuth] Error:', {
//         code,
//         ...metadata,
//         timestamp: new Date().toISOString()
//       });
//     },
//     warn(code) {
//       console.warn('[NextAuth] Warning:', {
//         code,
//         timestamp: new Date().toISOString()
//       });
//     },
//     debug(code, metadata) {
//       if (process.env.NODE_ENV === 'development') {
//         console.debug('[NextAuth] Debug:', {
//           code,
//           ...metadata,
//           timestamp: new Date().toISOString()
//         });
//       }
//     }
//   }
// };

// // Export the handler for API routes
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

// // Default export for authOptions
// export default authOptions;













// lib/nextauth.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '../utils/db';
import User from '../models/user';
import Company from '../models/Company';
import Counter from '../models/Counter';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'example@domain.com', required: true },
        password: { label: 'Password', type: 'password', placeholder: '••••••••', required: true },
      },
      
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const email = credentials.email.toLowerCase().trim();
          const password = credentials.password;

          console.log('🔐 [NextAuth] Authorization attempt for:', email);

          await connectDB();

          const user = await User.findOne({ email })
            .select('+password +security.failedLoginAttempts +security.lastFailedLogin')
            .populate('companyId', 'companyName status subscription')
            .lean();

          if (!user) {
            console.log('❌ [NextAuth] User not found for email:', email);
            throw new Error('No account found with this email');
          }

          // Check user status
          if (user.status !== 'active') {
            console.log('⚠️ [NextAuth] Account not active:', {
              email: user.email,
              status: user.status,
              isVerified: user.isVerified
            });

            switch (user.status) {
              case 'pending':
                throw new Error('PENDING_VERIFICATION');
              case 'inactive':
                throw new Error('ACCOUNT_INACTIVE');
              case 'suspended':
                throw new Error('ACCOUNT_SUSPENDED');
              case 'deleted':
                throw new Error('ACCOUNT_DELETED');
              default:
                throw new Error('ACCOUNT_INACTIVE');
            }
          }

          // Check if email is verified
          if (!user.isVerified) {
            console.log('⚠️ [NextAuth] Unverified email attempt:', email);
            throw new Error('PENDING_VERIFICATION');
          }

          // Company validation
          const isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
          
          if (!isSuperAdmin && user.companyId) {
            const company = await Company.findById(user.companyId).lean();
            
            if (!company) {
              console.log('⚠️ [NextAuth] Company not found for user:', email);
              throw new Error('COMPANY_NOT_FOUND');
            }
            
            if (company.status !== 'active') {
              console.log('⚠️ [NextAuth] Company not active:', {
                company: company.companyName,
                status: company.status
              });
              
              switch (company.status) {
                case 'inactive':
                  throw new Error('COMPANY_INACTIVE');
                case 'suspended':
                  throw new Error('COMPANY_SUSPENDED');
                case 'pending':
                  throw new Error('COMPANY_PENDING');
                default:
                  throw new Error('COMPANY_INACTIVE');
              }
            }

            if (company.subscription?.expiryDate && new Date(company.subscription.expiryDate) < new Date()) {
              console.log('⚠️ [NextAuth] Company subscription expired:', company.companyName);
              throw new Error('COMPANY_SUBSCRIPTION_EXPIRED');
            }
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            console.log('❌ [NextAuth] Invalid password for user:', email);
            
            try {
              await User.updateOne(
                { _id: user._id },
                {
                  $inc: { 'security.failedLoginAttempts': 1 },
                  $set: { 'security.lastFailedLogin': new Date() }
                }
              );

              const failedAttempts = (user.security?.failedLoginAttempts || 0) + 1;
              if (failedAttempts >= 5) {
                await User.updateOne(
                  { _id: user._id },
                  { 
                    $set: { 
                      status: 'suspended',
                      'suspensionReason': 'Too many failed login attempts'
                    } 
                  }
                );
                console.log('⚠️ [NextAuth] Account auto-suspended due to failed attempts:', email);
              }
            } catch (trackError) {
              console.error('Failed to track login attempts:', trackError);
            }
            
            throw new Error('Invalid password');
          }

          // ===== ✅ CRITICAL FIX: UPDATE USER STATUS TO ACTIVE ON LOGIN =====
          // This is the missing piece that was preventing re-login after logout
          console.log('✅ [NextAuth] Updating user status to active for:', email);
          
          // Get IP and User Agent from credentials (passed from login page)
          const ip = credentials.ip || 'unknown';
          const userAgent = credentials.userAgent || 'unknown';
          
          // Update user with new status and login info
          const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
              $set: {
                status: 'active',           // ✅ FORCE status to active
                lastLogin: new Date(),
                lastSeen: new Date(),
                'security.failedLoginAttempts': 0,
                'security.lastFailedLogin': null,
              },
              $inc: { loginCount: 1 },
              $push: {
                'security.loginHistory': {
                  timestamp: new Date(),
                  ip: ip,
                  userAgent: userAgent,
                  success: true
                }
              }
            },
            { new: true }
          ).select('fullName role adminType companyId phone notificationSettings adminPreferences')
           .populate('companyId', 'companyName status subscription')
           .lean();

          console.log('✅ [NextAuth] User status updated to active:', {
            id: user._id,
            email: user.email,
            status: updatedUser?.status || 'active',
            previousStatus: user.status
          });

          // Return user object with ALL necessary data
          return {
            id: user._id.toString(),
            email: user.email,
            name: updatedUser?.fullName || user.fullName || user.email.split('@')[0],
            fullName: updatedUser?.fullName || user.fullName || user.email.split('@')[0],
            role: user.role || 'user',
            adminType: user.adminType || null,
            status: 'active', // ✅ Always active in session
            isVerified: user.isVerified,
            phone: updatedUser?.phone || user.phone || '',
            companyId: user.companyId?._id?.toString() || user.companyId?.toString() || null,
            companyName: user.companyId?.companyName || null,
            companyStatus: user.companyId?.status || null,
            notificationSettings: updatedUser?.notificationSettings || user.notificationSettings || {},
            adminPreferences: updatedUser?.adminPreferences || user.adminPreferences || {},
            image: null,
          };
          
        } catch (error) {
          console.error('❌ [NextAuth] Authorization error:', error.message);
          
          const validErrors = [
            'PENDING_VERIFICATION',
            'ACCOUNT_INACTIVE',
            'ACCOUNT_SUSPENDED', 
            'ACCOUNT_DELETED',
            'COMPANY_NOT_FOUND',
            'COMPANY_INACTIVE',
            'COMPANY_SUSPENDED',
            'COMPANY_PENDING',
            'COMPANY_SUBSCRIPTION_EXPIRED',
            'No account found with this email',
            'Invalid password'
          ];
          
          if (validErrors.includes(error.message)) {
            throw new Error(error.message);
          }
          
          throw new Error('Authentication failed. Please try again.');
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.fullName = user.fullName || user.name;
          token.role = user.role || 'user';
          token.adminType = user.adminType || null;
          token.status = user.status || 'active'; // ✅ Will be 'active'
          token.isVerified = user.isVerified || false;
          token.phone = user.phone || '';
          token.companyId = user.companyId || null;
          token.companyName = user.companyName || null;
          token.companyStatus = user.companyStatus || null;
          token.notificationSettings = user.notificationSettings || {};
          token.adminPreferences = user.adminPreferences || {};
          token.isAdmin = user.role === 'admin';
          token.isSuperAdmin = user.role === 'admin' && user.adminType === 'super';
          token.isCompanyAdmin = user.role === 'admin' && user.adminType === 'company';
          token.isManager = user.role === 'manager';
        }

        if (token.id) {
          try {
            await connectDB();
            const dbUser = await User.findById(token.id)
              .select('role adminType phone isVerified notificationSettings adminPreferences fullName status email companyId')
              .populate('companyId', 'companyName status subscription')
              .lean();
            
            if (dbUser) {
              token.role = dbUser.role || 'user';
              token.adminType = dbUser.adminType || null;
              token.status = dbUser.status || 'active'; // ✅ Will be 'active'
              token.isVerified = dbUser.isVerified || false;
              token.phone = dbUser.phone || '';
              token.fullName = dbUser.fullName || token.name;
              token.notificationSettings = dbUser.notificationSettings || {};
              token.adminPreferences = dbUser.adminPreferences || {};
              token.email = dbUser.email;
              
              if (dbUser.companyId) {
                token.companyId = dbUser.companyId._id?.toString() || dbUser.companyId.toString();
                token.companyName = dbUser.companyId.companyName || null;
                token.companyStatus = dbUser.companyId.status || null;
              } else {
                token.companyId = null;
                token.companyName = null;
                token.companyStatus = null;
              }
              
              token.isAdmin = dbUser.role === 'admin';
              token.isSuperAdmin = dbUser.role === 'admin' && dbUser.adminType === 'super';
              token.isCompanyAdmin = dbUser.role === 'admin' && dbUser.adminType === 'company';
              token.isManager = dbUser.role === 'manager';
            }
          } catch (dbError) {
            console.error('JWT: Failed to fetch user from DB:', dbError);
          }
        }

        if (trigger === 'update' && session) {
          token = { ...token, ...session.user };
        }

        return token;
        
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (session?.user && token) {
          session.user = {
            id: token.id,
            email: token.email,
            name: token.name || token.email?.split('@')[0],
            fullName: token.fullName || token.name || token.email?.split('@')[0],
            role: token.role || 'user',
            adminType: token.adminType || null,
            status: token.status || 'active', // ✅ Will be 'active'
            isVerified: token.isVerified || false,
            phone: token.phone || '',
            companyId: token.companyId || null,
            companyName: token.companyName || null,
            companyStatus: token.companyStatus || null,
            notificationSettings: token.notificationSettings || {},
            adminPreferences: token.adminPreferences || {},
            isAdmin: token.role === 'admin',
            isSuperAdmin: token.role === 'admin' && token.adminType === 'super',
            isCompanyAdmin: token.role === 'admin' && token.adminType === 'company',
            isManager: token.role === 'manager',
            isActive: token.status === 'active',
            hasCompany: !!token.companyId,
          };
          
          session.user.isAuthenticated = true;
        }
        
        return session;
        
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },

    async signIn({ user, account, profile }) {
      try {
        if (user) {
          console.log('✅ [NextAuth] Sign in successful for:', {
            email: user.email,
            role: user.role,
            adminType: user.adminType,
            companyId: user.companyId,
            status: user.status
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Sign in callback error:', error);
        return false;
      }
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    }
  },

  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: false, //Need to disable 
  // useSecureCookies: process.env.NODE_ENV === 'production',
  
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.callback-url' 
        : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Host-next-auth.csrf-token' 
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('📝 [NextAuth] User signed in:', {
        id: user.id,
        email: user.email,
        role: user.role,
        adminType: user.adminType,
        companyId: user.companyId,
        status: user.status,
        isNewUser,
        timestamp: new Date().toISOString()
      });
    },
    
    async signOut({ session, token }) {
      console.log('📝 [NextAuth] User signed out:', {
        email: session?.user?.email || token?.email,
        companyId: session?.user?.companyId || token?.companyId,
        timestamp: new Date().toISOString()
      });
    },
    
    async createUser({ user }) {
      console.log('📝 [NextAuth] User created:', {
        id: user.id,
        email: user.email,
        role: user.role,
        adminType: user.adminType,
        companyId: user.companyId,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      if (user.role === 'admin' && user.adminType === 'company' && user.companyId) {
        try {
          await Counter.initializeCompanyCounters(user.companyId, user.id);
          console.log('✅ [NextAuth] Company counters initialized for:', user.companyId);
        } catch (counterError) {
          console.error('Failed to initialize company counters:', counterError);
        }
      }
    },
    
    async updateUser({ user }) {
      console.log('📝 [NextAuth] User updated:', {
        id: user.id,
        email: user.email,
        status: user.status,
        timestamp: new Date().toISOString()
      });
    },
    
    async linkAccount({ user, account, profile }) {
      console.log('📝 [NextAuth] Account linked:', {
        user: user.email,
        provider: account.provider,
        timestamp: new Date().toISOString()
      });
    },
    
    async session({ session, token }) {
      console.debug('📝 [NextAuth] Session accessed:', {
        user: session?.user?.email,
        companyId: session?.user?.companyId,
        timestamp: new Date().toISOString()
      });
    }
  },

  debug: process.env.NODE_ENV === 'development',
  
  theme: {
    colorScheme: 'auto',
    brandColor: '#667eea',
    logo: '/logo.png',
    buttonText: 'Sign in'
  },

  logger: {
    error(code, metadata) {
      console.error('[NextAuth] Error:', {
        code,
        ...metadata,
        timestamp: new Date().toISOString()
      });
    },
    warn(code) {
      console.warn('[NextAuth] Warning:', {
        code,
        timestamp: new Date().toISOString()
      });
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[NextAuth] Debug:', {
          code,
          ...metadata,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export default authOptions;