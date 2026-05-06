// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { signIn } from 'next-auth/react';
// import { appTheme } from "../../src/constants/theme";

// export default function Signup() {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     role: 'user'
//   });
  
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [errors, setErrors] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });
  
//   const router = useRouter();

//   // Redirect if already authenticated (NextAuth will handle this via middleware)
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await fetch('/api/auth/session');
//         const session = await res.json();
//         if (session?.user) {
//           const redirectPath = session.user.role === 'admin' 
//             ? '/admin/dashboard' 
//             : '/dashboard';
//           router.push(redirectPath);
//         }
//       } catch (error) {
//         // Silent fail - user is not authenticated
//       }
//     };
//     checkAuth();
//   }, [router]);

//   const validateForm = () => {
//     const newErrors = { 
//       fullName: '', 
//       email: '', 
//       phone: '', 
//       password: '', 
//       confirmPassword: '' 
//     };
//     let isValid = true;

//     // Full name validation
//     if (!formData.fullName.trim()) {
//       newErrors.fullName = 'Full name is required';
//       isValid = false;
//     } else if (formData.fullName.trim().length < 2) {
//       newErrors.fullName = 'Full name must be at least 2 characters';
//       isValid = false;
//     }

//     // Email validation
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//       isValid = false;
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//       isValid = false;
//     }

//     // Phone validation
//     if (!formData.phone.trim()) {
//       newErrors.phone = 'Phone number is required';
//       isValid = false;
//     } else if (!/^\d{10,15}$/.test(formData.phone.trim())) {
//       newErrors.phone = 'Phone must be 10-15 digits';
//       isValid = false;
//     }

//     // Password validation
//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//       isValid = false;
//     } else if (formData.password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//       isValid = false;
//     } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
//       newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
//       isValid = false;
//     }

//     // Confirm password validation
//     if (!formData.confirmPassword) {
//       newErrors.confirmPassword = 'Please confirm your password';
//       isValid = false;
//     } else if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
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
//       console.log('📝 Attempting registration via NextAuth-compatible API...');
      
//       // Call the registration API (which will create user and send verification email)
//       const res = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           fullName: formData.fullName,
//           email: formData.email,
//           phone: formData.phone,
//           password: formData.password,
//           role: formData.role
//         }),
//       });

//       const data = await res.json();

//       console.log('📋 Registration response:', data);

//       if (res.ok && data.success) {
//         console.log('✅ Registration successful! Verification email sent.');
        
//         // Show success message
//         setMessage({ 
//           type: 'success', 
//           text: '✅ Account created successfully! Please check your email to verify your account before logging in.' 
//         });
        
//         // Clear form
//         setFormData({
//           fullName: '',
//           email: '',
//           phone: '',
//           password: '',
//           confirmPassword: '',
//           role: 'user'
//         });
        
//         // Optional: Auto-login after verification (commented for security)
//         // We'll require email verification first as per professional practice
        
//       } else {
//         // Handle error response
//         const errorMessage = data.message || 'Registration failed';
//         const field = data.field || null;
        
//         console.error('❌ Registration failed:', errorMessage);
        
//         setMessage({ 
//           type: 'error', 
//           text: `❌ ${errorMessage}` 
//         });
        
//         // Highlight specific field if provided
//         if (field && errors.hasOwnProperty(field)) {
//           setErrors(prev => ({
//             ...prev,
//             [field]: errorMessage
//           }));
//         }
        
//         // Clear password fields
//         setFormData(prev => ({ 
//           ...prev, 
//           password: '', 
//           confirmPassword: '' 
//         }));
//       }
//     } catch (error) {
//       console.error('❌ Registration error:', error);
      
//       let errorMessage = 'Something went wrong. Please try again.';
      
//       if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
//         errorMessage = 'Cannot connect to server. Please check your internet connection.';
//       }
      
//       setMessage({ 
//         type: 'error', 
//         text: `❌ ${errorMessage}` 
//       });
      
