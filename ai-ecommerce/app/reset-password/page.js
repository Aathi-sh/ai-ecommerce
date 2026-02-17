'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { appTheme } from "../../src/constants/theme";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const [tokenValid, setTokenValid] = useState(false);
  const [token, setToken] = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get token from URL
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setMessage({ 
        type: 'error', 
        text: '❌ Invalid or missing reset token' 
      });
      setTokenChecked(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        if (session?.user) {
          router.push('/dashboard');
        }
      } catch (error) {
        // Silent fail - user is not authenticated
      }
    };
    checkAuth();
  }, [router]);

  const validateToken = async (token) => {
    try {
      console.log('🔍 [ResetPassword] Validating reset token');
      
      const response = await fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setTokenValid(true);
        setMessage({ 
          type: 'success', 
          text: '✅ Token validated. You can now set your new password.' 
        });
      } else {
        setTokenValid(false);
        setMessage({ 
          type: 'error', 
          text: `❌ ${data.message || 'Invalid or expired reset token'}` 
        });
      }
    } catch (error) {
      console.error('❌ [ResetPassword] Token validation error:', error);
      setTokenValid(false);
      setMessage({ 
        type: 'error', 
        text: '❌ Failed to validate reset token' 
      });
    } finally {
      setTokenChecked(true);
    }
  };

  const validateForm = () => {
    const newErrors = { 
      password: '', 
      confirmPassword: '' 
    };
    let isValid = true;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tokenValid) {
      setMessage({ 
        type: 'error', 
        text: '❌ Invalid reset token' 
      });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log('🔐 [ResetPassword] Resetting password');
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();
      
      console.log('📋 [ResetPassword] Reset response:', data);

      if (response.ok && data.success) {
        // Success - show message and redirect
        setMessage({ 
          type: 'success', 
          text: '✅ Password reset successfully! Redirecting to login...' 
        });
        
        // Clear form
        setFormData({
          password: '',
          confirmPassword: '',
        });
        
        // Redirect to login after delay
        setTimeout(() => {
          router.push('/login?message=password_reset_success');
        }, 3000);
        
      } else {
        // Error response
        const errorMessage = data.message || 'Failed to reset password';
        setMessage({ 
          type: 'error', 
          text: `❌ ${errorMessage}` 
        });
        
        // Clear password fields on error
        setFormData({
          password: '',
          confirmPassword: '',
        });
        
        // If token is invalid, update token status
        if (data.code === 'INVALID_TOKEN') {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('❌ [ResetPassword] Reset error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      setMessage({ 
        type: 'error', 
        text: `❌ ${errorMessage}` 
      });
      
      // Clear password fields
      setFormData({
        password: '',
        confirmPassword: '',
      });
    } finally {
      setLoading(false);
    }
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

  const inputStyle = (hasError) => ({
    padding: "14px 16px",
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
    marginTop: "6px",
    textAlign: "left",
    display: "block",
  };

  const buttonStyle = {
    backgroundColor: appTheme.colors.primary,
    color: "#fff",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    cursor: loading || !tokenValid ? "not-allowed" : "pointer",
    fontWeight: "600",
    width: "100%",
    marginTop: "10px",
    opacity: loading || !tokenValid ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease",
  };

  // Show loading while checking token
  if (!tokenChecked) {
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
            maxWidth: "450px",
            backgroundColor: appTheme.colors.surface,
            padding: "40px",
            borderRadius: "20px",
            boxShadow: appTheme.shadows.lg,
            textAlign: "center",
          }}
        >
          <div style={{
            width: "64px",
            height: "64px",
            backgroundColor: appTheme.colors.primary + "15",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            border: `2px solid ${appTheme.colors.primary}30`,
          }}>
            <span style={{ 
              fontSize: "28px", 
              color: appTheme.colors.primary,
            }}>
              🔒
            </span>
          </div>
          <h1
            style={{
              color: appTheme.colors.textPrimary,
              fontSize: "24px",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            Verifying Reset Link
          </h1>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: "14px",
            marginBottom: "30px",
          }}>
            Please wait while we validate your reset link...
          </p>
          <div style={{
            width: "50px",
            height: "50px",
            border: `4px solid ${appTheme.colors.background}`,
            borderTopColor: appTheme.colors.primary,
            borderRadius: "50%",
            margin: "0 auto",
            animation: "spin 1s linear infinite",
          }} />
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid && tokenChecked) {
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
            maxWidth: "450px",
            backgroundColor: appTheme.colors.surface,
            padding: "40px",
            borderRadius: "20px",
            boxShadow: appTheme.shadows.lg,
            textAlign: "center",
          }}
        >
          <div style={{
            width: "64px",
            height: "64px",
            backgroundColor: appTheme.colors.error + "15",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            border: `2px solid ${appTheme.colors.error}30`,
          }}>
            <span style={{ 
              fontSize: "28px", 
              color: appTheme.colors.error,
            }}>
              ⚠️
            </span>
          </div>
          <h1
            style={{
              color: appTheme.colors.textPrimary,
              fontSize: "24px",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            Invalid Reset Link
          </h1>
          <div style={{
            padding: "16px",
            backgroundColor: '#fef2f2',
            borderRadius: "10px",
            border: `1px solid #fecaca`,
            color: appTheme.colors.error,
            fontSize: "14px",
            marginBottom: "30px",
            textAlign: "left",
          }}>
            <p style={{ margin: 0, lineHeight: "1.5" }}>
              {message.text}
            </p>
          </div>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: "14px",
            marginBottom: "30px",
          }}>
            This reset link may have expired or already been used.
          </p>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}>
            <Link 
              href="/forgot-password" 
              style={{
                backgroundColor: appTheme.colors.primary,
                color: "#fff",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "600",
                padding: "14px",
                borderRadius: "12px",
                display: "block",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.9";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Request New Reset Link
            </Link>
            <Link 
              href="/login" 
              style={{
                color: appTheme.colors.primary,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                padding: "10px",
                borderRadius: "8px",
                display: "block",
                textAlign: "center",
                border: `1.5px solid ${appTheme.colors.primary}30`,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = appTheme.colors.primary + "10";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show reset password form
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
          maxWidth: "450px",
          backgroundColor: appTheme.colors.surface,
          padding: "40px",
          borderRadius: "20px",
          boxShadow: appTheme.shadows.lg,
        }}
      >
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <div style={{
            width: "64px",
            height: "64px",
            backgroundColor: appTheme.colors.primary + "15",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            border: `2px solid ${appTheme.colors.primary}30`,
          }}>
            <span style={{ 
              fontSize: "28px", 
              color: appTheme.colors.primary,
            }}>
              🔐
            </span>
          </div>
          <h1
            style={{
              color: appTheme.colors.textPrimary,
              fontSize: "24px",
              marginBottom: "10px",
              fontWeight: "600",
            }}
          >
            Set New Password
          </h1>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: "14px",
            lineHeight: "1.5",
            marginBottom: "0",
            maxWidth: "320px",
            margin: "0 auto",
          }}>
            Create a strong, new password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "20px" }}>
          <div>
            <label style={{
              display: "block",
              color: appTheme.colors.textSecondary,
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
            }}>
              New Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="Enter new password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle(errors.password)}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && <span style={errorTextStyle}>⚠️ {errors.password}</span>}
            <div style={{
              fontSize: "12px",
              color: appTheme.colors.textSecondary,
              marginTop: "6px",
              paddingLeft: "4px",
            }}>
              • At least 6 characters<br />
              • Uppercase and lowercase letters<br />
              • At least one number
            </div>
          </div>
          
          <div>
            <label style={{
              display: "block",
              color: appTheme.colors.textSecondary,
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "8px",
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={inputStyle(errors.confirmPassword)}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span style={errorTextStyle}>⚠️ {errors.confirmPassword}</span>
            )}
          </div>

          {message.text && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                backgroundColor: message.type === 'success' ? '#f0f9f0' : 
                               message.type === 'warning' ? '#fff3cd' : '#fef2f2',
                color: message.type === 'success' ? '#059669' : 
                      message.type === 'warning' ? '#856404' : appTheme.colors.error,
                fontSize: "14px",
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : 
                        message.type === 'warning' ? '#ffeaa7' : '#fecaca'}`,
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span style={{ 
                fontSize: "16px",
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

          <div>
            <button
              type="submit"
              disabled={loading || !tokenValid}
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (!loading && tokenValid) {
                  e.target.style.opacity = "0.9";
                  e.target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && tokenValid) {
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
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }} />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          <div style={{ 
            marginTop: "10px",
            textAlign: "center",
          }}>
            <p style={{
              color: appTheme.colors.textSecondary,
              fontSize: "12px",
              lineHeight: "1.5",
              margin: 0,
            }}>
              🔒 Use a unique password that you don't use elsewhere.
              <br />
              ⏱️ This form will expire when the reset link expires.
            </p>
          </div>
        </form>

        <div style={{
          marginTop: "30px",
          padding: "16px",
          backgroundColor: appTheme.colors.background,
          borderRadius: "10px",
          border: `1px solid ${appTheme.colors.border}`,
        }}>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: "12px",
            lineHeight: "1.5",
            margin: 0,
            textAlign: "center",
          }}>
            ⚠️ After resetting your password, you'll be logged out of all devices
            for security reasons.
          </p>
        </div>

        <p
          style={{
            marginTop: "30px",
            color: appTheme.colors.textSecondary,
            fontSize: "12px",
            paddingTop: "20px",
            borderTop: `1px solid ${appTheme.colors.border}`,
            textAlign: "center",
          }}
        >
          © {new Date().getFullYear()} Steponext. All rights reserved.
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input:focus {
          border-color: ${appTheme.colors.primary} !important;
          box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
        }
        
        input:disabled {
          background-color: ${appTheme.colors.background};
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}