"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
      shopName: formData.get("shopName") || undefined,
      country: formData.get("country"),
      contactNumber: formData.get("contactnumber") || undefined,
      shopAddress: formData.get("shopaddress") || undefined,
    };

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        throw new Error("Server response was not JSON");
      }

      if (response.ok) {
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
          if (result.token) {
            localStorage.setItem("token", result.token);
          }
          router.push("/login");
        } else {
          throw new Error("User data missing from response");
        }
      } else {
        setError(result.message || "Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-10 min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center relative overflow-hidden">
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
        <h2 className="text-3xl font-bold text-purple-400 text-center mb-6 neon">
          Sign Up
        </h2>
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
          {/* Full Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-gray-400 font-medium mb-2"
            >
              User Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-gray-400 font-medium mb-2"
            >
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
            <label
              htmlFor="password"
              className="block text-gray-400 font-medium mb-2"
            >
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

          {/* Country Dropdown */}
          <div>
            <label
              htmlFor="country"
              className="block text-gray-400 font-medium mb-2"
            >
              Country
            </label>
            <select
              id="country"
              name="country"
              required
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Select a Country</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="India">India</option>
              <option value="Sri lanka">Sri lanka</option>
            </select>
          </div>

          {/* Sign Up Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-gray-400 font-medium mb-2"
            >
              Account type
            </label>
            <select
              id="role"
              name="role"
              required
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              onChange={(e) => {
                const shopNameSection =
                  document.getElementById("shopNameSection");
                const shopcontactnumber =
                  document.getElementById("shopcontactnumber");
                const shopaddressSection =
                  document.getElementById("shopaddressSection");
                if (e.target.value === "shop") {
                  shopNameSection?.classList.remove("hidden");
                  shopcontactnumber?.classList.remove("hidden");
                  shopaddressSection?.classList.remove("hidden");
                } else {
                  shopNameSection?.classList.add("hidden");
                  shopcontactnumber?.classList.add("hidden");
                  shopaddressSection?.classList.add("hidden");
                }
              }}
            >
              <option value="customer">Customer</option>
              <option value="shop">Shop Owner</option>
            </select>
          </div>

          {/* Shop Name (Conditional) */}
          <div id="shopNameSection" className="hidden">
            <label
              htmlFor="shopName"
              className="block text-gray-400 font-medium mb-2"
            >
              Shop name
            </label>
            <input
              id="shopName"
              name="shopName"
              type="text"
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          {/* Shop 	contact number(Conditional) */}
          <div id="shopcontactnumber" className="hidden">
            <label
              htmlFor="contactnumber"
              className="block text-gray-400 font-medium mb-2"
            >
              Contact number
            </label>
            <input
              id="contactnumber"
              name="contactnumber"
              type="text"
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          {/* Shop address (Conditional) */}
          <div id="shopaddressSection" className="hidden">
            <label
              htmlFor="shopaddress"
              className="block text-gray-400 font-medium mb-2"
            >
              Shop address
            </label>
            <input
              id="shopaddress"
              name="shopaddress"
              type="text"
              className="w-full px-4 py-2 border border-purple-500 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md transition
              ${
                isLoading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "hover:bg-purple-700"
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? "Signg in..." : "Sing up"}
          </motion.button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Log In
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
