"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/authContext';

export default function LogoutButton({ onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { logout: authLogout } = useAuth(); // If you have logout in context

  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Option 1: If you have auth context logout
      if (authLogout) {
        await authLogout();
      }
      
      // Option 2: Call logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }
      
      // Clear client-side storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      sessionStorage.clear();
      
      // Call onLogout callback if provided
      if (onLogout) {
        onLogout();
      }
      
      // Redirect to login page
      router.push('/login');
      router.refresh(); // Refresh to clear any cached data
      
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      
      // Force redirect anyway
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error} - Redirecting to login...
        </div>
      )}
    </>
  );
}