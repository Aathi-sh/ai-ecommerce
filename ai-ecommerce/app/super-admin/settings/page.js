// app/settings/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Key,
  LogOut,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Lock
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Form States
  const [nameForm, setNameForm] = useState({
    name: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: ""
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  });

  // Load user data
  useEffect(() => {
    if (session?.user) {
      setNameForm({
        name: session.user.name || session.user.fullName || ""
      });
      setForgotPasswordForm({
        email: session.user.email || ""
      });
    }
  }, [session]);

  // Check password strength
  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password)
    };

    let score = 0;
    if (strength.hasMinLength) score++;
    if (strength.hasUpperCase) score++;
    if (strength.hasLowerCase) score++;
    if (strength.hasNumber) score++;

    strength.score = score;
    setPasswordStrength(strength);
  };

  useEffect(() => {
    checkPasswordStrength(passwordForm.newPassword);
  }, [passwordForm.newPassword]);

  // ========== HANDLE NAME CHANGE ==========
  const handleNameChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch('/api/auth/update-name', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameForm.name })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update name');
      }

      // Update session
      await updateSession({
        ...session,
        user: {
          ...session.user,
          name: nameForm.name,
          fullName: nameForm.name
        }
      });

      setSuccess('Name updated successfully!');
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLE PASSWORD CHANGE ==========
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and numbers");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLE FORGOT PASSWORD ==========
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordForm.email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess('Password reset link sent to your email!');
      setShowForgotPassword(false);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLE LOGOUT ==========
  const handleLogout = async () => {
    setLoading(true);
    try {
      // Call logout API
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Sign out from NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: '/login'
      });
      
      // Redirect to login
      router.push('/login?loggedOut=true');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if API fails
      router.push('/login');
    } finally {
      setLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  // Get password strength color
  const getStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0: return '#ef4444';
      case 1: return '#f97316';
      case 2: return '#f59e0b';
      case 3: return '#10b981';
      case 4: return '#059669';
      default: return '#ef4444';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength.score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return 'Too Weak';
    }
  };

  return (
    <div style={styles.container}>
      {/* Success Toast */}
      {success && (
        <div style={styles.toast.success}>
          <CheckCircle size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess("")} style={styles.toast.close}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div style={styles.toast.error}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError("")} style={styles.toast.close}>
            <X size={16} />
          </button>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Account Settings</h1>
      </div>

      <div style={styles.grid}>
        {/* LEFT COLUMN - Name Change */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <User size={20} color="#3b82f6" />
            <h2 style={styles.cardTitle}>Change Name</h2>
          </div>

          <form onSubmit={handleNameChange} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                style={styles.input}
                placeholder="Enter your full name"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !nameForm.name}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ...(loading || !nameForm.name ? styles.buttonDisabled : {})
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Update Name
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN - Password Change */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Key size={20} color="#3b82f6" />
            <h2 style={styles.cardTitle}>Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <div style={styles.passwordInput}>
                <input
                  type={showPassword.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  style={styles.input}
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                  style={styles.passwordToggle}
                >
                  {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <div style={styles.passwordInput}>
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  style={styles.input}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  style={styles.passwordToggle}
                >
                  {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {passwordForm.newPassword && (
                <div style={styles.strengthContainer}>
                  <div style={styles.strengthBar}>
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        style={{
                          ...styles.strengthSegment,
                          backgroundColor: level <= passwordStrength.score
                            ? getStrengthColor()
                            : '#e5e7eb'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ ...styles.strengthText, color: getStrengthColor() }}>
                    {getStrengthText()}
                  </span>
                </div>
              )}

              <ul style={styles.requirements}>
                <li style={{ color: passwordStrength.hasMinLength ? '#10b981' : '#6b7280' }}>
                  ✓ At least 8 characters
                </li>
                <li style={{ color: passwordStrength.hasUpperCase ? '#10b981' : '#6b7280' }}>
                  ✓ One uppercase letter
                </li>
                <li style={{ color: passwordStrength.hasLowerCase ? '#10b981' : '#6b7280' }}>
                  ✓ One lowercase letter
                </li>
                <li style={{ color: passwordStrength.hasNumber ? '#10b981' : '#6b7280' }}>
                  ✓ One number
                </li>
              </ul>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <div style={styles.passwordInput}>
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={{
                    ...styles.input,
                    borderColor: passwordForm.confirmPassword && 
                      passwordForm.newPassword !== passwordForm.confirmPassword
                      ? '#ef4444'
                      : passwordForm.confirmPassword && 
                        passwordForm.newPassword === passwordForm.confirmPassword
                        ? '#10b981'
                        : '#e5e7eb'
                  }}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  style={styles.passwordToggle}
                >
                  {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <small style={styles.errorText}>Passwords don't match</small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || 
                !passwordForm.currentPassword || 
                !passwordForm.newPassword || 
                !passwordForm.confirmPassword ||
                passwordForm.newPassword !== passwordForm.confirmPassword ||
                passwordStrength.score < 3}
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                ...(loading || 
                  !passwordForm.currentPassword || 
                  !passwordForm.newPassword || 
                  !passwordForm.confirmPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword ||
                  passwordStrength.score < 3 ? styles.buttonDisabled : {})
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Change Password
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <button
            onClick={() => setShowForgotPassword(true)}
            style={styles.forgotPasswordLink}
          >
            Forgot your password?
          </button>
        </div>
      </div>

      {/* ACCOUNT ACTIONS CARD */}
      <div style={styles.actionsCard}>
        <h2 style={styles.actionsTitle}>Account Actions</h2>

        <div style={styles.actionsGrid}>
          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={styles.logoutButton}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ========== MODALS ========== */}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <LogOut size={24} color="#ef4444" />
              <h3 style={styles.modalTitle}>Confirm Logout</h3>
              <button onClick={() => setShowLogoutConfirm(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>Are you sure you want to log out?</p>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={styles.modalCancel}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loading}
                style={{
                  ...styles.modalConfirm,
                  ...(loading ? styles.buttonDisabled : {})
                }}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={styles.modalOverlay} onClick={() => setShowForgotPassword(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <Key size={24} color="#3b82f6" />
              <h3 style={styles.modalTitle}>Reset Password</h3>
              <button onClick={() => setShowForgotPassword(false)} style={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleForgotPassword}>
              <div style={styles.modalBody}>
                <p style={styles.modalText}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    value={forgotPasswordForm.email}
                    onChange={(e) => setForgotPasswordForm({ email: e.target.value })}
                    style={styles.input}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  style={styles.modalCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !forgotPasswordForm.email}
                  style={{
                    ...styles.modalSend,
                    ...(loading || !forgotPasswordForm.email ? styles.buttonDisabled : {})
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// ========== STYLES ==========
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Toast
  toast: {
    success: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#10b981',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease',
      maxWidth: '400px',
      width: 'calc(100% - 40px)',
    },
    error: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease',
      maxWidth: '400px',
      width: 'calc(100% - 40px)',
    },
    close: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      marginLeft: 'auto',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.8,
      ':hover': {
        opacity: 1,
      },
    },
  },

  // Header
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },

  // Cards
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },

  // Actions Card
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginTop: '24px',
  },
  actionsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 20px 0',
  },
  actionsGrid: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  // Form
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s ease',
    ':focus': {
      borderColor: '#3b82f6',
    },
  },
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px',
  },

  // Password Input
  passwordInput: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Password Strength
  strengthContainer: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  strengthBar: {
    display: 'flex',
    gap: '4px',
    flex: 1,
  },
  strengthSegment: {
    height: '4px',
    flex: 1,
    borderRadius: '2px',
    transition: 'background-color 0.2s ease',
  },
  strengthText: {
    fontSize: '12px',
    fontWeight: '500',
    minWidth: '70px',
  },
  requirements: {
    listStyle: 'none',
    padding: '12px',
    margin: '8px 0 0 0',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    fontSize: '12px',
    li: {
      marginBottom: '4px',
    },
  },

  // Buttons
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    minHeight: '44px',
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white',
    ':hover': {
      backgroundColor: '#2563eb',
    },
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: '#3b82f6',
    },
  },

  // Logout Button
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#fef2f2',
    color: '#ef4444',
    border: '1px solid #fee2e2',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#fee2e2',
    },
  },

  // Forgot Password Link
  forgotPasswordLink: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '16px',
    textDecoration: 'underline',
    padding: '8px',
    ':hover': {
      color: '#2563eb',
    },
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    flex: 1,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: '20px',
  },
  modalText: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  modalFooter: {
    padding: '20px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  modalCancel: {
    padding: '10px 16px',
    backgroundColor: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  modalConfirm: {
    padding: '10px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  modalSend: {
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },

  // Mobile Responsive
  '@media (max-width: 640px)': {
    grid: {
      gridTemplateColumns: '1fr',
    },
    container: {
      padding: '16px',
    },
    title: {
      fontSize: '24px',
    },
  },
};