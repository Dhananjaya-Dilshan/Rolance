// app/shops/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import AuthProtection from '@/components/AuthProtection';
import { Star } from 'lucide-react';

type Shop = {
  id: string;
  ShopName: string;
  email: string;
  ContactNumber: string;
  ShopAddress: string;
  image: string;
  country: string;
  rating?: number;
};

const StarRating = ({ rating }: { rating: number | undefined }) => {
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
            className={`${ratingValue <= effectiveRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        );
      })}
      <span className="ml-2 text-sm text-gray-600">({effectiveRating.toFixed(1)})</span>
    </div>
  );
};

const ShopDetailsPage = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const shopId = params?.id as string;

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/shops/${shopId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const text = await response.text(); // Get raw response body
          console.error(`Fetch failed with status ${response.status}: ${text}`);
          throw new Error(`Failed to fetch shop details: ${response.status} - ${text}`);
        }

        const data = await response.json();
        setShop(data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setLoading(false);
      }
    };

    if (shopId) {
      fetchShopDetails();
    }
  }, [shopId]);

  if (loading) {
    return (
      <AuthProtection requiredRole="customer">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </AuthProtection>
    );
  }

  if (error || !shop) {
    return (
      <AuthProtection requiredRole="customer">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-500 bg-red-100 p-4 rounded-lg">
            {error || 'Shop not found'}
          </div>
        </div>
      </AuthProtection>
    );
  }

  return (
    <AuthProtection requiredRole="customer">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
        >
          <div className="flex flex-col items-center">
            <img
              src={shop.image || '/default-image.jpeg'}
              alt={shop.ShopName}
              className="w-64 h-64 object-cover rounded-lg mb-4"
            />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{shop.ShopName}</h1>
            <StarRating rating={shop.rating} />
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <span className="font-semibold text-gray-700">Email:</span>{' '}
              <span className="text-gray-600">{shop.email}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Contact Number:</span>{' '}
              <span className="text-gray-600">{shop.ContactNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Address:</span>{' '}
              <span className="text-gray-600">{shop.ShopAddress}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Country:</span>{' '}
              <span className="text-gray-600">{shop.country}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AuthProtection>
  );
};

export default ShopDetailsPage;