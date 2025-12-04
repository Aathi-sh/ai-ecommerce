'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { appTheme } from "../../src/constants/theme";

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const router = useRouter();

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success/error messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: '✅ Login successful! Redirecting...' 
        });
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
          // Always redirect to admin dashboard regardless of role
          // You can customize this based on your needs
          router.push('/admin/dashboards');
        }, 1500);
        
      } else {
        // Handle specific error cases
        if (res.status === 401) {
          setMessage({ 
            type: 'error', 
            text: ' Incorrect email or password. Please try again.' 
          });
        } else if (res.status === 404) {
          setMessage({ 
            type: 'error', 
            text: ' Account not found. Please check your email.' 
          });
        } else if (res.status === 403) {
          setMessage({ 
            type: 'error', 
            text: ' Account is disabled. Please contact support.' 
          });
        } else if (res.status === 429) {
          setMessage({ 
            type: 'error', 
            text: '⚠️ Too many login attempts. Please try again later.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: data.message || 'Something went wrong. Please try again.' 
          });
        }
        
        // Clear password field on error for security
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
        setMessage({ 
          type: 'error', 
          text: 'Network error. Please check your internet connection.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Something went wrong. Please try again later.' 
        });
      }
      
      // Clear password on error
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    padding: "12px 16px",
    borderRadius: "10px",
    border: hasError ? `1.5px solid ${appTheme.colors.error}` : "1.5px solid #ddd",
    fontSize: "16px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.3s, box-shadow 0.3s",
    backgroundColor: appTheme.colors.surface,
  });

  const errorTextStyle = {
    color: appTheme.colors.error,
    fontSize: "12px",
    marginTop: "4px",
    textAlign: "left",
    display: "block",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appTheme.colors.background,
        fontFamily: appTheme.fonts.primary,
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: appTheme.colors.surface,
          padding: "40px",
          borderRadius: "20px",
          boxShadow: appTheme.shadows.lg,
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "30px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: appTheme.colors.primary + "20",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <span style={{ 
              fontSize: "24px", 
              color: appTheme.colors.primary,
              fontWeight: "bold"
            }}>
              🔐
            </span>
          </div>
          <h1
            style={{
              color: appTheme.colors.textPrimary,
              fontSize: "24px",
              marginBottom: "8px",
              fontWeight: "600",
            }}
          >
            Welcome Back
          </h1>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: "14px",
            marginBottom: "0",
          }}>
            Sign in to your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
          <div>
            <input
              name="email"
              type="email"
              required
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle(errors.email)}
              onFocus={(e) => e.target.style.borderColor = appTheme.colors.primary}
              onBlur={(e) => e.target.style.borderColor = errors.email ? appTheme.colors.error : "#ddd"}
            />
            {errors.email && (
              <span style={errorTextStyle}>
                ⚠️ {errors.email}
              </span>
            )}
          </div>
          
          <div>
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle(errors.password)}
              onFocus={(e) => e.target.style.borderColor = appTheme.colors.primary}
              onBlur={(e) => e.target.style.borderColor = errors.password ? appTheme.colors.error : "#ddd"}
            />
            {errors.password && (
              <span style={errorTextStyle}>
                ⚠️ {errors.password}
              </span>
            )}
          </div>

          <div style={{ textAlign: "right", marginTop: "-10px" }}>
            <Link 
              href="/forgotPass" 
              style={{
                color: appTheme.colors.primary,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => e.target.style.color = appTheme.colors.primaryDark}
              onMouseLeave={(e) => e.target.style.color = appTheme.colors.primary}
            >
              Forgot your password?
            </Link>
          </div>

          {message.text && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                backgroundColor: message.type === 'success' 
                  ? '#f0f9f0' 
                  : '#fef2f2',
                color: message.type === 'success' 
                  ? '#059669' 
                  : appTheme.colors.error,
                fontSize: "14px",
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                animation: "fadeIn 0.3s ease-in",
              }}
            >
              <span style={{ fontSize: "16px" }}>
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: appTheme.colors.primary,
              color: "#fff",
              padding: "14px",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              fontWeight: "600",
              marginTop: "10px",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#4338ca';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = appTheme.colors.primary;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }} />
                Signing in...
              </>
            ) : 'Sign in'}
          </button>

          <div style={{ 
            marginTop: "24px", 
            paddingTop: "24px", 
            borderTop: `1px solid ${appTheme.colors.border}` 
          }}>
            <p style={{
              color: appTheme.colors.textSecondary,
              fontSize: "14px",
              marginBottom: "16px",
            }}>
              Don't have an account?
            </p>
            <Link 
              href="/signup" 
              style={{
                color: appTheme.colors.primary,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.3s",
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1.5px solid ${appTheme.colors.primary}30`,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = `${appTheme.colors.primary}10`;
                e.target.style.paddingLeft = "20px";
                e.target.style.paddingRight = "20px";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.paddingLeft = "16px";
                e.target.style.paddingRight = "16px";
              }}
            >
              Create an account →
            </Link>
          </div>
        </form>

        <p
          style={{
            marginTop: "40px",
            color: appTheme.colors.textSecondary,
            fontSize: "12px",
            paddingTop: "20px",
            borderTop: `1px solid ${appTheme.colors.border}`,
          }}
        >
          © {new Date().getFullYear()} Step On Next. All rights reserved.
        </p>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus {
          box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
          border-color: ${appTheme.colors.primary} !important;
        }
      `}</style>
    </div>
  );
}




// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { appTheme } from "../../src/constants/theme";

// export default function LoginPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // 👉 Replace this with your actual login API later
//       if (email === "admin@example.com" && password === "admin123") {
//         alert("Login successful!");
//         router.push("/admin/dashboard"); // Redirect to dashboard
//       } else {
//         alert("Invalid credentials!");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       alert("Something went wrong. Try again.");
//     } finally {
//       setLoading(false);
//     }
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
//       }}
//     >
//       <div
//         style={{
//           width: "100%",
//           maxWidth: "400px",
//           backgroundColor: appTheme.colors.surface,
//           padding: "40px",
//           borderRadius: "20px",
//           boxShadow: appTheme.shadows.lg,
//           textAlign: "center",
//         }}
//       >
//         <h1
//           style={{
//             color: appTheme.colors.primary,
//             fontSize: "28px",
//             marginBottom: "20px",
//           }}
//         >
//           Admin Login
//         </h1>

//         <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             style={{
//               padding: "12px 16px",
//               borderRadius: "10px",
//               border: "1px solid #ccc",
//               fontSize: "16px",
//               outline: "none",
//             }}
//           />

//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             style={{
//               padding: "12px 16px",
//               borderRadius: "10px",
//               border: "1px solid #ccc",
//               fontSize: "16px",
//               outline: "none",
//             }}
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               backgroundColor: appTheme.colors.primary,
//               color: "#fff",
//               padding: "12px",
//               border: "none",
//               borderRadius: "12px",
//               fontSize: "16px",
//               cursor: loading ? "not-allowed" : "pointer",
//               transition: "background 0.3s",
//             }}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p
//           style={{
//             marginTop: "20px",
//             color: appTheme.colors.textSecondary,
//             fontSize: "14px",
//           }}
//         >
//           © {new Date().getFullYear()} WhatsApp AI E-Commerce
//         </p>
//       </div>
//     </div>
//   );
// }