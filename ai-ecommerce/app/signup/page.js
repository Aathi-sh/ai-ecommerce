// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { appTheme } from '../../src/constants/theme';

// export default function Signup() {
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');
//   const router = useRouter();

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage('');

//     if (formData.password !== formData.confirmPassword) {
//       setMessage("❌ Passwords don't match");
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await fetch('/api/auth/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           fullName: formData.fullName,
//           email: formData.email,
//           phone: formData.phone,
//           password: formData.password
//         }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage('✅ Registration successful! Please check your email for verification.');
//         // Store token and redirect
//         localStorage.setItem('token', data.token);
//         localStorage.setItem('user', JSON.stringify(data.user));
//         setTimeout(() => router.push('/signup'), 2000);
//       } else {
//         setMessage(`❌ ${data.message}`);
//       }
//     } catch (error) {
//       setMessage('❌ Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputStyle = {
//     padding: '12px',
//     borderRadius: '8px',
//     border: '1px solid #ddd',
//     fontSize: '15px',
//     outline: 'none',
//     transition: '0.3s',
//     width: '100%',
//     boxSizing: 'border-box'
//   };

//   return (
//     <div
//       style={{
//         minHeight: '100vh',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: appTheme.colors.background,
//         fontFamily: appTheme.fonts.primary,
//       }}
//     >
//       <div
//         style={{
//           backgroundColor: appTheme.colors.surface,
//           boxShadow: appTheme.shadows.lg,
//           borderRadius: '16px',
//           padding: '40px',
//           width: '100%',
//           maxWidth: '420px',
//         }}
//       >
//         <h2
//           style={{
//             textAlign: 'center',
//             color: appTheme.colors.primary,
//             marginBottom: '20px',
//             fontSize: '24px',
//             fontWeight: '600'
//           }}
//         >
//           Create your account
//         </h2>

//         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
//           <input
//             name="fullName"
//             type="text"
//             required
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChange={handleChange}
//             style={inputStyle}
//           />
//           <input
//             name="email"
//             type="email"
//             required
//             placeholder="Email address"
//             value={formData.email}
//             onChange={handleChange}
//             style={inputStyle}
//           />
//           <input
//             name="phone"
//             type="tel"
//             required
//             placeholder="Phone Number"
//             value={formData.phone}
//             onChange={handleChange}
//             style={inputStyle}
//           />
//           <input
//             name="password"
//             type="password"
//             required
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             style={inputStyle}
//           />
//           <input
//             name="confirmPassword"
//             type="password"
//             required
//             placeholder="Confirm Password"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             style={inputStyle}
//           />

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               backgroundColor: appTheme.colors.primary,
//               color: '#fff',
//               padding: '12px',
//               border: 'none',
//               borderRadius: '10px',
//               cursor: 'pointer',
//               fontWeight: 600,
//               transition: '0.3s',
//               fontSize: '16px',
//               marginTop: '10px'
//             }}
//             onMouseOver={(e) => {
//               if (!loading) {
//                 e.target.style.backgroundColor = '#4338ca';
//               }
//             }}
//             onMouseOut={(e) => {
//               if (!loading) {
//                 e.target.style.backgroundColor = appTheme.colors.primary;
//               }
//             }}
//           >
//             {loading ? 'Creating Account...' : 'Sign up'}
//           </button>
//         </form>

//         {message && (
//           <p
//             style={{
//               marginTop: '15px',
//               textAlign: 'center',
//               color: message.includes('✅') 
//                 ? 'green' 
//                 : message.includes('❌') 
//                 ? 'red' 
//                 : 'orange',
//               fontSize: '14px',
//               padding: '10px',
//               borderRadius: '8px',
//               backgroundColor: message.includes('✅') 
//                 ? '#f0f9f0' 
//                 : message.includes('❌') 
//                 ? '#fef2f2' 
//                 : '#fff7ed'
//             }}
//           >
//             {message}
//           </p>
//         )}

//         <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
//           Already have an account?{' '}
//           <Link 
//             href="/login" 
//             style={{
//               color: appTheme.colors.primary,
//               cursor: 'pointer',
//               fontWeight: '600',
//               textDecoration: 'none'
//             }}
//           >
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }




