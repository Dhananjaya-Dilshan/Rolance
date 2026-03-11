// app/profile/customer-details/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Lock, Save, Edit, X } from "lucide-react";
import AuthProtection from "@/components/AuthProtection";

const CustomerDetails = () => {
  // State for user data
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    country: "",
    password: "",
  });

  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for form data during editing
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    country: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Countries for dropdown
  const countries = [
    "United States", "United Kingdom", "Canada", 
    "Australia", "India", "Sri Lanka"
  ];

  // Load user data from localStorage on component mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserData({
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          country: parsedUser.country || "",
          password: "********", // Masked for security
        });

        setFormData({
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          country: parsedUser.country || "",
          password: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError(null);
    setSuccess(null);
    
    // Reset form data when canceling edit
    if (editMode) {
      setFormData({
        username: userData.username,
        email: userData.email,
        country: userData.country,
        password: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  
    // Validate passwords if changing password
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      setIsLoading(false);
      return;
    }
  
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token); // Debugging

      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }
  
      // Prepare data for API
      const updateData = {
        username: formData.username,
        country: formData.country,
        ...(formData.newPassword && { 
          currentPassword: formData.password,
          newPassword: formData.newPassword 
        }),
      };
  
      // Make API request to update user details
      const response = await fetch('/api/customer/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
  
      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to update profile');
      }
  
      // Update local state
      setUserData({
        ...userData,
        username: formData.username,
        country: formData.country,
        // Keep password masked
        password: "********",
      });
  
      // Update localStorage
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        const updatedUser = {
          ...parsedUser,
          username: formData.username,
          country: formData.country,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
  
      setSuccess("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthProtection requiredRole="customer">
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="bg-purple-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Customer Details</h1>
                <button
                  onClick={toggleEditMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                    editMode 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-white text-purple-600 hover:bg-gray-100"
                  } transition-colors duration-200`}
                >
                  {editMode ? (
                    <>
                      <X size={18} /> Cancel
                    </>
                  ) : (
                    <>
                      <Edit size={18} /> Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Success/Error Messages */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
                >
                  {error}
                </motion.div>
              )}
              
              {success && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded"
                >
                  {success}
                </motion.div>
              )}

              {editMode ? (
                /* Edit Form */
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Username */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Email - Readonly as it's often used as an identifier */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          readOnly
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                    </div>

                    {/* Country */}
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select a Country</option>
                          {countries.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="border-t pt-4 mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      
                      {/* Current Password */}
                      <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                      
                      {/* New Password */}
                      <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      {/* Confirm New Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-500">
                        Leave password fields empty if you don't want to change your password
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save size={18} /> Save Changes
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              ) : (
                /* View Mode */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <User className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Username</h3>
                          <p className="text-lg font-medium text-gray-900">{userData.username}</p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Mail className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="text-lg font-medium text-gray-900">{userData.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <MapPin className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Country</h3>
                          <p className="text-lg font-medium text-gray-900">{userData.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Lock className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Password</h3>
                          <p className="text-lg font-medium text-gray-900">{userData.password}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <a
              href="/profile"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors duration-200"
            >
              <span>← Back to Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </AuthProtection>
  );
};

export default CustomerDetails;