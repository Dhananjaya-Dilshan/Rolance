// components/ForgotPasswordModal.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'shop' | 'customer'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
        // Optional: auto-close modal after success
        setTimeout(onClose, 3000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-purple-600"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <h2 className="text-2xl font-bold text-purple-400 mb-4">Forgot Password</h2>
        
        {message && (
          <div 
            className={`mb-4 p-3 rounded ${
              message.type === 'success' 
                ? 'bg-green-800 border border-green-500 text-green-200' 
                : 'bg-red-800 border border-red-500 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-gray-400 font-medium mb-2">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="reset-role" className="block text-gray-400 font-medium mb-2">
              Account Type
            </label>
            <select
              id="reset-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'shop' | 'customer')}
              required
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="customer">Customer</option>
              <option value="shop">Shop Owner</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <motion.button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md transition
                ${isLoading ? 'bg-purple-400 cursor-not-allowed' : 'hover:bg-purple-700'}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-md shadow-md hover:bg-gray-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordModal;