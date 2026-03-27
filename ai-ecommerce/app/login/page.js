
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { signIn, useSession } from 'next-auth/react';
// import { appTheme } from "../../src/constants/theme";

// export default function Login() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     rememberMe: false
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [errors, setErrors] = useState({
//     email: '',
//     password: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
  
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { data: session, status } = useSession();
  
//   // Check for callback URL and error messages
//   useEffect(() => {
//     const error = searchParams.get('error');
//     const callbackUrl = searchParams.get('callbackUrl');
//     const verified = searchParams.get('verified');
//     const reset = searchParams.get('reset');
    
//     // Handle verification success
//     if (verified === 'true') {
//       setMessage({ 
//         type: 'success', 
//         text: '✅ Email verified successfully! You can now log in.' 
//       });
//     }
    
//     // Handle password reset success
//     if (reset === 'success') {
//       setMessage({ 
//         type: 'success', 
//         text: '✅ Password reset successfully! You can now log in with your new password.' 
//       });
//     }
    
//     // Handle NextAuth errors
//     if (error) {
//       let errorMessage = 'Authentication failed';
      
//       switch (error) {
//         case 'CredentialsSignin':
//           errorMessage = 'Invalid email or password';
//           break;
//         case 'EmailNotVerified':
//           errorMessage = 'Please verify your email before logging in';
//           break;
//         case 'AccountInactive':
//           errorMessage = 'Your account is inactive. Please contact support';
//           break;
//         case 'SessionExpired':
//           errorMessage = 'Your session has expired. Please log in again.';
//           break;
//         default:
//           errorMessage = `Authentication error: ${error}`;
//       }
      
//       setMessage({ 
//         type: 'error', 
//         text: `❌ ${errorMessage}` 
//       });
//     }
    
//     // Store callback URL for redirect after login
//     if (callbackUrl && typeof window !== 'undefined') {
//       sessionStorage.setItem('auth_callback_url', callbackUrl);
//     }
//   }, [searchParams]);

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (status === 'loading') return;
    
//     if (session?.user) {
//       console.log('✅ [Login] User already authenticated, redirecting...', session.user);
      
//       // Determine redirect path based on role and adminType
//       let redirectPath = '/dashboards';
      
//       if (session.user.role === 'admin') {
//         if (session.user.adminType === 'super') {
//           redirectPath = '/super-admin/dashboard';  // Super admin goes here
//           console.log('👑 Super admin detected, redirecting to:', redirectPath);
//         } else {
//           redirectPath = '/admin/dashboards';       // Company admin goes here
//           console.log('🏢 Company admin detected, redirecting to:', redirectPath);
//         }
//       } else if (session.user.role === 'manager') {
//         redirectPath = '/manager/dashboard';
//       } else {
//         redirectPath = '/dashboards';
//       }
      
//       router.push(redirectPath);
//     }
//   }, [session, status, router]);

//   const validateForm = () => {
//     const newErrors = { 
//       email: '', 
//       password: '' 
//     };
//     let isValid = true;

//     // Email validation
//     const email = formData.email.trim();
//     if (!email) {
//       newErrors.email = 'Email is required';
//       isValid = false;
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       newErrors.email = 'Please enter a valid email address';
//       isValid = false;
//     }

//     // Password validation
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//       isValid = false;
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
    
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
    
//     if (message.text) {
//       setMessage({ type: '', text: '' });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
    
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const email = formData.email.trim();
//       const password = formData.password;
      
//       console.log('🔐 [Login] Attempting authentication via NextAuth...');
      
//       // Sign in using NextAuth credentials provider
//       const result = await signIn('credentials', {
//         email,
//         password,
//         redirect: false, // We'll handle redirect manually
//         callbackUrl: '/', // Default callback URL
//       });

//       console.log('📋 [Login] NextAuth sign in result:', result);

//       if (result?.error) {
//         // Handle specific error cases
//         let errorMessage = 'Login failed. Please check your credentials.';
//         let errorType = 'error';
        
//         if (result.error.includes('Invalid email or password')) {
//           errorMessage = 'Invalid email or password';
//         } else if (result.error.includes('verify your email')) {
//           errorMessage = 'Please verify your email address before logging in';
//           errorType = 'warning';
//         } else if (result.error.includes('inactive')) {
//           errorMessage = 'Your account is inactive. Please contact support';
//         } else if (result.error.includes('Too many requests')) {
//           errorMessage = 'Too many login attempts. Please try again later.';
//         } else if (result.error.includes('PENDING_VERIFICATION')) {
//           errorMessage = 'Please verify your email before logging in';
//           errorType = 'warning';
//         } else if (result.error.includes('ACCOUNT_INACTIVE')) {
//           errorMessage = 'Your account is inactive. Please contact support';
//         } else if (result.error.includes('ACCOUNT_SUSPENDED')) {
//           errorMessage = 'Your account has been suspended. Please contact support';
//         } else if (result.error.includes('COMPANY_INACTIVE')) {
//           errorMessage = 'Your company account is inactive. Please contact support';
//         }
        
//         setMessage({ 
//           type: errorType, 
//           text: `${errorType === 'warning' ? '⚠️' : '❌'} ${errorMessage}` 
//         });
        
//         // Clear password field on error
//         setFormData(prev => ({ 
//           ...prev, 
//           password: '' 
//         }));
        
//         return;
//       }

//       // Login successful
//       console.log('✅ [Login] Authentication successful');
      
//       setMessage({ 
//         type: 'success', 
//         text: '✅ Login successful! Redirecting...' 
//       });
      
//       // Get the callback URL from sessionStorage or use default
//       const callbackUrl = sessionStorage.getItem('auth_callback_url') || 
//                         (formData.rememberMe ? '/dashboards' : '/');
      
//       // Clear the stored callback URL
//       sessionStorage.removeItem('auth_callback_url');
      
//       // Wait a moment for session to update
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       // Fetch updated session to get user role and adminType
//       const sessionRes = await fetch('/api/auth/session');
//       const sessionData = await sessionRes.json();
      
//       // Determine redirect path based on role and adminType
//       let redirectPath = callbackUrl;
      
//       if (sessionData?.user?.role === 'admin') {
//         if (sessionData.user.adminType === 'super') {
//           redirectPath = '/super-admin/dashboard';  // Super admin redirect
//           console.log('👑 Super admin login, redirecting to:', redirectPath);
//         } else {
//           redirectPath = '/admin/dashboards';       // Company admin redirect
//           console.log('🏢 Company admin login, redirecting to:', redirectPath);
//         }
//       } else if (sessionData?.user?.role === 'manager') {
//         redirectPath = '/manager/dashboard';
//       } else if (sessionData?.user?.role === 'user') {
//         redirectPath = '/dashboards';
//       }
      
//       console.log(`🔄 [Login] Redirecting to: ${redirectPath}`);
      
//       // Use router.push for SPA navigation
//       router.push(redirectPath);
      
//     } catch (error) {
//       console.error('❌ [Login] Authentication error:', error);
      
//       let errorMessage = 'Something went wrong. Please try again.';
      
//       if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
//         errorMessage = 'Cannot connect to server. Please check your internet connection.';
//       } else if (error.message.includes('NetworkError')) {
//         errorMessage = 'Network error. Please check your connection.';
//       }
      
//       setMessage({ 
//         type: 'error', 
//         text: `❌ ${errorMessage}` 
//       });
      
//       // Clear password field on error
//       setFormData(prev => ({ 
//         ...prev, 
//         password: '' 
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDemoLogin = async (role = 'user') => {
//     setLoading(true);
//     setMessage({ type: '', text: '' });
    
//     // Demo credentials (for development only)
//     const demoCredentials = {
//       user: { email: 'demo@example.com', password: 'Demo@123' },
//       admin: { email: 'admin@example.com', password: 'Admin@123' },
//       manager: { email: 'manager@example.com', password: 'Manager@123' }
//     };
    
//     try {
//       const credentials = demoCredentials[role];
      
//       console.log(`🧪 [Login] Attempting demo login as ${role}...`);
      
//       const result = await signIn('credentials', {
//         email: credentials.email,
//         password: credentials.password,
//         redirect: false,
//       });

//       if (result?.error) {
//         setMessage({ 
//           type: 'error', 
//           text: '❌ Demo login failed. Make sure demo users are seeded in database.' 
//         });
//       } else {
//         setMessage({ 
//           type: 'success', 
//           text: `✅ Demo ${role} login successful! Redirecting...` 
//         });
        
//         setTimeout(() => {
//           const redirectPath = role === 'admin' ? '/admin/dashboards' : 
//                               role === 'manager' ? '/manager/dashboard' : '/dashboards';
//           router.push(redirectPath);
//         }, 1500);
//       }
//     } catch (error) {
//       console.error('Demo login error:', error);
//       setMessage({ 
//         type: 'error', 
//         text: '❌ Demo login failed' 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputStyle = (hasError) => ({
//     padding: "14px 16px",
//     borderRadius: "10px",
//     border: hasError ? `1.5px solid ${appTheme.colors.error}` : "1.5px solid #ddd",
//     fontSize: "16px",
//     outline: "none",
//     width: "100%",
//     boxSizing: "border-box",
//     transition: "border-color 0.3s, box-shadow 0.3s",
//     backgroundColor: appTheme.colors.surface,
//   });

//   const errorTextStyle = {
//     color: appTheme.colors.error,
//     fontSize: "12px",
//     marginTop: "6px",
//     textAlign: "left",
//     display: "block",
//   };

//   const buttonStyle = {
//     backgroundColor: appTheme.colors.primary,
//     color: "#fff",
//     padding: "14px",
//     border: "none",
//     borderRadius: "12px",
//     fontSize: "16px",
//     cursor: loading ? "not-allowed" : "pointer",
//     fontWeight: "600",
//     width: "100%",
//     marginTop: "10px",
//     opacity: loading ? 0.7 : 1,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "8px",
//     transition: "all 0.2s ease",
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: appTheme.colors.background,
//         fontFamily: appTheme.fonts.primary,
//         padding: "20px",
//       }}
//     >
//       <div
//         style={{
//           width: "100%",
//           maxWidth: "450px",
//           backgroundColor: appTheme.colors.surface,
//           padding: "40px",
//           borderRadius: "20px",
//           boxShadow: appTheme.shadows.lg,
//         }}
//       >
//         <div style={{ marginBottom: "30px", textAlign: "center" }}>
//           <div style={{
//             width: "64px",
//             height: "64px",
//             backgroundColor: appTheme.colors.primary + "15",
//             borderRadius: "16px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             margin: "0 auto 20px",
//             border: `2px solid ${appTheme.colors.primary}30`,
//           }}>
//             <span style={{ 
//               fontSize: "32px", 
//               color: appTheme.colors.primary,
//             }}>
//               🔐
//             </span>
//           </div>
//           <h1
//             style={{
//               color: appTheme.colors.textPrimary,
//               fontSize: "28px",
//               marginBottom: "8px",
//               fontWeight: "700",
//             }}
//           >
//             Welcome Back
//           </h1>
//           <p style={{
//             color: appTheme.colors.textSecondary,
//             fontSize: "15px",
//             marginBottom: "0",
//             lineHeight: "1.5",
//           }}>
//             Sign in to your Steponext account
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
//           <div>
//             <label style={{
//               display: "block",
//               color: appTheme.colors.textSecondary,
//               fontSize: "14px",
//               fontWeight: "500",
//               marginBottom: "8px",
//             }}>
//               Email Address
//             </label>
//             <input
//               name="email"
//               type="email"
//               required
//               placeholder="you@example.com"
//               value={formData.email}
//               onChange={handleChange}
//               style={inputStyle(errors.email)}
//               disabled={loading}
//               autoComplete="email"
//               autoFocus
//             />
//             {errors.email && <span style={errorTextStyle}>⚠️ {errors.email}</span>}
//           </div>
          
//           <div>
//             <div style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: "8px",
//             }}>
//               <label style={{
//                 color: appTheme.colors.textSecondary,
//                 fontSize: "14px",
//                 fontWeight: "500",
//               }}>
//                 Password
//               </label>
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: appTheme.colors.primary,
//                   fontSize: "12px",
//                   cursor: "pointer",
//                   padding: "4px 8px",
//                   borderRadius: "4px",
//                   transition: "background-color 0.2s",
//                 }}
//                 onMouseEnter={(e) => {
//                   e.target.style.backgroundColor = appTheme.colors.primary + "10";
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = "transparent";
//                 }}
//               >
//                 {showPassword ? '👁️ Hide' : '👁️ Show'}
//               </button>
//             </div>
//             <div style={{ position: "relative" }}>
//               <input
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 required
//                 placeholder="••••••••"
//                 value={formData.password}
//                 onChange={handleChange}
//                 style={inputStyle(errors.password)}
//                 disabled={loading}
//                 autoComplete="current-password"
//               />
//             </div>
//             {errors.password && <span style={errorTextStyle}>⚠️ {errors.password}</span>}
//           </div>
          
//           <div style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: "10px",
//           }}>
//             <label style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               cursor: "pointer",
//               userSelect: "none",
//             }}>
//               <input
//                 name="rememberMe"
//                 type="checkbox"
//                 checked={formData.rememberMe}
//                 onChange={handleChange}
//                 style={{
//                   width: "18px",
//                   height: "18px",
//                   cursor: "pointer",
//                 }}
//                 disabled={loading}
//               />
//               <span style={{
//                 color: appTheme.colors.textSecondary,
//                 fontSize: "14px",
//               }}>
//                 Remember me
//               </span>
//             </label>
            
//             <Link 
//               href="/forgot-password" 
//               style={{
//                 color: appTheme.colors.primary,
//                 textDecoration: "none",
//                 fontSize: "14px",
//                 fontWeight: "500",
//                 transition: "all 0.2s ease",
//                 padding: "4px 8px",
//                 borderRadius: "4px",
//               }}
//               onMouseEnter={(e) => {
//                 e.target.style.textDecoration = "underline";
//                 e.target.style.backgroundColor = appTheme.colors.primary + "10";
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.textDecoration = "none";
//                 e.target.style.backgroundColor = "transparent";
//               }}
//             >
//               Forgot password?
//             </Link>
//           </div>

//           {message.text && (
//             <div
//               style={{
//                 padding: "14px 16px",
//                 borderRadius: "10px",
//                 backgroundColor: message.type === 'success' ? '#f0f9f0' : 
//                                message.type === 'warning' ? '#fff3cd' : '#fef2f2',
//                 color: message.type === 'success' ? '#059669' : 
//                       message.type === 'warning' ? '#856404' : appTheme.colors.error,
//                 fontSize: "14px",
//                 border: `1px solid ${message.type === 'success' ? '#bbf7d0' : 
//                         message.type === 'warning' ? '#ffeaa7' : '#fecaca'}`,
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: "10px",
//               }}
//             >
//               <span style={{ 
//                 fontSize: "16px",
//                 flexShrink: 0,
//                 marginTop: "1px",
//               }}>
//                 {message.type === 'success' ? '✅' : 
//                  message.type === 'warning' ? '⚠️' : '❌'}
//               </span>
//               <div style={{ flex: 1 }}>
//                 <p style={{ margin: 0, lineHeight: "1.5" }}>
//                   {message.text}
//                 </p>
//               </div>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             style={buttonStyle}
//             onMouseEnter={(e) => {
//               if (!loading) {
//                 e.target.style.opacity = "0.9";
//                 e.target.style.transform = "translateY(-1px)";
//               }
//             }}
//             onMouseLeave={(e) => {
//               if (!loading) {
//                 e.target.style.opacity = "1";
//                 e.target.style.transform = "translateY(0)";
//               }
//             }}
//           >
//             {loading ? (
//               <>
//                 <span style={{
//                   width: "18px",
//                   height: "18px",
//                   border: "2px solid rgba(255,255,255,0.3)",
//                   borderTopColor: "#fff",
//                   borderRadius: "50%",
//                   animation: "spin 0.8s linear infinite",
//                 }} />
//                 Signing In...
//               </>
//             ) : 'Sign In'}
//           </button>

//           {/* Demo Login Buttons (Development Only) */}
//           {process.env.NODE_ENV === 'development' && (
//             <div style={{
//               marginTop: "10px",
//             }}>
//               <p style={{
//                 color: appTheme.colors.textSecondary,
//                 fontSize: "12px",
//                 textAlign: "center",
//                 marginBottom: "10px",
//               }}>
//                 🧪 Development Demo:
//               </p>
//               <div style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(3, 1fr)",
//                 gap: "8px",
//               }}>
//                 {['user', 'manager', 'admin'].map((role) => (
//                   <button
//                     key={role}
//                     type="button"
//                     onClick={() => handleDemoLogin(role)}
//                     disabled={loading}
//                     style={{
//                       padding: "10px",
//                       border: `1px solid ${appTheme.colors.border}`,
//                       borderRadius: "8px",
//                       backgroundColor: appTheme.colors.surface,
//                       color: appTheme.colors.textSecondary,
//                       fontSize: "12px",
//                       cursor: loading ? "not-allowed" : "pointer",
//                       transition: "all 0.2s ease",
//                       textTransform: "capitalize",
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!loading) {
//                         e.target.style.backgroundColor = appTheme.colors.primary + "10";
//                         e.target.style.borderColor = appTheme.colors.primary;
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (!loading) {
//                         e.target.style.backgroundColor = appTheme.colors.surface;
//                         e.target.style.borderColor = appTheme.colors.border;
//                       }
//                     }}
//                   >
//                     {role}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div style={{ 
//             marginTop: "30px", 
//             paddingTop: "25px", 
//             borderTop: `1px solid ${appTheme.colors.border}`,
//             textAlign: "center"
//           }}>
//             <p style={{
//               color: appTheme.colors.textSecondary,
//               fontSize: "14px",
//               marginBottom: "16px",
//             }}>
//               Don't have an account?
//             </p>
//             <Link 
//               href="/signup" 
//               style={{
//                 color: appTheme.colors.primary,
//                 textDecoration: "none",
//                 fontSize: "14px",
//                 fontWeight: "600",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 padding: "10px 20px",
//                 borderRadius: "8px",
//                 border: `1.5px solid ${appTheme.colors.primary}30`,
//                 transition: "all 0.2s ease",
//               }}
//               onMouseEnter={(e) => {
//                 e.target.style.backgroundColor = appTheme.colors.primary + "10";
//                 e.target.style.transform = "translateX(2px)";
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.backgroundColor = "transparent";
//                 e.target.style.transform = "translateX(0)";
//               }}
//             >
//               Create Account →
//             </Link>
//           </div>
//         </form>

//         <div style={{
//           marginTop: "30px",
//           padding: "16px",
//           backgroundColor: appTheme.colors.background,
//           borderRadius: "10px",
//           border: `1px solid ${appTheme.colors.border}`,
//         }}>
//           <p style={{
//             color: appTheme.colors.textSecondary,
//             fontSize: "12px",
//             lineHeight: "1.5",
//             margin: 0,
//             textAlign: "center",
//           }}>
//             🔒 Your security is our priority. We use industry-standard encryption
//             to protect your data.
//           </p>
//         </div>

//         <p
//           style={{
//             marginTop: "30px",
//             color: appTheme.colors.textSecondary,
//             fontSize: "12px",
//             paddingTop: "20px",
//             borderTop: `1px solid ${appTheme.colors.border}`,
//             textAlign: "center",
//           }}
//         >
//           © {new Date().getFullYear()} Steponext. All rights reserved.
//         </p>
//       </div>

//       <style jsx>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
        
//         input:focus {
//           border-color: ${appTheme.colors.primary} !important;
//           box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
//         }
        
//         input:disabled, button:disabled {
//           background-color: ${appTheme.colors.background};
//           cursor: not-allowed;
//           opacity: 0.6;
//         }
        
//         @media (max-width: 480px) {
//           .container {
//             padding: 20px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }






















'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { appTheme } from "../../src/constants/theme";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  // Get theme values with fallbacks
  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const backgroundColor = appTheme?.colors?.background || "#F9FAFB";
  const surfaceColor = appTheme?.colors?.surface || appTheme?.colors?.backgroundCard || "#FFFFFF";
  const textPrimary = appTheme?.colors?.textPrimary || "#111827";
  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const errorColor = appTheme?.colors?.error || "#EF4444";
  const successColor = appTheme?.colors?.success || "#10B981";
  const warningColor = appTheme?.colors?.warning || "#F59E0B";
  
  // Get font values
  const fontFamily = appTheme?.fonts?.families?.primary || "Inter, sans-serif";
  const fontSizes = appTheme?.fonts?.sizes || {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
  };
  const fontWeights = appTheme?.fonts?.weights || {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  };
  
  // Get spacing
  const spacing = appTheme?.spacing || {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  };
  
  // Get transitions
  const transitionFast = appTheme?.transitions?.fast || "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
  const transitionNormal = appTheme?.transitions?.normal || "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  
  // Get radius
  const radiusMd = appTheme?.radius?.md || "8px";
  const radiusLg = appTheme?.radius?.lg || "12px";
  const radiusFull = appTheme?.radius?.full || "9999px";
  
  // Get shadows
  const shadowLg = appTheme?.shadows?.lg || "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
  
  // Check for mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Check for callback URL and error messages
  useEffect(() => {
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl');
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    
    // Handle verification success
    if (verified === 'true') {
      setMessage({ 
        type: 'success', 
        text: '✅ Email verified successfully! You can now log in.' 
      });
    }
    
    // Handle password reset success
    if (reset === 'success') {
      setMessage({ 
        type: 'success', 
        text: '✅ Password reset successfully! You can now log in with your new password.' 
      });
    }
    
    // Handle NextAuth errors
    if (error) {
      let errorMessage = 'Authentication failed';
      
      switch (error) {
        case 'CredentialsSignin':
          errorMessage = 'Invalid email or password';
          break;
        case 'EmailNotVerified':
          errorMessage = 'Please verify your email before logging in';
          break;
        case 'AccountInactive':
          errorMessage = 'Your account is inactive. Please contact support';
          break;
        case 'SessionExpired':
          errorMessage = 'Your session has expired. Please log in again.';
          break;
        default:
          errorMessage = `Authentication error: ${error}`;
      }
      
      setMessage({ 
        type: 'error', 
        text: `❌ ${errorMessage}` 
      });
    }
    
    // Store callback URL for redirect after login
    if (callbackUrl && typeof window !== 'undefined') {
      sessionStorage.setItem('auth_callback_url', callbackUrl);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user) {
      console.log('✅ [Login] User already authenticated, redirecting...', session.user);
      
      // Determine redirect path based on role and adminType
      let redirectPath = '/dashboards';
      
      if (session.user.role === 'admin') {
        if (session.user.adminType === 'super') {
          redirectPath = '/super-admin/dashboard';
          console.log('👑 Super admin detected, redirecting to:', redirectPath);
        } else {
          redirectPath = '/admin/dashboards';
          console.log('🏢 Company admin detected, redirecting to:', redirectPath);
        }
      } else if (session.user.role === 'manager') {
        redirectPath = '/manager/dashboard';
      } else {
        redirectPath = '/dashboards';
      }
      
      router.push(redirectPath);
    }
  }, [session, status, router]);

  const validateForm = () => {
    const newErrors = { 
      email: '', 
      password: '' 
    };
    let isValid = true;

    // Email validation
    const email = formData.email.trim();
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const email = formData.email.trim();
      const password = formData.password;
      
      console.log('🔐 [Login] Attempting authentication via NextAuth...');
      
      // Sign in using NextAuth credentials provider
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/',
      });

      console.log('📋 [Login] NextAuth sign in result:', result);

      if (result?.error) {
        let errorMessage = 'Login failed. Please check your credentials.';
        let errorType = 'error';
        
        if (result.error.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password';
        } else if (result.error.includes('verify your email')) {
          errorMessage = 'Please verify your email address before logging in';
          errorType = 'warning';
        } else if (result.error.includes('inactive')) {
          errorMessage = 'Your account is inactive. Please contact support';
        } else if (result.error.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (result.error.includes('PENDING_VERIFICATION')) {
          errorMessage = 'Please verify your email before logging in';
          errorType = 'warning';
        } else if (result.error.includes('ACCOUNT_INACTIVE')) {
          errorMessage = 'Your account is inactive. Please contact support';
        } else if (result.error.includes('ACCOUNT_SUSPENDED')) {
          errorMessage = 'Your account has been suspended. Please contact support';
        } else if (result.error.includes('COMPANY_INACTIVE')) {
          errorMessage = 'Your company account is inactive. Please contact support';
        }
        
        setMessage({ 
          type: errorType, 
          text: `${errorType === 'warning' ? '⚠️' : '❌'} ${errorMessage}` 
        });
        
        setFormData(prev => ({ 
          ...prev, 
          password: '' 
        }));
        
        return;
      }

      console.log('✅ [Login] Authentication successful');
      
      setMessage({ 
        type: 'success', 
        text: '✅ Login successful! Redirecting...' 
      });
      
      const callbackUrl = sessionStorage.getItem('auth_callback_url') || 
                        (formData.rememberMe ? '/dashboards' : '/');
      
      sessionStorage.removeItem('auth_callback_url');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      let redirectPath = callbackUrl;
      
      if (sessionData?.user?.role === 'admin') {
        if (sessionData.user.adminType === 'super') {
          redirectPath = '/super-admin/dashboard';
          console.log('👑 Super admin login, redirecting to:', redirectPath);
        } else {
          redirectPath = '/admin/dashboards';
          console.log('🏢 Company admin login, redirecting to:', redirectPath);
        }
      } else if (sessionData?.user?.role === 'manager') {
        redirectPath = '/manager/dashboard';
      } else if (sessionData?.user?.role === 'user') {
        redirectPath = '/dashboards';
      }
      
      console.log(`🔄 [Login] Redirecting to: ${redirectPath}`);
      router.push(redirectPath);
      
    } catch (error) {
      console.error('❌ [Login] Authentication error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setMessage({ 
        type: 'error', 
        text: `❌ ${errorMessage}` 
      });
      
      setFormData(prev => ({ 
        ...prev, 
        password: '' 
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role = 'user') => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const demoCredentials = {
      user: { email: 'demo@example.com', password: 'Demo@123' },
      admin: { email: 'admin@example.com', password: 'Admin@123' },
      manager: { email: 'manager@example.com', password: 'Manager@123' }
    };
    
    try {
      const credentials = demoCredentials[role];
      
      console.log(`🧪 [Login] Attempting demo login as ${role}...`);
      
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setMessage({ 
          type: 'error', 
          text: '❌ Demo login failed. Make sure demo users are seeded in database.' 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: `✅ Demo ${role} login successful! Redirecting...` 
        });
        
        setTimeout(() => {
          const redirectPath = role === 'admin' ? '/admin/dashboards' : 
                              role === 'manager' ? '/manager/dashboard' : '/dashboards';
          router.push(redirectPath);
        }, 1500);
      }
    } catch (error) {
      console.error('Demo login error:', error);
      setMessage({ 
        type: 'error', 
        text: '❌ Demo login failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.md} ${spacing.md}`,
    borderRadius: radiusMd,
    border: hasError ? `1.5px solid ${errorColor}` : `1.5px solid ${borderColor}`,
    fontSize: isMobile ? fontSizes.base : fontSizes.base,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: transitionFast,
    backgroundColor: surfaceColor,
    color: textPrimary,
    fontFamily: fontFamily,
    fontWeight: fontWeights.normal,
  });

  const errorTextStyle = {
    color: errorColor,
    fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
    marginTop: spacing.xs,
    textAlign: "left",
    display: "block",
    fontFamily: fontFamily,
  };

  const buttonStyle = {
    backgroundColor: primaryColor,
    color: "#fff",
    padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.md} ${spacing.md}`,
    border: "none",
    borderRadius: radiusLg,
    fontSize: isMobile ? fontSizes.base : fontSizes.lg,
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: fontWeights.semibold,
    width: "100%",
    marginTop: spacing.xs,
    opacity: loading ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    transition: transitionFast,
    fontFamily: fontFamily,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: backgroundColor,
        fontFamily: fontFamily,
        padding: isMobile ? spacing.md : spacing.lg,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? "100%" : "480px",
          backgroundColor: surfaceColor,
          padding: isMobile ? spacing.lg : spacing.xl,
          borderRadius: radiusLg,
          boxShadow: shadowLg,
          margin: isMobile ? spacing.sm : "0",
          maxHeight: isMobile ? "calc(100vh - 32px)" : "auto",
          overflowY: isMobile ? "auto" : "visible",
        }}
      >
        <div style={{ marginBottom: spacing.lg, textAlign: "center" }}>
          <div style={{
            width: isMobile ? "56px" : "64px",
            height: isMobile ? "56px" : "64px",
            backgroundColor: `${primaryColor}15`,
            borderRadius: radiusLg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            border: `2px solid ${primaryColor}30`,
          }}>
            <span style={{ 
              fontSize: isMobile ? fontSizes.xl : fontSizes["2xl"], 
              color: primaryColor,
            }}>
              🔐
            </span>
          </div>
          <h1
            style={{
              color: textPrimary,
              fontSize: isMobile ? fontSizes.xl : fontSizes["3xl"],
              marginBottom: spacing.xs,
              fontWeight: fontWeights.bold,
            }}
          >
            Welcome Back
          </h1>
          <p style={{
            color: textSecondary,
            fontSize: isMobile ? fontSizes.sm : fontSizes.base,
            marginBottom: 0,
            lineHeight: "1.5",
          }}>
            Sign in to your Steponext account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: spacing.md }}>
          <div>
            <label style={{
              display: "block",
              color: textSecondary,
              fontSize: isMobile ? fontSizes.sm : fontSizes.base,
              fontWeight: fontWeights.medium,
              marginBottom: spacing.xs,
              fontFamily: fontFamily,
            }}>
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle(errors.email)}
              disabled={loading}
              autoComplete="email"
              autoFocus
            />
            {errors.email && <span style={errorTextStyle}>⚠️ {errors.email}</span>}
          </div>
          
          <div>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.xs,
            }}>
              <label style={{
                color: textSecondary,
                fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                fontWeight: fontWeights.medium,
                fontFamily: fontFamily,
              }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: "none",
                  border: "none",
                  color: primaryColor,
                  fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
                  cursor: "pointer",
                  padding: `${spacing.xs} ${spacing.sm}`,
                  borderRadius: radiusMd,
                  transition: transitionFast,
                  fontFamily: fontFamily,
                  fontWeight: fontWeights.medium,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = `${primaryColor}10`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                {showPassword ? '👁️ Hide' : '👁️ Show'}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={inputStyle(errors.password)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <span style={errorTextStyle}>⚠️ {errors.password}</span>}
          </div>
          
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: spacing.xs,
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: spacing.xs,
              cursor: "pointer",
              userSelect: "none",
            }}>
              <input
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                style={{
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                }}
                disabled={loading}
              />
              <span style={{
                color: textSecondary,
                fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
                fontFamily: fontFamily,
              }}>
                Remember me
              </span>
            </label>
            
            <Link 
              href="/forgot-password" 
              style={{
                color: primaryColor,
                textDecoration: "none",
                fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
                fontWeight: fontWeights.medium,
                transition: transitionFast,
                padding: `${spacing.xs} ${spacing.sm}`,
                borderRadius: radiusMd,
                fontFamily: fontFamily,
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = "underline";
                e.target.style.backgroundColor = `${primaryColor}10`;
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = "none";
                e.target.style.backgroundColor = "transparent";
              }}
            >
              Forgot password?
            </Link>
          </div>

          {message.text && (
            <div
              style={{
                padding: spacing.sm,
                borderRadius: radiusMd,
                backgroundColor: message.type === 'success' ? `${successColor}10` : 
                               message.type === 'warning' ? `${warningColor}10` : `${errorColor}10`,
                color: message.type === 'success' ? successColor : 
                      message.type === 'warning' ? warningColor : errorColor,
                fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                border: `1px solid ${message.type === 'success' ? successColor : 
                        message.type === 'warning' ? warningColor : errorColor}30`,
                display: "flex",
                alignItems: "flex-start",
                gap: spacing.xs,
                fontFamily: fontFamily,
              }}
            >
              <span style={{ 
                fontSize: isMobile ? fontSizes.base : fontSizes.lg,
                flexShrink: 0,
                marginTop: "1px",
              }}>
                {message.type === 'success' ? '✅' : 
                 message.type === 'warning' ? '⚠️' : '❌'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, lineHeight: "1.5" }}>
                  {message.text}
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.opacity = "0.9";
                e.target.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.opacity = "1";
                e.target.style.transform = "translateY(0)";
              }
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "18px",
                  height: "18px",
                  border: `2px solid rgba(255,255,255,0.3)`,
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                Signing In...
              </>
            ) : 'Sign In'}
          </button>

          {/* Demo Login Buttons (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              marginTop: spacing.xs,
            }}>
              <p style={{
                color: textSecondary,
                fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
                textAlign: "center",
                marginBottom: spacing.xs,
                fontFamily: fontFamily,
              }}>
                🧪 Development Demo:
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: spacing.xs,
              }}>
                {['user', 'manager', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDemoLogin(role)}
                    disabled={loading}
                    style={{
                      padding: isMobile ? spacing.xs : spacing.sm,
                      border: `1px solid ${borderColor}`,
                      borderRadius: radiusMd,
                      backgroundColor: surfaceColor,
                      color: textSecondary,
                      fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: transitionFast,
                      textTransform: "capitalize",
                      fontFamily: fontFamily,
                      fontWeight: fontWeights.medium,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = `${primaryColor}10`;
                        e.target.style.borderColor = primaryColor;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = surfaceColor;
                        e.target.style.borderColor = borderColor;
                      }
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: spacing.lg, 
            paddingTop: spacing.lg, 
            borderTop: `1px solid ${borderColor}`,
            textAlign: "center"
          }}>
            <p style={{
              color: textSecondary,
              fontSize: isMobile ? fontSizes.sm : fontSizes.base,
              marginBottom: spacing.md,
              fontFamily: fontFamily,
            }}>
              Don't have an account?
            </p>
            <Link 
              href="/signup" 
              style={{
                color: primaryColor,
                textDecoration: "none",
                fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                fontWeight: fontWeights.semibold,
                display: "inline-flex",
                alignItems: "center",
                gap: spacing.xs,
                padding: isMobile ? `${spacing.xs} ${spacing.md}` : `${spacing.sm} ${spacing.lg}`,
                borderRadius: radiusMd,
                border: `1.5px solid ${primaryColor}30`,
                transition: transitionFast,
                fontFamily: fontFamily,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = `${primaryColor}10`;
                e.target.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.transform = "translateX(0)";
              }}
            >
              Create Account →
            </Link>
          </div>
        </form>

        <div style={{
          marginTop: spacing.lg,
          padding: spacing.md,
          backgroundColor: backgroundColor,
          borderRadius: radiusMd,
          border: `1px solid ${borderColor}`,
        }}>
          <p style={{
            color: textSecondary,
            fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
            lineHeight: "1.5",
            margin: 0,
            textAlign: "center",
            fontFamily: fontFamily,
          }}>
            🔒 Your security is our priority. We use industry-standard encryption
            to protect your data.
          </p>
        </div>

        <p
          style={{
            marginTop: spacing.lg,
            color: textSecondary,
            fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
            paddingTop: spacing.md,
            borderTop: `1px solid ${borderColor}`,
            textAlign: "center",
            fontFamily: fontFamily,
          }}
        >
          © {new Date().getFullYear()} Steponext. All rights reserved.
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input:focus {
          border-color: ${primaryColor} !important;
          box-shadow: 0 0 0 3px ${primaryColor}20;
        }
        
        input:disabled, button:disabled {
          background-color: ${backgroundColor};
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        /* Mobile-specific styles */
        @media (max-width: 768px) {
          input, button {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          
          input[type="email"],
          input[type="password"] {
            font-size: 16px !important;
          }
          
          button {
            -webkit-tap-highlight-color: transparent;
          }
        }
        
        /* Smooth scrolling for mobile */
        @media (max-width: 768px) {
          div {
            scrollbar-width: thin;
          }
          
          div::-webkit-scrollbar {
            width: 4px;
          }
          
          div::-webkit-scrollbar-track {
            background: ${backgroundColor};
          }
          
          div::-webkit-scrollbar-thumb {
            background-color: ${borderColor};
            border-radius: ${radiusFull};
          }
        }
      `}</style>
    </div>
  );
}