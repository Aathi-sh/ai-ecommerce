'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { appTheme } from '../../../src/constants/theme';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  // Define error messages
  const errorMessages = {
    AccountInactive: {
      title: 'Account Inactive',
      description: 'Your account is not currently active. This could be due to:',
      reasons: [
        'Account pending email verification',
        'Account suspended by administrator',
        'Account manually deactivated'
      ],
      action: 'Contact support',
      actionLink: '/contact',
      secondaryAction: 'Request account review',
    },
    VerificationRequired: {
      title: 'Email Verification Required',
      description: 'Please verify your email address before accessing your account.',
      reasons: [
        'Check your email inbox for verification link',
        'Check spam folder if not found',
        'Link expires in 24 hours'
      ],
      action: 'Resend verification email',
      actionLink: '/api/auth/resend-verification',
      secondaryAction: 'Contact support',
    },
    InvalidToken: {
      title: 'Invalid Session',
      description: 'Your session token is invalid or has expired.',
      reasons: [
        'Session may have timed out',
        'You may have logged in from another device',
        'Cookies might be cleared'
      ],
      action: 'Login again',
      actionLink: '/login',
      secondaryAction: 'Clear browser cache',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to access this resource.',
      reasons: [
        'Insufficient user permissions',
        'Trying to access admin-only area',
        'Account role restrictions'
      ],
      action: 'Go to Dashboard',
      actionLink: '/dashboard',
      secondaryAction: 'Request permissions',
    },
    default: {
      title: 'Authentication Error',
      description: 'An unexpected error occurred during authentication.',
      reasons: [
        'Try refreshing the page',
        'Clear browser cookies and cache',
        'Check your internet connection'
      ],
      action: 'Go to Login',
      actionLink: '/login',
      secondaryAction: 'Contact support',
    }
  };

  const errorData = errorMessages[error] || errorMessages.default;
  const displayMessage = message || `Error: ${error}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: appTheme.colors.background,
        fontFamily: appTheme.fonts.primary,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: appTheme.colors.surface,
          padding: '40px',
          borderRadius: '20px',
          boxShadow: appTheme.shadows.lg,
          textAlign: 'center',
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#fee2e2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '2px solid #fecaca',
          }}
        >
          <span style={{ fontSize: '36px', color: '#dc2626' }}>⚠️</span>
        </div>

        {/* Error Title */}
        <h1
          style={{
            color: appTheme.colors.textPrimary,
            fontSize: '28px',
            marginBottom: '12px',
            fontWeight: '700',
          }}
        >
          {errorData.title}
        </h1>

        {/* Error Description */}
        <p
          style={{
            color: appTheme.colors.textSecondary,
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}
        >
          {errorData.description}
        </p>

        {/* Error Details */}
        {displayMessage && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#fef2f2',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #fecaca',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                color: '#dc2626',
                fontSize: '14px',
                margin: 0,
                fontWeight: '500',
              }}
            >
              {displayMessage}
            </p>
          </div>
        )}

        {/* Reasons List */}
        <div
          style={{
            textAlign: 'left',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3
            style={{
              color: appTheme.colors.textPrimary,
              fontSize: '16px',
              marginBottom: '12px',
              fontWeight: '600',
            }}
          >
            Possible reasons:
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {errorData.reasons.map((reason, index) => (
              <li
                key={index}
                style={{
                  color: appTheme.colors.textSecondary,
                  fontSize: '14px',
                  lineHeight: '1.8',
                  marginBottom: '6px',
                }}
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '30px',
          }}
        >
          <Link
            href={errorData.actionLink}
            style={{
              backgroundColor: appTheme.colors.primary,
              color: '#fff',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600',
              padding: '14px',
              borderRadius: '12px',
              display: 'block',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {errorData.action}
          </Link>

          <Link
            href="/login"
            style={{
              color: appTheme.colors.primary,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px',
              borderRadius: '8px',
              display: 'block',
              textAlign: 'center',
              border: `1.5px solid ${appTheme.colors.primary}30`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = appTheme.colors.primary + '10';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Back to Login
          </Link>
        </div>

        {/* Contact Support */}
        <div
          style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: `1px solid ${appTheme.colors.border}`,
          }}
        >
          <p
            style={{
              color: appTheme.colors.textTertiary,
              fontSize: '12px',
              lineHeight: '1.5',
              marginBottom: '8px',
            }}
          >
            Need help? Our support team is available 24/7
          </p>
          <Link
            href="/contact"
            style={{
              color: appTheme.colors.primary,
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '6px',
              backgroundColor: appTheme.colors.primary + '10',
              transition: 'all 0.2s ease',
            }}
          >
            Contact Support →
          </Link>
        </div>

        {/* Footer */}
        <p
          style={{
            marginTop: '30px',
            color: appTheme.colors.textTertiary,
            fontSize: '12px',
            paddingTop: '20px',
            borderTop: `1px solid ${appTheme.colors.border}`,
          }}
        >
          // In app/auth/error/page.js, add this button:
<button
  onClick={async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }}
  style={{
    padding: '10px 20px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: '10px',
  }}
>
  Logout & Go to Login
</button>
          © {new Date().getFullYear()} Steponext. Security error handling system.
        </p>
      </div>
    </div>
  );
}