'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { appTheme } from '../../src/constants/theme';

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
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (message.text) setMessage({ text: '', type: '' });
  };

  const validateForm = () => {
    if (formData.fullName.length < 3) {
      return "Full name must be at least 3 characters";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address";
    }
    
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      return "Phone number must be 10-15 digits";
    }
    
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({ text: `❌ ${validationError}`, type: 'error' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ 
          text: `✅ ${data.message}`, 
          type: 'success' 
        });
        
        if (data.token && data.user) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setTimeout(() => {
            if (data.user.role === 'admin') {
              router.push('/admin/dashboard');
            } else if (data.user.role === 'manager') {
              router.push('/manager/dashboard');
            } else {
              router.push('/dashboard');
            }
          }, 2000);
        }
      } else {
        setMessage({ 
          text: `❌ ${data.message || 'Registration failed. Please try again.'}`, 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ 
        text: '❌ Network error. Please check your connection and try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { 
      value: 'user', 
      label: 'Regular User',
      description: 'Basic access to platform features',
      color: '#3b82f6'
    },
    { 
      value: 'manager', 
      label: 'Manager',
      description: 'Can manage users and content',
      color: '#8b5cf6'
    },
    { 
      value: 'admin', 
      label: 'Administrator',
      description: 'Full system access and control',
      color: '#10b981'
    }
  ];

  // Main container styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px'
  };

  // Card wrapper
  const cardStyle = {
    width: '100%',
    maxWidth: '1000px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    display: 'flex',
    minHeight: '600px'
  };

  // Left panel (info)
  const leftPanelStyle = {
    flex: '0 0 40%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: 'white',
    padding: '50px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  // Right panel (form)
  const rightPanelStyle = {
    flex: '1',
    padding: '50px 40px',
    overflowY: 'auto'
  };

  // Input style
  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '15px',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box'
  };

  // Button style
  const buttonStyle = {
    width: '100%',
    padding: '16px',
    backgroundColor: appTheme.colors.primary || '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  };

  // Loading spinner
  const Spinner = () => (
    <div style={{
      width: '20px',
      height: '20px',
      border: '3px solid rgba(255,255,255,0.3)',
      borderTop: '3px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  );

  if (!mounted) {
    return (
      <div style={containerStyle}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .hover-lift:hover {
          transform: translateY(-2px);
        }
        
        .hover-lift:active {
          transform: translateY(0);
        }
        
        input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
      `}</style>

      <div style={cardStyle}>
        {/* Left Info Panel */}
        <div style={leftPanelStyle}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                S
              </div>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>SecurePortal</h2>
                <p style={{ opacity: 0.9, fontSize: '14px', margin: '4px 0 0 0' }}>Enterprise Platform</p>
              </div>
            </div>
            
            <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.3' }}>
              Join Thousands of Professionals
            </h3>
            
            <p style={{ fontSize: '16px', opacity: 0.9, lineHeight: '1.6', marginBottom: '40px' }}>
              Create your account and get access to powerful tools designed for your specific role.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {roleOptions.map((role) => (
                <div key={role.value} style={{
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: role.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {role.label.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 4px 0' }}>
                        {role.label}
                      </h4>
                      <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>
                        {role.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '25px' }}>
            <p style={{ fontSize: '15px', opacity: 0.9, margin: 0 }}>
              Already have an account?{' '}
              <Link 
                href="/login" 
                style={{
                  color: 'white',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div style={rightPanelStyle}>
          <div style={{ marginBottom: '35px' }}>
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0 0 8px 0' 
            }}>
              Create Account
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {/* Full Name */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '8px' 
              }}>
                Full Name *
              </label>
              <input
                name="fullName"
                type="text"
                required
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                style={inputStyle}
                minLength="3"
                maxLength="50"
              />
            </div>

            {/* Email and Phone - Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Phone Number *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                  pattern="[0-9]{10,15}"
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                  10-15 digits without spaces
                </p>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '12px' 
              }}>
                Select Account Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {roleOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => setFormData({ ...formData, role: option.value })}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${formData.role === option.value ? option.color : '#e5e7eb'}`,
                      backgroundColor: formData.role === option.value ? `${option.color}10` : '#f9fafb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                    className="hover-lift"
                    onMouseEnter={(e) => {
                      if (formData.role !== option.value) {
                        e.currentTarget.style.borderColor = '#d1d5db';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.role !== option.value) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      backgroundColor: formData.role === option.value ? option.color : '#e5e7eb',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: formData.role === option.value ? 'white' : '#6b7280',
                      fontSize: '20px',
                      fontWeight: 'bold'
                    }}>
                      {option.label.charAt(0)}
                    </div>
                    <h4 style={{ 
                      fontSize: '15px', 
                      fontWeight: '600', 
                      color: '#111827', 
                      margin: '0 0 4px 0' 
                    }}>
                      {option.label}
                    </h4>
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#6b7280', 
                      margin: '0',
                      lineHeight: '1.4'
                    }}>
                      {option.description}
                    </p>
                    {formData.role === option.value && (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: option.color,
                        margin: '15px auto 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <input type="hidden" name="role" value={formData.role} />
            </div>

            {/* Password Fields - Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ ...inputStyle, paddingRight: '45px' }}
                    minLength="6"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#6b7280',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '5px'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px' 
                }}>
                  Confirm Password *
                </label>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={inputStyle}
                  minLength="6"
                />
              </div>
            </div>

            {/* Message Display */}
            {message.text && (
              <div style={{
                padding: '16px',
                borderRadius: '10px',
                backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                animation: 'fadeIn 0.3s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    {message.type === 'success' ? '✓' : '✗'}
                  </div>
                  <span style={{
                    color: message.type === 'success' ? '#065f46' : '#991b1b',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {message.text}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                backgroundColor: loading ? '#9ca3af' : appTheme.colors.primary || '#4f46e5'
              }}
              className="hover-lift"
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = '#4338ca';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.backgroundColor = appTheme.colors.primary || '#4f46e5';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <>
                  <Spinner />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Terms & Privacy */}
            <p style={{ 
              textAlign: 'center', 
              fontSize: '13px', 
              color: '#6b7280',
              margin: '0'
            }}>
              By creating an account, you agree to our{' '}
              <a href="#" style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" style={{ color: '#4f46e5', fontWeight: '500', textDecoration: 'none' }}>
                Privacy Policy
              </a>
            </p>
          </form>

          {/* Security Notice */}
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1d4ed8',
                fontSize: '20px',
                flexShrink: 0
              }}>
                🔒
              </div>
              <div>
                <h4 style={{ 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  margin: '0 0 6px 0' 
                }}>
                  Secure Registration
                </h4>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#64748b', 
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Your information is encrypted and protected. Administrator accounts 
                  may require additional verification after registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}