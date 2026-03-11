// app/profile/shop-details/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Lock, Save, Edit, X, Store, Phone, Home, Image as ImageIcon, Loader2 } from "lucide-react"; // Add Loader2 here
import AuthProtection from "@/components/AuthProtection";
import { useUploadThing } from '@/lib/uploadthing';
import { useToast } from "@/hooks/use-toast";
import { Progress } from '@/components/ui/progress';
import Dropzone, { FileRejection } from 'react-dropzone';

const ShopDetails = () => {
  const { toast } = useToast();
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { startUpload } = useUploadThing('imageUploader');

  // State for shop data
  const [shopData, setShopData] = useState({
    username: "",
    email: "",
    country: "",
    password: "",
    ShopName: "",
    ShopAddress: "",
    ContactNumber: "",
    image: "/default-image.jpeg"
  });

  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  
  // State for form data during editing
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    country: "",
    ShopName: "",
    ShopAddress: "",
    ContactNumber: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
    image: ""
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

  // Load shop data from localStorage on component mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setShopData({
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          country: parsedUser.country || "",
          password: "********", // Masked for security
          ShopName: parsedUser.ShopName || "",
          ShopAddress: parsedUser.ShopAddress || "",
          ContactNumber: parsedUser.ContactNumber || "",
          image: parsedUser.image || "/default-image.jpeg"
        });

        setFormData({
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          country: parsedUser.country || "",
          ShopName: parsedUser.ShopName || "",
          ShopAddress: parsedUser.ShopAddress || "",
          ContactNumber: parsedUser.ContactNumber || "",
          password: "",
          newPassword: "",
          confirmPassword: "",
          image: parsedUser.image || "/default-image.jpeg"
        });
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
        username: shopData.username,
        email: shopData.email,
        country: shopData.country,
        ShopName: shopData.ShopName,
        ShopAddress: shopData.ShopAddress,
        ContactNumber: shopData.ContactNumber,
        password: "",
        newPassword: "",
        confirmPassword: "",
        image: shopData.image
      });
    }
  };

  // Handle image upload
  const onDropAccepted = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      
  
      const res = await startUpload(acceptedFiles, { configId: undefined });
     
  
      if (res && res[0].url) {
        setFormData({ ...formData, image: res[0].url });
        setShopData({ ...shopData, image: res[0].url });
        toast({
          title: "Image uploaded successfully",
          description: "Your shop image has been updated.",
        });
      }
    } catch (error) {
      console.error("Upload error:", error); // Log any errors
      toast({
        title: "Image upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
      if (!token) {
        setError("Authentication required");
        setIsLoading(false);
        return;
      }
  
      // Prepare data for API
      const updateData = {
        username: formData.username,
        country: formData.country,
        ShopName: formData.ShopName,
        ShopAddress: formData.ShopAddress,
        ContactNumber: formData.ContactNumber,
        image: formData.image,
        ...(formData.newPassword && { 
          currentPassword: formData.password,
          newPassword: formData.newPassword 
        }),
      };
  
      // Make API request to update shop details
      const response = await fetch('/api/shop/update', {
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
      setShopData({
        ...shopData,
        username: formData.username,
        country: formData.country,
        ShopName: formData.ShopName,
        ShopAddress: formData.ShopAddress,
        ContactNumber: formData.ContactNumber,
        image: formData.image,
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
          ShopName: formData.ShopName,
          ShopAddress: formData.ShopAddress,
          ContactNumber: formData.ContactNumber,
          image: formData.image,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
  
      setSuccess("Shop profile updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating shop profile:", error);
      setError(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthProtection requiredRole="shop">
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
                <h1 className="text-2xl font-bold text-white">Shop Details</h1>
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
                    {/* Image Upload */}
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Image
                      </label>
                      <Dropzone
                        onDropAccepted={onDropAccepted}
                        accept={{
                          'image/png': ['.png'],
                          'image/jpeg': ['.jpeg'],
                          'image/jpg': ['.jpg'],
                        }}
                        onDragEnter={() => setIsDragOver(true)}
                        onDragLeave={() => setIsDragOver(false)}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <div
                            {...getRootProps()}
                            className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-purple-500"
                          >
                            <input {...getInputProps()} />
                            {isUploading ? (
                              <div className="flex flex-col items-center">
                                <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" /> {/* Add Loader2 here */}
                                <p>Uploading...</p>
                                <Progress
                                  value={uploadProgress}
                                  className="mt-2 w-40 h-2 bg-gray-300"
                                />
                              </div>
                            ) : (
                              <>
                                <ImageIcon className="h-6 w-6 text-zinc-500 mb-2" />
                                <p className="text-sm text-zinc-700">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-zinc-500">PNG, JPG, JPEG</p>
                              </>
                            )}
                          </div>
                        )}
                      </Dropzone>
                    </div>

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

                    {/* Shop Name */}
                    <div>
                      <label htmlFor="ShopName" className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Store className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="ShopName"
                          name="ShopName"
                          value={formData.ShopName}
                          onChange={handleChange}
                          required
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label htmlFor="ContactNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="ContactNumber"
                          name="ContactNumber"
                          value={formData.ContactNumber}
                          onChange={handleChange}
                          required
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Shop Address */}
                    <div>
                      <label htmlFor="ShopAddress" className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Home className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          id="ShopAddress"
                          name="ShopAddress"
                          value={formData.ShopAddress}
                          onChange={handleChange}
                          required
                          rows={3}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
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
                    {/* Shop Image */}
                    <div className="md:col-span-2 flex justify-center mb-4">
                      <div className="relative rounded-full overflow-hidden h-32 w-32 border-4 border-purple-200">
                        <img 
                          src={shopData.image} 
                          alt="Shop Logo" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Username */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <User className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Username</h3>
                          <p className="text-lg font-medium text-gray-900">{shopData.username}</p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Mail className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Email</h3>
                          <p className="text-lg font-medium text-gray-900">{shopData.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shop Name */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Store className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Shop Name</h3>
                          <p className="text-lg font-medium text-gray-900">{shopData.ShopName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Number */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Phone className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                          <p className="text-lg font-medium text-gray-900">{shopData.ContactNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shop Address */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Home className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Shop Address</h3>
                          <p className="text-lg font-medium text-gray-900">{shopData.ShopAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <MapPin className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Country</h3>
                          <p className="text-lg font-medium text-gray-900">{shopData.country}</p>
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Lock className="h-6 w-6 text-purple-600 mt-1 mr-3" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Password</h3>
                          <p className="text-lg font-medium text-gray-900">{shopData.password}</p>
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

export default ShopDetails;