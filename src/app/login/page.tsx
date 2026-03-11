'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role')
    };

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('token', result.token);
        localStorage.setItem('role', data.role as string);

        if (data.role === 'customer') {
          router.push('/products');
        } else {
          router.push('/dashbord');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center relative overflow-hidden">
      {/* Animated Neon Background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute -top-10 left-10 w-[300px] h-[300px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-30 rounded-full animate-pulse blur-3xl"></div>
        <div className="absolute -bottom-20 right-20 w-[400px] h-[400px] bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 opacity-30 rounded-full animate-pulse blur-3xl"></div>
      </motion.div>

      <motion.div
        className="relative z-10 bg-black bg-opacity-80 p-8 rounded-lg shadow-xl max-w-md w-full border border-purple-600"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <h2 className="text-3xl font-bold text-purple-400 text-center mb-6 neon">Login</h2>

        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-800 border border-red-500 text-red-200 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-400 font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-gray-400 font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-gray-400 font-medium mb-2">
              Login as
            </label>
            <select
              id="role"
              name="role"
              required
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="customer">Customer</option>
              <option value="shop">Shop Owner</option>
            </select>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md transition
              ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'hover:bg-purple-700'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <div className="mt-4 text-center text-gray-400">
          <p>
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-purple-400 hover:underline">
              Sign Up
            </a>
          </p>
          <p className="mt-2">
          <button 
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-purple-400 hover:underline"
            >
              Forgot Password?
            </button>
          </p>
        </div>
      </motion.div>

      {/* Side Image */}
      <motion.div
        className="hidden lg:block absolute top-0 right-0 h-full w-1/2 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: 'url(/login-side.jpg)' }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      ><ForgotPasswordModal 
      isOpen={isForgotPasswordOpen}
      onClose={() => setIsForgotPasswordOpen(false)}
    /></motion.div>
    </div>
    
  );
};

export default LoginPage;