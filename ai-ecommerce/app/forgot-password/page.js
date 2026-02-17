'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { appTheme } from "../../src/constants/theme";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({ email: '' });
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        if (session?.user) {
          router.push('/dashboards');
        }
      } catch (error) {
        // Silent fail - user is not authenticated
      }
    };
    checkAuth();
  }, [router]);

  const validateForm = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (countdown > 0) {
      setMessage({ 
        type: 'warning', 
        text: `Please wait ${countdown} seconds before requesting another reset link` 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setErrors({ email: '' });

    try {
      console.log('📧 [ForgotPassword] Requesting password reset for:', email);
      
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await response.json();
      
      console.log('📋 [ForgotPassword] Reset response:', data);

      if (response.ok && data.success) {
        // Success - show message and start cooldown
        setMessage({ 
          type: 'success', 
          text: data.message || 'Password reset link sent! Check your email (including spam folder).' 
        });
        
        // Clear email field
        setEmail('');
        
        // Start 60-second cooldown
        setCountdown(60);
        
        // Show additional instructions
        setTimeout(() => {
          setMessage(prev => ({
            ...prev,
            text: `${prev.text} The link will expire in 1 hour.`
          }));
        }, 3000);
        
      } else {
        // Error response
        const errorMessage = data.message || 'Failed to send reset link';
        setMessage({ 
          type: 'error', 
          text: `❌ ${errorMessage}` 
        });
        
        // Set specific field error if provided
        if (data.field === 'email') {
          setErrors({ email: errorMessage });
        }
      }
    } catch (error) {
      console.error('❌ [ForgotPassword] Request error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      setMessage({ 
        type: 'error', 
        text: `❌ ${errorMessage}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    if (errors.email) {
      setErrors({ email: '' });
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
    cursor: loading || countdown > 0 ? "not-allowed" : "pointer",
    fontWeight: "600",
    width: "100%",
    marginTop: "10px",
    opacity: loading || countdown > 0 ? 0.7 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.2s ease",
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
              🔑
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
            Reset Your Password
          </h1>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: "14px",
            lineHeight: "1.5",
            marginBottom: "0",
            maxWidth: "320px",
            margin: "0 auto",
          }}>
            Enter your email address and we'll send you a secure link to reset your password.
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
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="Enter your registered email"
              value={email}
              onChange={handleChange}
              style={inputStyle(errors.email)}
              disabled={loading || countdown > 0}
              autoComplete="email"
            />
            {errors.email && <span style={errorTextStyle}>⚠️ {errors.email}</span>}
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
                {message.type === 'success' && countdown > 0 && (
                  <p style={{
                    margin: "8px 0 0 0",
                    fontSize: "13px",
                    color: "#666",
                    fontStyle: "italic",
                  }}>
                    Resend available in {countdown} seconds
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || countdown > 0}
              style={buttonStyle}
              onMouseEnter={(e) => {
                if (!loading && countdown === 0) {
                  e.target.style.opacity = "0.9";
                  e.target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && countdown === 0) {
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
                  Sending Reset Link...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Send Reset Link'
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
              📧 The reset link will be valid for 1 hour.
              <br />
              📁 Check your spam folder if you don't see the email.
            </p>
          </div>

          <div style={{ 
            marginTop: "30px", 
            paddingTop: "25px", 
            borderTop: `1px solid ${appTheme.colors.border}`,
            textAlign: "center"
          }}>
            <Link 
              href="/login" 
              style={{
                color: appTheme.colors.primary,
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 20px",
                borderRadius: "8px",
                border: `1.5px solid ${appTheme.colors.primary}20`,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = appTheme.colors.primary + "10";
                e.target.style.transform = "translateX(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.transform = "translateX(0)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Login
            </Link>
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
            🔒 For security reasons, password reset links expire after 1 hour.
            If you don't receive an email within 5 minutes, please check your spam folder.
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