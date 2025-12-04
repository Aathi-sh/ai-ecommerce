'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { appTheme } from '../../src/constants/theme';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage("❌ Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Registration successful! Please check your email for verification.');
        // Store token and redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => router.push('/signup'), 2000);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
    transition: '0.3s',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: appTheme.colors.background,
        fontFamily: appTheme.fonts.primary,
      }}
    >
      <div
        style={{
          backgroundColor: appTheme.colors.surface,
          boxShadow: appTheme.shadows.lg,
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            color: appTheme.colors.primary,
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: '600'
          }}
        >
          Create your account
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            name="fullName"
            type="text"
            required
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="phone"
            type="tel"
            required
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
          />
          <input
            name="confirmPassword"
            type="password"
            required
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: appTheme.colors.primary,
              color: '#fff',
              padding: '12px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: '0.3s',
              fontSize: '16px',
              marginTop: '10px'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#4338ca';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = appTheme.colors.primary;
              }
            }}
          >
            {loading ? 'Creating Account...' : 'Sign up'}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: '15px',
              textAlign: 'center',
              color: message.includes('✅') 
                ? 'green' 
                : message.includes('❌') 
                ? 'red' 
                : 'orange',
              fontSize: '14px',
              padding: '10px',
              borderRadius: '8px',
              backgroundColor: message.includes('✅') 
                ? '#f0f9f0' 
                : message.includes('❌') 
                ? '#fef2f2' 
                : '#fff7ed'
            }}
          >
            {message}
          </p>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Already have an account?{' '}
          <Link 
            href="/login" 
            style={{
              color: appTheme.colors.primary,
              cursor: 'pointer',
              fontWeight: '600',
              textDecoration: 'none'
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}








// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { appTheme } from "../../src/constants/theme";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     const { fullName, email, password, confirmPassword } = formData;

//     if (!fullName || !email || !password || !confirmPassword) {
//       return setMessage("⚠️ Please fill in all fields.");
//     }

//     if (password !== confirmPassword) {
//       return setMessage("❌ Passwords do not match.");
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("/api/users", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fullName, email, password }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         setMessage("✅ Registration successful! Redirecting to login...");
//         setTimeout(() => router.push("/login"), 2000);
//       } else {
//         setMessage(`❌ ${data.message}`);
//       }
//     } catch (error) {
//       console.error("Registration error:", error);
//       setMessage("❌ Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: appTheme.colors.background,
//         fontFamily: appTheme.fonts.primary,
//       }}
//     >
//       <div
//         style={{
//           backgroundColor: appTheme.colors.surface,
//           boxShadow: appTheme.shadows.lg,
//           borderRadius: "16px",
//           padding: "40px",
//           width: "100%",
//           maxWidth: "420px",
//         }}
//       >
//         <h2
//           style={{
//             textAlign: "center",
//             color: appTheme.colors.primary,
//             marginBottom: "20px",
//           }}
//         >
//           Create Account
//         </h2>

//         <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
//           <input
//             type="text"
//             name="fullName"
//             placeholder="Full Name"
//             value={formData.fullName}
//             onChange={handleChange}
//             style={inputStyle}
//           />
//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             value={formData.email}
//             onChange={handleChange}
//             style={inputStyle}
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             style={inputStyle}
//           />
//           <input
//             type="password"
//             name="confirmPassword"
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
//               color: "#fff",
//               padding: "12px",
//               border: "none",
//               borderRadius: "10px",
//               cursor: "pointer",
//               fontWeight: 600,
//               transition: "0.3s",
//             }}
//           >
//             {loading ? "Creating Account..." : "Register"}
//           </button>
//         </form>

//         {message && (
//           <p
//             style={{
//               marginTop: "15px",
//               textAlign: "center",
//               color: message.includes("✅")
//                 ? "green"
//                 : message.includes("⚠️")
//                 ? "orange"
//                 : "red",
//             }}
//           >
//             {message}
//           </p>
//         )}

//         <p style={{ textAlign: "center", marginTop: "20px" }}>
//           Already have an account?{" "}
//           <span
//             style={{
//               color: appTheme.colors.primary,
//               cursor: "pointer",
//               fontWeight: "600",
//             }}
//             onClick={() => router.push("/login")}
//           >
//             Login here
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }

// const inputStyle = {
//   padding: "12px",
//   borderRadius: "8px",
//   border: "1px solid #ddd",
//   fontSize: "15px",
//   outline: "none",
//   transition: "0.3s",
// };