"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { buttonVariants } from "./ui/button";
import { ArrowRight, User, LogOut, ChevronDown ,Shirt, Smartphone, Coffee} from "lucide-react";
import MaxWidthWrapper from "./MaxWidthWrapper";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is logged in by looking for token in localStorage
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!token);
    setUserRole(role);
    if (token && user) {
      const userData = JSON.parse(user);
      setIsLoggedIn(true);
      setIsAdmin(userData.role === 'admin');
      setUserRole(userData.role);
    }

    
  }, []);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/"; // Redirect to home page
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowUploadOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky z-[100] h-20 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-20 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-bold">
            <img
              src="/logo.png"
              alt="logo"
              className="h-13 w-60 ring-2 ring-slate-100"
            />
          </Link>

          <div className="h-full flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handleLogout}
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                    className: "flex items-center gap-2",
                  })}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
                {isAdmin ? (
                  <Link
                    href="/AdminDashbord"
                    className={buttonVariants({
                      size: "sm",
                      variant: "ghost",
                      className: "flex items-center gap-2",
                    })}
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline">Admin Dashboard</span>
                  </Link>
                ) : (
                  <Link
                  href={userRole === "shop" ? "/dashboard" : "/profile"}
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                    className: "flex items-center gap-2",
                  })}
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">
                    {userRole === "shop" ? "Dashboard" : "Profile"}
                  </span>
                </Link>
              )}
                <Link
                  href="/products"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Products
                </Link>

                <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

                 {/* Print Design Button with Dropdown */}
                 <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={buttonVariants({
                size: 'sm',
                className: 'hidden sm:flex items-center gap-1',
              })}
            >
              Print design
              <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Main Dropdown */}
            {showDropdown && (
              <div className='absolute top-full mt-2 w-56 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden animate-fadeIn'>
                <Link href='/Design_Canvas'>
                  <div className='px-4 py-3 hover:bg-gray-100 cursor-pointer transition'>🎨 Create Design</div>
                </Link>

                {/* Upload Design - With Nested Options */}
                <div
                  onClick={() => setShowUploadOptions(!showUploadOptions)}
                  className='px-4 py-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer transition'
                >
                  📤 Upload Design
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${showUploadOptions ? 'rotate-180' : ''}`} />
                </div>

                {/* Upload Submenu */}
                {showUploadOptions && (
                  <div className='bg-gray-50 p-2 space-y-2'>
                    <Link href='/design/upload/tshirt'>
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition'>
                        <Shirt className='h-5 w-5 text-blue-500' /> T-Shirt
                      </div>
                    </Link>
                    <Link  href="/configure/Phone_Case/upload">
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition'>
                        <Smartphone className='h-5 w-5 text-green-500' /> Phone Case
                      </div>
                    </Link>
                    <Link href='/design/upload/mug'>
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition'>
                        <Coffee className='h-5 w-5 text-orange-500' /> Mug
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Sign up
                </Link>

                <Link
                  href="/login"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Login
                </Link>

                <Link
                  href="/products"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Products
                </Link>

                <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

                {/* Print Design Button with Dropdown */}
                <div className='relative' ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={buttonVariants({
                size: 'sm',
                className: 'hidden sm:flex items-center gap-1',
              })}
            >
              Print design
              <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Main Dropdown */}
            {showDropdown && (
              <div className='absolute top-full mt-2 w-56 bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden animate-fadeIn'>
                <Link href='/Design_Canvas'>
                  <div className='px-4 py-3 hover:bg-gray-100 cursor-pointer transition'>🎨 Create Design</div>
                </Link>

                {/* Upload Design - With Nested Options */}
                <div
                  onClick={() => setShowUploadOptions(!showUploadOptions)}
                  className='px-4 py-3 flex justify-between items-center hover:bg-gray-100 cursor-pointer transition'
                >
                  📤 Upload Design
                  <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${showUploadOptions ? 'rotate-180' : ''}`} />
                </div>

                {/* Upload Submenu */}
                {showUploadOptions && (
                  <div className='bg-gray-50 p-2 space-y-2'>
                    <Link href='/configure/T-Shirt/upload'>
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition'>
                        <Shirt className='h-5 w-5 text-blue-500' /> T-Shirt
                      </div>
                    </Link>
                    <Link  href="/configure/Phone_Case/upload">
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition'>
                        <Smartphone className='h-5 w-5 text-green-500' /> Phone Case
                      </div>
                    </Link>
                    <Link href='/design/upload/mug'>
                      <div className='flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-md transition'>
                        <Coffee className='h-5 w-5 text-orange-500' /> Mug
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
                </div>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
