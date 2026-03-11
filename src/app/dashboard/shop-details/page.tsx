"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const ShopDetails: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shopData, setShopData] = useState({
    username: "",
    email: "",
    password: "",
    country: "",
    shopName: "",
    contactNumber: "",
  });

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        // Get user email from localStorage
        const user = localStorage.getItem("user");
        if (!user) {
          router.push("/login");
          return;
        }

        const { email } = JSON.parse(user);
        const response = await fetch(`/api/shop?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch shop details');
        }

        const data = await response.json();
        setShopData({
          username: data.username,
          email: data.email,
          password: "", // Don't set the password
          country: data.country,
          shopName: data.ShopName,
          contactNumber: data.ContactNumber,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shop details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopDetails();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShopData({ ...shopData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/shop', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...shopData,
          // Only include password if it was changed
          password: shopData.password || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update shop details');
      }

      // Show success message
      alert('Shop details updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shop details');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8">
        <motion.h2
          className="text-3xl font-bold text-center text-purple-600 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Shop Details
        </motion.h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-gray-700 font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={shopData.username}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={shopData.email}
                className="w-full p-3 border rounded-lg shadow-sm bg-gray-100"
                disabled
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium">New Password (Optional)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={shopData.password}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 pr-10"
                  placeholder="Leave blank to keep current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-gray-700 font-medium">Country</label>
              <select
                name="country"
                value={shopData.country}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Country</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="India">India</option>
                <option value="Sri Lanka">Sri Lanka</option>
              </select>
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-gray-700 font-medium">Shop Name</label>
              <input
                type="text"
                name="shopName"
                value={shopData.shopName}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-gray-700 font-medium">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={shopData.contactNumber}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`w-full ${
              isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
            } text-white py-3 rounded-lg font-medium shadow-md transition`}
            whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ShopDetails;