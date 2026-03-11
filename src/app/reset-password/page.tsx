// app/reset-password/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'shop' | 'customer'>('customer');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    const userRole = searchParams.get('role') as 'shop' | 'customer';
    
    if (!resetToken || !userRole) {
      router.push('/login');
      return;
    }

    setToken(resetToken);
    setRole(userRole);
  }, [searchParams, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          newPassword: password,
          role
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to login with success message
        router.push(`/login?message=Password%20successfully%20reset`);
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center relative overflow-hidden">
      <motion.div
        className="relative z-10 bg-black bg-opacity-80 p-8 rounded-lg shadow-xl max-w-md w-full border border-purple-600"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <h2 className="text-3xl font-bold text-purple-400 text-center mb-6 neon">Reset Password</h2>

        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-800 border border-red-500 text-red-200 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-gray-400 font-medium mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-gray-400 font-medium mb-2">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Confirm new password"
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md transition
              ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'hover:bg-purple-700'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;