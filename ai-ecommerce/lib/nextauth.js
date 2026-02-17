// import NextAuth from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import clientPromise from '@/lib/mongodb';
// import { connectDB } from '@/utils/db';
// import User from '@/models/user';
// import bcrypt from 'bcryptjs';

// /**
//  * Professional NextAuth Configuration v4
//  * Uses built-in MongoDB adapter (no separate package needed)
//  */

// export const authOptions = {
//   // ========== DATABASE ADAPTER ==========
//   // IMPORTANT: The adapter is configured differently in v4
//   adapter: {
//     async createUser(user) {
//       await connectDB();
//       const newUser = new User({
//         fullName: user.name,
//         email: user.email,
//         // Add other fields as needed
//         isVerified: false,
//         status: 'pending'
//       });
//       return await newUser.save();
//     },
    
//     async getUser(id) {
//       await connectDB();
//       return await User.findById(id).lean();
//     },
    
//     async getUserByEmail(email) {
//       await connectDB();
//       return await User.findOne({ email }).lean();
//     },
    
//     async updateUser(user) {
//       await connectDB();
//       return await User.findByIdAndUpdate(user.id, user, { new: true }).lean();
//     },
    
//     async deleteUser(id) {
//       await connectDB();
//       await User.findByIdAndUpdate(id, { status: 'deleted' });
//       return true;
//     },
    
//     async linkAccount(account) {
//       // Handle account linking if needed
//       return account;
//     },
    
//     async unlinkAccount({ provider, providerAccountId }) {
//       // Handle account unlinking if needed
//       return true;
//     },
    
//     async createSession(session) {
//       // Sessions are handled differently - we'll use JWT for simplicity
//       return session;
//     },
    
//     async getSessionAndUser(sessionToken) {
//       // Return null to force JWT usage
//       return null;
//     },
    
//     async updateSession(session) {
//       return session;
//     },
    
//     async deleteSession(sessionToken) {
//       return true;
//     },
    
//     async createVerificationToken(token) {
//       await connectDB();
//       const user = await User.findOne({ email: token.identifier });
//       if (user) {
//         user.verificationToken = token.token;
//         user.verificationTokenExpires = new Date(token.expires);
//         await user.save();
//       }
//       return token;
//     },
    
//     async useVerificationToken({ identifier, token }) {
//       await connectDB();
//       const user = await User.findOne({ 
//         email: identifier,
//         verificationToken: token
//       });
//       if (user && new Date(user.verificationTokenExpires) > new Date()) {
//         user.isVerified = true;
//         user.verificationToken = undefined;
//         user.verificationTokenExpires = undefined;
//         user.status = 'active';
//         await user.save();
//         return token;
//       }
//       return null;
//     }
//   },
  
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

//           await connectDB();

//           const user = await User.findOne({ email })
//             .select('+password +loginCount +status')
//             .lean();

//           if (!user) {
//             console.log('❌ [NextAuth] User not found for email:', email);
//             throw new Error('Invalid email or password');
//           }

//           if (user.status !== 'active') {
//             const statusMessages = {
//               'inactive': 'Your account is inactive. Please contact support.',
//               'suspended': 'Your account has been suspended.',
//               'deleted': 'Account not found.',
//               'pending': 'Account is pending verification.'
//             };
//             throw new Error(statusMessages[user.status] || 'Account is not active');
//           }

//           if (!user.isVerified) {
//             console.log('⚠️ [NextAuth] Unverified email attempt:', email);
//             throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
//           }

//           const isPasswordValid = await bcrypt.compare(password, user.password);
//           if (!isPasswordValid) {
//             console.log('❌ [NextAuth] Invalid password for user:', email);
//             throw new Error('Invalid email or password');
//           }

//           console.log('✅ [NextAuth] User authorized successfully:', {
//             id: user._id,
//             email: user.email,
//             role: user.role
//           });

//           return {
//             id: user._id.toString(),
//             email: user.email,
//             name: user.fullName || user.name || user.email.split('@')[0],
//             role: user.role || 'user',
//             isVerified: user.isVerified,
//             phone: user.phone,
//             image: null,
//           };
//         } catch (error) {
//           console.error('❌ [NextAuth] Authorization error:', error.message);
          