//       // Clear password fields
//       setFormData(prev => ({ 
//         ...prev, 
//         password: '', 
//         confirmPassword: '' 
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputStyle = (hasError) => ({
//     padding: "12px 16px",
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
//     marginTop: "4px",
//     textAlign: "left",
//     display: "block",
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
//             width: "48px",
//             height: "48px",
//             backgroundColor: appTheme.colors.primary + "20",
//             borderRadius: "12px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             margin: "0 auto 16px",
//           }}>
//             <span style={{ 
//               fontSize: "24px", 
//               color: appTheme.colors.primary,
//               fontWeight: "bold"
//             }}>
//               📝
//             </span>
//           </div>
//           <h1
//             style={{
//               color: appTheme.colors.textPrimary,
//               fontSize: "24px",
//               marginBottom: "8px",
//               fontWeight: "600",
//             }}
//           >
//             Create Account
//           </h1>
//           <p style={{
//             color: appTheme.colors.textSecondary,
//             fontSize: "14px",
//             marginBottom: "0",
//           }}>
//             Sign up and verify your email to get started
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
//           <div>
//             <input
//               name="fullName"
//               type="text"
//               required
//               placeholder="Full Name"
//               value={formData.fullName}
//               onChange={handleChange}
//               style={inputStyle(errors.fullName)}
//               disabled={loading}
//             />
//             {errors.fullName && <span style={errorTextStyle}>⚠️ {errors.fullName}</span>}
//           </div>
          
//           <div>
//             <input
//               name="email"
//               type="email"
//               required
//               placeholder="Email Address"
//               value={formData.email}
//               onChange={handleChange}
//               style={inputStyle(errors.email)}
//               disabled={loading}
//             />
//             {errors.email && <span style={errorTextStyle}>⚠️ {errors.email}</span>}
//           </div>
          
//           <div>
//             <input
//               name="phone"
//               type="tel"
//               required
//               placeholder="Phone Number"
//               value={formData.phone}
//               onChange={handleChange}
//               style={inputStyle(errors.phone)}
//               disabled={loading}
//             />
//             {errors.phone && <span style={errorTextStyle}>⚠️ {errors.phone}</span>}
//           </div>
          
//           <div>
//             <select
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               style={inputStyle(false)}
//               disabled={loading}
//             >
//               <option value="user">User Account</option>
//               <option value="admin">Admin Account</option>
//               <option value="manager">Manager Account</option>
//             </select>
//             <p style={{
//               fontSize: "12px",
//               color: appTheme.colors.textSecondary,
//               marginTop: "4px",
//               fontStyle: "italic"
//             }}>
//               Note: Admin accounts require additional verification
//             </p>
//           </div>
          
//           <div>
//             <input
//               name="password"
//               type="password"
//               required
//               placeholder="Password (min. 6 characters with uppercase, lowercase & numbers)"
//               value={formData.password}
//               onChange={handleChange}
//               style={inputStyle(errors.password)}
//               disabled={loading}
//             />
//             {errors.password && <span style={errorTextStyle}>⚠️ {errors.password}</span>}
//           </div>
          
//           <div>
//             <input
//               name="confirmPassword"
//               type="password"
//               required
//               placeholder="Confirm Password"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               style={inputStyle(errors.confirmPassword)}
//               disabled={loading}
//             />
//             {errors.confirmPassword && <span style={errorTextStyle}>⚠️ {errors.confirmPassword}</span>}
//           </div>

//           {message.text && (
//             <div
//               style={{
//                 padding: "12px 16px",
//                 borderRadius: "10px",
//                 backgroundColor: message.type === 'success' ? '#f0f9f0' : 
//                                message.type === 'warning' ? '#fff3cd' : '#fef2f2',
//                 color: message.type === 'success' ? '#059669' : 
//                       message.type === 'warning' ? '#856404' : appTheme.colors.error,
//                 fontSize: "14px",
//                 border: `1px solid ${message.type === 'success' ? '#bbf7d0' : 
//                         message.type === 'warning' ? '#ffeaa7' : '#fecaca'}`,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px",
//               }}
//             >
//               <span>
//                 {message.type === 'success' ? '✅' : 
//                  message.type === 'warning' ? '⚠️' : '❌'}
//               </span>
//               {message.text}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               backgroundColor: appTheme.colors.primary,
//               color: "#fff",
//               padding: "14px",
//               border: "none",
//               borderRadius: "12px",
//               fontSize: "16px",
//               cursor: loading ? "not-allowed" : "pointer",
//               fontWeight: "600",
//               marginTop: "10px",
//               opacity: loading ? 0.7 : 1,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "8px",
//               transition: "all 0.2s ease",
//             }}
//             onMouseEnter={(e) => {
//               if (!loading) e.target.style.opacity = "0.9";
//             }}
//             onMouseLeave={(e) => {
//               if (!loading) e.target.style.opacity = "1";
//             }}
//           >
//             {loading ? (
//               <>
//                 <span style={{
//                   width: "16px",
//                   height: "16px",
//                   border: "2px solid rgba(255,255,255,0.3)",
//                   borderTopColor: "#fff",
//                   borderRadius: "50%",
//                   animation: "spin 0.8s linear infinite",
//                 }} />
//                 Creating Account...
//               </>
//             ) : 'Create Account'}
//           </button>

//           <div style={{ 
//             marginTop: "24px", 
//             paddingTop: "24px", 
//             borderTop: `1px solid ${appTheme.colors.border}`,
//             textAlign: "center"
//           }}>
//             <p style={{
//               color: appTheme.colors.textSecondary,
//               fontSize: "14px",
//               marginBottom: "16px",
//             }}>
//               Already have an account?
//             </p>
//             <Link 
//               href="/login" 
//               style={{
//                 color: appTheme.colors.primary,
//                 textDecoration: "none",
//                 fontSize: "14px",
//                 fontWeight: "600",
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 padding: "8px 16px",
//                 borderRadius: "8px",
//                 border: `1.5px solid ${appTheme.colors.primary}30`,
//                 transition: "all 0.2s ease",
//               }}
//               onMouseEnter={(e) => {
//                 e.target.style.backgroundColor = appTheme.colors.primary + "10";
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.backgroundColor = "transparent";
//               }}
//             >
//               ← Sign in instead
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
//             By signing up, you agree to our Terms of Service and Privacy Policy.
//             Your account will be created but requires email verification before you can log in.
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
        
//         input:focus, select:focus {
//           border-color: ${appTheme.colors.primary} !important;
//           box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
//         }
        
//         input:disabled, select:disabled {
//           background-color: ${appTheme.colors.background};
//           cursor: not-allowed;
//         }
//       `}</style>
//     </div>
//   );
// }





















'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { appTheme } from "../../src/constants/theme";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Get theme values with fallbacks
  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const secondaryColor = appTheme?.colors?.secondary || "#8B5CF6";
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

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        if (session?.user) {
          const redirectPath = session.user.role === 'admin' 
            ? '/admin/dashboard' 
            : '/dashboard';
          router.push(redirectPath);
        }
      } catch (error) {
        // Silent fail - user is not authenticated
      }
    };
    checkAuth();
  }, [router]);

  const validateForm = () => {
    const newErrors = { 
      fullName: '', 
      email: '', 
      phone: '', 
      password: '', 
      confirmPassword: '' 
    };
    let isValid = true;

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone must be 10-15 digits';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
      console.log('📝 Attempting registration via NextAuth-compatible API...');
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await res.json();

      console.log('📋 Registration response:', data);

      if (res.ok && data.success) {
        console.log('✅ Registration successful! Verification email sent.');
        
        setMessage({ 
          type: 'success', 
          text: '✅ Account created successfully! Please check your email to verify your account before logging in.' 
        });
        
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'user'
        });
        
      } else {
        const errorMessage = data.message || 'Registration failed';
        const field = data.field || null;
        
        console.error('❌ Registration failed:', errorMessage);
        
        setMessage({ 
          type: 'error', 
          text: `❌ ${errorMessage}` 
        });
        
        if (field && errors.hasOwnProperty(field)) {
          setErrors(prev => ({
            ...prev,
            [field]: errorMessage
          }));
        }
        
        setFormData(prev => ({ 
          ...prev, 
          password: '', 
          confirmPassword: '' 
        }));
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      setMessage({ 
        type: 'error', 
        text: `❌ ${errorMessage}` 
      });
      
      setFormData(prev => ({ 
        ...prev, 
        password: '', 
        confirmPassword: '' 
      }));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.md} ${spacing.md}`,
    borderRadius: radiusMd,
    border: hasError ? `1.5px solid ${errorColor}` : `1.5px solid ${borderColor}`,
    fontSize: isMobile ? fontSizes.sm : fontSizes.base,
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

  return (
    <div
      style={{
        
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
            width: isMobile ? "48px" : "56px",
            height: isMobile ? "48px" : "56px",
            backgroundColor: `${primaryColor}20`,
            borderRadius: radiusLg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <span style={{ 
              fontSize: isMobile ? fontSizes.xl : fontSizes["2xl"], 
              color: primaryColor,
              fontWeight: fontWeights.bold
            }}>
              📝
            </span>
          </div>
          <h1
            style={{
              color: textPrimary,
              fontSize: isMobile ? fontSizes.xl : fontSizes["2xl"],
              marginBottom: spacing.xs,
              fontWeight: fontWeights.semibold,
            }}
          >
            Create Account
          </h1>
          <p style={{
            color: textSecondary,
            fontSize: isMobile ? fontSizes.sm : fontSizes.base,
            marginBottom: 0,
          }}>
            Sign up and verify your email to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: spacing.md }}>
          <div>
            <input
              name="fullName"
              type="text"
              required
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              style={inputStyle(errors.fullName)}
              disabled={loading}
            />
            {errors.fullName && <span style={errorTextStyle}>⚠️ {errors.fullName}</span>}
          </div>
          
          <div>
            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle(errors.email)}
              disabled={loading}
            />
            {errors.email && <span style={errorTextStyle}>⚠️ {errors.email}</span>}
          </div>
          
          <div>
            <input
              name="phone"
              type="tel"
              required
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              style={inputStyle(errors.phone)}
              disabled={loading}
            />
            {errors.phone && <span style={errorTextStyle}>⚠️ {errors.phone}</span>}
          </div>
          
          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={inputStyle(false)}
              disabled={loading}
            >
              <option value="user">User Account</option>
              <option value="admin">Admin Account</option>
              <option value="manager">Manager Account</option>
            </select>
            <p style={{
              fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
              color: textSecondary,
              marginTop: spacing.xs,
              fontStyle: "italic"
            }}>
              Note: Admin accounts require additional verification
            </p>
          </div>
          
          <div>
            <input
              name="password"
              type="password"
              required
              placeholder="Password (min. 6 characters with uppercase, lowercase & numbers)"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle(errors.password)}
              disabled={loading}
            />
            {errors.password && <span style={errorTextStyle}>⚠️ {errors.password}</span>}
          </div>
          
          <div>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={inputStyle(errors.confirmPassword)}
              disabled={loading}
            />
            {errors.confirmPassword && <span style={errorTextStyle}>⚠️ {errors.confirmPassword}</span>}
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
                alignItems: "center",
                gap: spacing.xs,
              }}
            >
              <span>
                {message.type === 'success' ? '✅' : 
                 message.type === 'warning' ? '⚠️' : '❌'}
              </span>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: primaryColor,
              color: "#fff",
              padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.md} ${spacing.md}`,
              border: "none",
              borderRadius: radiusLg,
              fontSize: isMobile ? fontSizes.base : fontSizes.lg,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: fontWeights.semibold,
              marginTop: spacing.sm,
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.xs,
              transition: transitionFast,
              fontFamily: fontFamily,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.opacity = "1";
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "16px",
                  height: "16px",
                  border: `2px solid rgba(255,255,255,0.3)`,
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>

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
            }}>
              Already have an account?
            </p>
            <Link 
              href="/login" 
              style={{
                color: primaryColor,
                textDecoration: "none",
                fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                fontWeight: fontWeights.semibold,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: radiusMd,
                border: `1.5px solid ${primaryColor}30`,
                transition: transitionFast,
                fontFamily: fontFamily,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = `${primaryColor}10`;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              ← Sign in instead
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
          }}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
            Your account will be created but requires email verification before you can log in.
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
        
        input:focus, select:focus {
          border-color: ${primaryColor} !important;
          box-shadow: 0 0 0 3px ${primaryColor}20;
        }
        
        input:disabled, select:disabled {
          background-color: ${backgroundColor};
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        /* Mobile-specific styles */
        @media (max-width: 768px) {
          input, select, button {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }
          
          input[type="text"],
          input[type="email"],
          input[type="tel"],
          input[type="password"],
          select {
            font-size: 16px !important; /* Prevents zoom on iOS */
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