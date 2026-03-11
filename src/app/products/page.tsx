// app/products/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MODELS } from '@/validators/option-validator';
import { BASE_PRICE, PRODUCT_PRICES } from '@/config/products';
import Phone from '@/components/Phone';
import { cn } from '@/lib/utils';

type Design = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  commissionRate: number;
  status: 'pending' | 'approved' | 'rejected';
  configuration: {
    color: string;
    model: string;
    material: string;
    finish: string;
    croppedImageUrl: string;
    width: number;
    height: number;
    imageUrl?: string;
  };
};

type SortOption = 'none' | 'price-low-to-high' | 'price-high-to-low';

const ProductListPage: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('none');

  useEffect(() => {
    const fetchApprovedDesigns = async () => {
      try {
        const response = await fetch('/api/designs/approved');
        const data = await response.json();
        setDesigns(data);
      } catch (error) {
        console.error('Error fetching approved designs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedDesigns();
  }, []);

  const calculateSellingPrice = (design: Design) => {
    const basePrice = BASE_PRICE;
    const materialPrice = PRODUCT_PRICES.material[design.configuration.material] || 0;
    const finishPrice = PRODUCT_PRICES.finish[design.configuration.finish] || 0;
    const totalPrice = basePrice + materialPrice + finishPrice;

    const commissionRate = design.commissionRate / 100;
    const shopRate = 0.1; // Example shop rate (10%)
    const sellingPrice = (totalPrice + totalPrice * (commissionRate + shopRate))/100;

    return sellingPrice;
  };

  const getModelLabel = (modelValue: string) => {
    const modelOption = MODELS.options.find(({ value }) => value === modelValue);
    return modelOption ? modelOption.label : 'iPhone Case';
  };

  const filteredAndSortedDesigns = useMemo(() => {
    // First, filter designs by search query
    let result = designs.filter((design) =>
      design.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then, sort designs based on the selected sort option
    if (sortOption === 'price-low-to-high') {
      result.sort((a, b) => calculateSellingPrice(a) - calculateSellingPrice(b));
    } else if (sortOption === 'price-high-to-low') {
      result.sort((a, b) => calculateSellingPrice(b) - calculateSellingPrice(a));
    }

    return result;
  }, [designs, searchQuery, sortOption]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-10">
      <div className="container mx-auto px-4">
        <motion.h1
          className="text-4xl font-bold text-gray-800 text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Phone Cases
        </motion.h1>

        {/* Search and Sort Container */}
        <div className="mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-violet-400"
          />

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-violet-400"
          >
            <option value="none">Sort by: Default</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
          </select>
        </div>

        {/* Design Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
          }}
        >
          {filteredAndSortedDesigns.map((design) => (
            <motion.div
              key={design.id}
              className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-6 flex justify-center">
                <Phone
                  className={cn("max-w-[150px]")}
                  style={{ backgroundColor: design.configuration.color || '#000000' }}
                  imgSrc={design.configuration.croppedImageUrl}
                  model={design.configuration.model}
                />
              </div>
              
              <div className="p-5 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{design.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{getModelLabel(design.configuration.model)}</p>
                <p className="text-gray-700 mt-2 font-bold">${calculateSellingPrice(design).toFixed(2)}</p>
                
                <Link href={`/designs/${design.id}`} className="block mt-4">
                  <motion.button
                    className="w-full bg-violet-500 text-white py-2 px-4 rounded-lg hover:bg-violet-600 transition duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Details
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {loading && (
          <div className="flex justify-center mt-12">
            <div className="w-12 h-12 border-4 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && filteredAndSortedDesigns.length === 0 && (
          <div className="text-center mt-12 p-8 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700">No designs found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or check back later for new designs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;