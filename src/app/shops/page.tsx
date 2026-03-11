// app/shops/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AuthProtection from "@/components/AuthProtection";
import { Star } from 'lucide-react';

// Type definitions
type Shop = {
  id: string;
  ShopName: string;
  country: string;
  image: string;
  rating?: number; // Optional rating
};

type User = {
  country: string;
};

// Star Rating Component
const StarRating = ({ rating, onRatingChange }: { rating: number | undefined, onRatingChange?: (rating: number) => void }) => {
  const stars = Array(5).fill(0);
  const effectiveRating = rating ?? 0;

  return (
    <div className="flex">
      {stars.map((_, index) => {
        const ratingValue = index + 1;
        return (
          <Star
            key={index}
            size={20}
            className={`cursor-pointer ${ratingValue <= effectiveRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
            onClick={() => onRatingChange && onRatingChange(ratingValue)}
          />
        );
      })}
      <span className="ml-2 text-sm text-gray-600">({effectiveRating.toFixed(1)})</span>
    </div>
  );
};

// Shop Card Component
const ShopCard = ({ shop, onRatingUpdate }: { shop: Shop, onRatingUpdate: (shopId: string, newRating: number) => void }) => {
  const [isRating, setIsRating] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);

  const handleRatingChange = async (newRating: number) => {
    try {
      setIsRating(true);
      setRatingError(null);
      await onRatingUpdate(shop.id, newRating);
    } catch (err) {
      setRatingError(err instanceof Error ? err.message : 'Failed to update rating');
    } finally {
      setIsRating(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      // Get configuration ID from URL
      const urlParams = new URLSearchParams(window.location.search);
      const configurationId = urlParams.get('configurationId');
  
      if (!configurationId) {
        throw new Error('Missing configuration ID');
      }
  
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          shopId: shop.id,
          configurationId: configurationId
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }
      
      alert('Order placed successfully!');
      // Optionally redirect to orders page
      window.location.href = 'profile/coustomer_orders';
    } catch (err) {
      console.error('Order placement failed:', err);
      alert(err instanceof Error ? err.message : 'Failed to place order');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <a href={`/shops/${shop.id}`} className="block">
        <div className="grid place-items-center">
          <img
            src={shop.image || '/placeholder.jpg'}
            alt={shop.ShopName}
            className="w-48 h-48 object-cover"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{shop.ShopName}</h2>
          <p className="text-gray-600">{shop.country}</p>
        </div>
      </a>
      <div className="px-4 pb-4">
        <div className="flex items-center relative">
          <StarRating rating={shop.rating} onRatingChange={handleRatingChange} />
          {isRating && <span className="ml-2 text-xs text-gray-500">Updating...</span>}
        </div>
        {ratingError && <p className="text-red-500 text-xs mt-1">{ratingError}</p>}
        <motion.button
          className="w-full mt-4 bg-violet-500 text-white py-2 rounded-lg hover:bg-violet-600 transition duration-300 transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePlaceOrder}
        >
          Place Order
        </motion.button>
      </div>
    </motion.div>
  );
};


// Filter Component
const ShopFilters = ({ 
  minRating, 
  setMinRating 
}: { 
  minRating: number, 
  setMinRating: (rating: number) => void 
}) => {
  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Filter Shops</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Rating: {minRating} stars
        </label>
        <input 
          type="range" 
          min="0" 
          max="5" 
          step="0.5" 
          value={minRating} 
          onChange={(e) => setMinRating(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    </div>
  );
};

// Main Page Component
const ShopsPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);
        setUser(userData);
      }
    } catch (err) {
      console.error('Error retrieving user data:', err);
    }
  }, []);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/shops', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch shops');
        
        const data = await response.json();
        setShops(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    if (shops.length && user) {
      const filtered = shops.filter(shop => 
        shop.country === user.country && (shop.rating ?? 0) >= minRating
      );
      setFilteredShops(filtered);
    }
  }, [shops, user, minRating]);

  const handleRatingUpdate = async (shopId: string, newRating: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch('/api/shops/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shopId, rating: newRating }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to update rating.');
      }
  
      const data = await response.json();
      
      // Update both the shops and filteredShops arrays
      setShops((prevShops) =>
        prevShops.map((shop) =>
          shop.id === shopId ? { ...shop, rating: data.averageRating } : shop
        )
      );
      
      setFilteredShops((prevShops) =>
        prevShops.map((shop) =>
          shop.id === shopId ? { ...shop, rating: data.averageRating } : shop
        )
      );
      
      return data; // Return the data for the component to use
    } catch (err) {
      console.error('Error updating rating:', err);
      throw err; // Re-throw to let the component handle the error
    }
  };
  
  if (loading) {
    return (
      <AuthProtection requiredRole="customer">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AuthProtection>
    );
  }

  if (error) {
    return (
      <AuthProtection requiredRole="customer">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-500 bg-red-100 p-4 rounded-lg">Error: {error}</div>
        </div>
      </AuthProtection>
    );
  }

  return (
    <AuthProtection requiredRole="customer">
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-4xl font-bold text-gray-800 text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Shops in {user?.country || 'Your Country'}
        </motion.h1>
        
        <ShopFilters 
          minRating={minRating} 
          setMinRating={setMinRating} 
        />
        
        {filteredShops.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600">No shops found in your country matching your filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredShops.map((shop) => (
              <ShopCard 
                key={shop.id} 
                shop={shop} 
                onRatingUpdate={handleRatingUpdate} 
              />
            ))}
          </div>
        )}
      </div>
    </AuthProtection>
  );
};

export default ShopsPage;