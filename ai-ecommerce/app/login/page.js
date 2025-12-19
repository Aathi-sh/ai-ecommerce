'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { appTheme } from "../../src/constants/theme";
import { useAuth } from '../../context/authContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ Already authenticated, redirecting to dashboard...');
      router.push('/admin/dashboards');
    }
  }, [isAuthenticated, user, router]);

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
      console.log('🔐 Attempting login for:', formData.email);
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('📋 Login response:', { 
        status: res.status, 
        success: data.success,
        hasToken: !!data.token,
        hasUser: !!data.user,
        dataStructure: data 
      });

      if (res.ok && data.success) {
        console.log('✅ Login successful!');
        
        // FIXED: Get token and user from ROOT LEVEL, not nested in data.data
        const token = data.token; // Direct from data.token
        const userData = data.user; // Direct from data.user
        
        console.log('📊 Extracted data:', {
          tokenExists: !!token,
          userDataExists: !!userData,
          tokenLength: token?.length,
          userEmail: userData?.email
        });
        
        if (!token || !userData) {
          console.error('❌ Missing token or user data:', { token, userData });
          throw new Error('No token or user data received from server');
        }
        
        console.log('💾 Storing auth data in localStorage...');
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set token expiry (7 days from now, matching JWT expiry)
        const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem('token_expiry', expiryTime.toString());
        
        // Also store sessionId if available
        if (data.sessionId) {
          localStorage.setItem('sessionId', data.sessionId);
        }
        
        console.log('🔄 Updating auth context...');
        
        // Update auth context
        const loginResult = await login(userData, token, {
          rememberMe: true,
          expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        if (loginResult.success) {
          console.log('✅ Auth context updated successfully');
          setMessage({ 
            type: 'success', 
            text: '✅ Login successful! Redirecting...' 
          });
          
          // Force reload to ensure auth state is updated
          setTimeout(() => {
            window.location.href = '/admin/dashboards';
          }, 1000);
          
        } else {
          console.error('❌ Auth context update failed:', loginResult.error);
          throw new Error(loginResult.error || 'Failed to update auth context');
        }
        
      } else {
        // Handle error response
        const errorMessage = data.message || 'Login failed';
        console.error('❌ Login failed:', errorMessage);
        
        if (res.status === 401) {
          if (data.requiresVerification) {
            setMessage({ 
              type: 'error', 
              text: '⚠️ Please verify your email first' 
            });
          } else {
            setMessage({ 
              type: 'error', 
              text: '❌ Incorrect email or password' 
            });
          }
        } else if (res.status === 403) {
          setMessage({ 
            type: 'error', 
            text: '⛔ Account is disabled. Please contact support.' 
          });
        } else if (res.status === 429) {
          setMessage({ 
            type: 'error', 
            text: '⚠️ Too many login attempts. Please try again later.' 
          });
        } else if (res.status === 404) {
          setMessage({ 
            type: 'error', 
            text: '❌ Account not found. Please check your email.' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: `❌ ${errorMessage}` 
          });
        }
        
        // Clear password field on error for security
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && (error.message.includes('NetworkError') || error.message.includes('Failed to fetch'))) {
        setMessage({ 
          type: 'error', 
          text: '🌐 Network error. Please check your internet connection.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ ${error.message || 'Something went wrong. Please try again.'}` 
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
                {message.type === 'success' ? '✅' : 
                 message.text.includes('⚠️') ? '⚠️' : '❌'}
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