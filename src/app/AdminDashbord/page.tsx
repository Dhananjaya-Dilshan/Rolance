"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Store, CreditCard, Menu } from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-2xl font-bold text-purple-600 mb-8">Admin Dashboard</h2>
        <nav className="space-y-4">
          <Link href="/dashboard/shop_management" className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition">
            <ShoppingCart className="h-5 w-5" /> shop management
          </Link>
          <Link href="/dashboard/users_management" className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition">
            <Store className="h-5 w-5" /> users management
          </Link>
          <Link href="/dashboard/manage_designs" className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition">
            <CreditCard className="h-5 w-5" /> manage designs
          </Link>
          <Link href="/dashboard/admin_payments" className="flex items-center gap-3 text-gray-700 hover:text-purple-600 transition">
            <CreditCard className="h-5 w-5" /> payment
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to Your Dashboard</h1>
          <button className="md:hidden text-gray-700">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { title: "shop management", link: "/dashboard/shop_management", icon: <ShoppingCart />, image: "/store-2017.png" },
            { title: "users management", link: "/dashboard/users_management", icon: <Store />, image: "/customer-experience-or-blue-team-21015.png" },
            { title: "manage designs", link: "/dashboard/manage_designs", icon: <Store />, image: "/manage-1193.png" },
            { title: "Payments", link: "/dashboard/admin_payments", icon: <CreditCard />, image: "/cash-payment-6401.png" },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Link href={item.link} className="block">
                <div className="relative h-48">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-contain p-2" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center text-white text-xl font-semibold p-4">
                    {item.title}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