//           if (error.message.includes('Invalid email or password')) {
//             throw new Error('Invalid email or password');
//           }
//           if (error.message.includes('verify your email')) {
//             throw new Error('Please verify your email address before logging in');
//           }
          
//           throw new Error('Authentication failed. Please try again.');
//         }
//       }
//     })
//   ],

//   // ========== SESSION MANAGEMENT ==========
//   // Using JWT strategy for simplicity since custom adapter is complex
//   session: {
//     strategy: 'jwt', // Changed from 'database' to 'jwt'
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },

//   // ========== CALLBACKS ==========
//   callbacks: {
//     async jwt({ token, user, account, profile }) {
//       try {
//         // Initial sign in
//         if (user) {
//           token.id = user.id;
//           token.role = user.role;
//           token.isVerified = user.isVerified;
//           token.phone = user.phone;
//           token.isAdmin = user.role === 'admin';
//           token.isManager = user.role === 'manager';
//         }
        
//         // Update user data on each request
//         if (token.id) {
//           await connectDB();
//           const dbUser = await User.findById(token.id)
//             .select('role phone isVerified notificationSettings adminPreferences fullName status')
//             .lean();
          
//           if (dbUser) {
//             token.role = dbUser.role || 'user';
//             token.isVerified = dbUser.isVerified || false;
//             token.phone = dbUser.phone || '';
//             token.isAdmin = dbUser.role === 'admin';
//             token.isManager = dbUser.role === 'manager';
//             token.fullName = dbUser.fullName;
//             token.status = dbUser.status;
//           }
//         }
        
//         return token;
//       } catch (error) {
//         console.error('JWT callback error:', error);
//         return token;
//       }
//     },

//     async session({ session, token }) {
//       try {
//         if (session?.user && token) {
//           session.user.id = token.id;
//           session.user.role = token.role || 'user';
//           session.user.phone = token.phone || '';
//           session.user.isVerified = token.isVerified || false;
//           session.user.fullName = token.fullName || session.user.name;
//           session.user.status = token.status || 'active';
//           session.user.isAdmin = token.isAdmin || false;
//           session.user.isManager = token.isManager || false;
//           session.user.isAuthenticated = true;
//         }
//         return session;
//       } catch (error) {
//         console.error('Session callback error:', error);
//         return session;
//       }
//     },

//     async signIn({ user, account, profile, email, credentials }) {
//       try {
//         if (user) {
//           await connectDB();
//           await User.findByIdAndUpdate(user.id, {
//             lastLogin: new Date(),
//             $inc: { loginCount: 1 }
//           });
          
//           console.log('✅ [NextAuth] Sign in successful for:', user.email);
//           return true;
//         }
//         return false;
//       } catch (error) {
//         console.error('Sign in callback error:', error);
//         return false;
//       }
//     },

//     async redirect({ url, baseUrl }) {
//       if (url.startsWith('/')) {
//         return `${baseUrl}${url}`;
//       }
      
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
//     error: '/auth/error',
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
//     async signIn(message) {
//       console.log('📝 [NextAuth] User signed in:', {
//         email: message.user.email,
//         timestamp: new Date().toISOString(),
//         provider: message.account?.provider
//       });
//     },
//     async signOut(message) {
//       console.log('📝 [NextAuth] User signed out:', {
//         email: message.session?.user?.email,
//         timestamp: new Date().toISOString()
//       });
//     },
//     async createUser(message) {
//       console.log('📝 [NextAuth] User created:', {
//         email: message.user.email,
//         timestamp: new Date().toISOString()
//       });
//     },
//     async updateUser(message) {
//       console.log('📝 [NextAuth] User updated:', {
//         email: message.user.email,
//         timestamp: new Date().toISOString()
//       });
//     },
//     async linkAccount(message) {
//       console.log('📝 [NextAuth] Account linked:', {
//         email: message.user.email,
//         provider: message.account.provider,
//         timestamp: new Date().toISOString()
//       });
//     }
//   },

