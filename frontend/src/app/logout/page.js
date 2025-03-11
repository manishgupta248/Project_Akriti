"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore'; // Adjusted path

export default function Logout() {
  const { logout, isLoading } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [error, setError] = useState(null);
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    if (!hasLoggedOut.current) {
      hasLoggedOut.current = true;
      logout(router)
        .then(() => {
          setIsLoggingOut(false);
          router.push('/login'); // Optional: redirect after success
        })
        .catch((error) => {
          console.error('Logout error:', error);
          setError('Logout failed. Please try again.');
          setIsLoggingOut(false);
          router.push('/login');
        });
    }
  }, [logout, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-lg text-center" aria-live="polite">
          {isLoggingOut || isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Logging out...
            </div>
          ) : (
            error || 'Logout complete, redirecting...'
          )}
        </div>
      </div>
    </div>
  );
}