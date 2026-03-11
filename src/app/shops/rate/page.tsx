'use client';
import React, { useState, useEffect } from 'react';
import AuthProtection from '@/components/AuthProtection';
import { Star } from 'lucide-react';

type Shop = {
  id: string;
  ShopName: string;
  image: string;
  rating?: number;
};

const RateShopsPage = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<{ [shopId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/shops', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to load shops');
        setShops(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shops');
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  // Handle rating selection
  const handleRatingSelect = (shopId: string, rating: number) => {
    setSelectedRatings(prev => ({ ...prev, [shopId]: rating }));
  };

  // Submit rating
  const submitRating = async (shopId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
  
      const response = await fetch('/api/shops/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shopId,
          rating: selectedRatings[shopId]
        })
      });
  
      const result = await response.json(); // Move await here
  
      if (!response.ok) {
        throw new Error(result.message || 'Rating failed');
      }
  
      // Update shops with the new rating
      const updatedShops = shops.map(shop => 
        shop.id === shopId ? { ...shop, rating: result.averageRating } : shop
      );
      setShops(updatedShops);
  
    } catch (err) {
      console.error('Rating error:', err);
      alert(err instanceof Error ? err.message : 'Rating failed');
    }
  };

  if (loading) return <div>Loading shops...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <AuthProtection requiredRole="customer">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">Rate Shops</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map(shop => (
            <div key={shop.id} className="bg-white p-6 rounded-lg shadow-md">
              <img 
                src={shop.image} 
                alt={shop.ShopName} 
                className="w-full h-48 object-cover mb-4 rounded"
              />
              <h3 className="text-xl font-semibold mb-4">{shop.ShopName}</h3>
              
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={28}
                    className={`cursor-pointer mx-1 ${
                      star <= (selectedRatings[shop.id] || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                    onClick={() => handleRatingSelect(shop.id, star)}
                  />
                ))}
              </div>

              <button
                onClick={() => submitRating(shop.id)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={!selectedRatings[shop.id]}
              >
                {shop.rating ? 'Update Rating' : 'Submit Rating'}
              </button>

              {shop.rating && (
                <div className="mt-4 text-gray-600">
                  Average Rating: {shop.rating.toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AuthProtection>
  );
};

export default RateShopsPage;