//   // ========== DEBUG & DEVELOPMENT ==========
//   debug: process.env.NODE_ENV === 'development',
  
//   // ========== THEME ==========
//   theme: {
//     colorScheme: "auto",
//     brandColor: "#667eea",
//     logo: "/logo.png",
//     buttonText: "Sign in"
//   },

//   // ========== LOGGER ==========
//   logger: {
//     error(code, metadata) {
//       console.error('[NextAuth] Error:', code, metadata);
//     },
//     warn(code) {
//       console.warn('[NextAuth] Warning:', code);
//     },
//     debug(code, metadata) {
//       if (process.env.NODE_ENV === 'development') {
//         console.debug('[NextAuth] Debug:', code, metadata);
//       }
//     }
//   }
// };

// // Export the handler for API routes
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
// export default authOptions;




import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '../utils/db';
import User from '../models/user';
import bcrypt from 'bcryptjs';

/**
 * Professional NextAuth Configuration
 * 
 * 🔥 FIXED: Proper status checking (not virtual isActive)
 * 🔥 FIXED: Consistent error codes for AuthContext
 * 🔥 FIXED: Session includes all necessary user data
 */

export const authOptions = {
  // ========== PROVIDERS ==========
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'example@domain.com',
          required: true 
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: '••••••••',
          required: true 
        },
      },
      
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const email = credentials.email.toLowerCase().trim();
          const password = credentials.password;

          console.log('🔐 [NextAuth] Authorization attempt for:', email);

          // Connect to database
          await connectDB();

          // Find user with password field (which is normally excluded)
          const user = await User.findOne({ email })
            .select('+password +security.failedLoginAttempts +security.lastFailedLogin')
            .lean();

          // User not found
          if (!user) {
            console.log('❌ [NextAuth] User not found for email:', email);
            throw new Error('No account found with this email');
          }

          // 🔥🔥🔥 PROFESSIONAL FIX: Check status directly (not virtual isActive) 🔥🔥🔥
          if (user.status !== 'active') {
            console.log('⚠️ [NextAuth] Account not active:', {
              email: user.email,
              status: user.status,
              isVerified: user.isVerified
            });

            // Use specific error codes that AuthContext can handle
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

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          
          if (!isPasswordValid) {
            console.log('❌ [NextAuth] Invalid password for user:', email);
            
            // Track failed login attempts for security
            try {
              await User.updateOne(
                { _id: user._id },
                {
                  $inc: { 'security.failedLoginAttempts': 1 },
                  $set: { 'security.lastFailedLogin': new Date() }
                }
              );

              // Auto-suspend after 5 failed attempts
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

          // Reset failed login attempts on successful login
          await User.updateOne(
            { _id: user._id },
            {
              $set: { 
                lastLogin: new Date(),
                'security.failedLoginAttempts': 0,
                'security.lastFailedLogin': null
              },
              $inc: { loginCount: 1 }
            }
          );

          console.log('✅ [NextAuth] User authorized successfully:', {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            status: user.status,
            isVerified: user.isVerified
          });

          // Return user object without sensitive data
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName || user.email.split('@')[0],
            fullName: user.fullName || user.email.split('@')[0],
            role: user.role || 'user',
            status: user.status, // ✅ Include actual status from DB
            isVerified: user.isVerified,
            phone: user.phone || '',
            notificationSettings: user.notificationSettings || {},
            adminPreferences: user.adminPreferences || {},
            image: null,
          };
          
        } catch (error) {
          console.error('❌ [NextAuth] Authorization error:', error.message);
          
          // Pass through specific error codes for AuthContext
          if ([
            'PENDING_VERIFICATION',
            'ACCOUNT_INACTIVE',
            'ACCOUNT_SUSPENDED',
            'ACCOUNT_DELETED',
            'No account found with this email',
            'Invalid password'
          ].includes(error.message)) {
            throw new Error(error.message);
          }
          
          // Generic error for other cases
          throw new Error('Authentication failed. Please try again.');
        }
      }
    })
  ],

  // ========== SESSION MANAGEMENT ==========
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // ========== JWT CALLBACK ==========
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        // Initial sign in - add user data to token
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.fullName = user.fullName || user.name;
          token.role = user.role || 'user';
          token.status = user.status || 'active'; // ✅ Store actual status in token
          token.isVerified = user.isVerified || false;
          token.phone = user.phone || '';
          token.notificationSettings = user.notificationSettings || {};
          token.adminPreferences = user.adminPreferences || {};
          token.isAdmin = user.role === 'admin';
          token.isManager = user.role === 'manager';
        }

        // Refresh user data from database on each JWT update
        if (token.id) {
          try {
            await connectDB();
            const dbUser = await User.findById(token.id)
              .select('role phone isVerified notificationSettings adminPreferences fullName status email')
              .lean();
            
            if (dbUser) {
              // Update token with latest DB data
              token.role = dbUser.role || 'user';
              token.status = dbUser.status || 'active'; // ✅ Keep status in sync with DB
              token.isVerified = dbUser.isVerified || false;
              token.phone = dbUser.phone || '';
              token.fullName = dbUser.fullName || token.name;
              token.notificationSettings = dbUser.notificationSettings || {};
              token.adminPreferences = dbUser.adminPreferences || {};
              token.email = dbUser.email;
              token.isAdmin = dbUser.role === 'admin';
              token.isManager = dbUser.role === 'manager';
            }
          } catch (dbError) {
            console.error('JWT: Failed to fetch user from DB:', dbError);
            // Continue with existing token if DB fetch fails
          }
        }

        // Handle session updates (e.g., after profile update)
        if (trigger === 'update' && session) {
          token = { ...token, ...session.user };
        }

        return token;
        
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },

    // ========== SESSION CALLBACK ==========
    async session({ session, token }) {
      try {
        if (session?.user && token) {
          // ✅ Include ALL necessary user data in session for AuthContext
          session.user = {
            id: token.id,
            email: token.email,
            name: token.name || token.email?.split('@')[0],
            fullName: token.fullName || token.name || token.email?.split('@')[0],
            role: token.role || 'user',
            status: token.status || 'active', // ✅ CRITICAL: Status from DB, not virtual
            isVerified: token.isVerified || false,
            phone: token.phone || '',
            notificationSettings: token.notificationSettings || {},
            adminPreferences: token.adminPreferences || {},
            isAdmin: token.role === 'admin',
            isManager: token.role === 'manager',
            // ✅ Derived isActive - NEVER stored in DB, just for frontend convenience
            isActive: token.status === 'active',
          };
          
          session.user.isAuthenticated = true;
        }
        
        return session;
        
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },

    // ========== SIGN IN CALLBACK ==========
    async signIn({ user, account, profile }) {
      try {
        if (user) {
          console.log('✅ [NextAuth] Sign in successful for:', user.email);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Sign in callback error:', error);
        return false;
      }
    },

    // ========== REDIRECT CALLBACK ==========
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    }
  },

  // ========== PAGES ==========
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login', // Will show error as query param
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },

  // ========== SECURITY ==========
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // ========== COOKIES ==========
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
        maxAge: 30 * 24 * 60 * 60, // 30 days
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

  // ========== EVENTS ==========
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log('📝 [NextAuth] User signed in:', {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        isNewUser,
        timestamp: new Date().toISOString()
      });
    },
    
    async signOut({ session, token }) {
      console.log('📝 [NextAuth] User signed out:', {
        email: session?.user?.email || token?.email,
        timestamp: new Date().toISOString()
      });
    },
    
    async createUser({ user }) {
      console.log('📝 [NextAuth] User created:', {
        id: user.id,
        email: user.email,
        role: user.role,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
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
        timestamp: new Date().toISOString()
      });
    }
  },

  // ========== DEBUG & DEVELOPMENT ==========
  debug: process.env.NODE_ENV === 'development',
  
  // ========== THEME ==========
  theme: {
    colorScheme: 'auto',
    brandColor: '#667eea',
    logo: '/logo.png',
    buttonText: 'Sign in'
  },

  // ========== LOGGER ==========
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

// Export the handler for API routes
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// Default export for authOptions
export default authOptions;