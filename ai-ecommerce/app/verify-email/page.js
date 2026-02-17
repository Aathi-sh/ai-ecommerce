'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [canResend, setCanResend] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    console.log('🔑 Token from URL:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token || token.trim().length === 0) {
      setStatus('error');
      setMessage('Invalid verification link. No token found.');
      return;
    }
    
    verifyEmail(token.trim());
  }, [token]);

  const verifyEmail = async (token) => {
    try {
      console.log('📤 Calling API with token:', token.substring(0, 20) + '...');
      
      // FIXED: Using the correct endpoint with hyphen
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      console.log('📥 Response:', { status: res.status, data });

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          window.location.href = '/login?verified=true';
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Verification failed');
        setErrorCode(data.code || 'UNKNOWN_ERROR');
        setCanResend(data.canResend || false);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleResendEmail = async () => {
    try {
      // Get email from localStorage or prompt user
      const email = localStorage.getItem('pendingVerificationEmail');
      
      if (!email) {
        setMessage('Please sign up again to get a new verification email.');
        return;
      }
      
      const res = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessage('New verification email sent! Please check your inbox.');
      } else {
        setMessage(data.message || 'Failed to resend email.');
      }
    } catch (error) {
      setMessage('Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Email Verification
            </h2>
            <p className="text-gray-600 mb-6">
              {status === 'verifying' ? 'Verifying your email address...' : ''}
            </p>
            
            {/* Verifying State */}
            {status === 'verifying' && (
              <div className="py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Please wait while we verify your email...</p>
                <p className="mt-2 text-sm text-gray-500">
                  Token: {token ? `${token.substring(0, 20)}...` : 'No token'}
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="block w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    Go to Login
                  </Link>
                  <p className="text-sm text-gray-500">
                    Redirecting automatically in 3 seconds...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="py-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h3>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <p className="text-red-700">{message}</p>
                  {errorCode && (
                    <p className="text-sm text-red-600 mt-1">Error code: {errorCode}</p>
                  )}
                </div>
                <div className="space-y-3">
                  {canResend && (
                    <button
                      onClick={handleResendEmail}
                      className="w-full bg-amber-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-amber-700 transition duration-200"
                    >
                      Resend Verification Email
                    </button>
                  )}
                  <Link
                    href="/signup"
                    className="block w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 text-center"
                  >
                    Sign Up Again
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200 text-center"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-gray-700 mb-2">Debug Info:</p>
            <p className="text-gray-600">Status: {status}</p>
            <p className="text-gray-600">Token present: {token ? 'Yes' : 'No'}</p>
            <p className="text-gray-600">Token length: {token?.length || 0}</p>
            <p className="text-gray-600 break-all">Token: {token || 'None'}</p>
          </div>
        )}
      </div>
    </div>
  );
}