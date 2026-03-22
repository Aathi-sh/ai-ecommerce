'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

export default function WishlistPage({ params }) {
  const [wishlist, setWishlist] = useState([]);
  const companySlug = params.companySlug;

  useEffect(() => {
    const savedWishlist = localStorage.getItem(`wishlist_${companySlug}`);
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, [companySlug]);

  const removeFromWishlist = (productId) => {
    const updated = wishlist.filter(item => item._id !== productId);
    setWishlist(updated);
    localStorage.setItem(`wishlist_${companySlug}`, JSON.stringify(updated));
  };

  const buyNow = (product) => {
    const companyPhone = process.env.NEXT_PUBLIC_COMPANY_PHONE || '919876543210';
    const message = encodeURIComponent(
      `Hi! I'm interested in buying this product:\n\n` +
      `*${product.productName}*\n` +
      `Price: ₹${product.discountPrice?.toLocaleString()}\n` +
      `SKU: ${product.sku}\n\n` +
      `Please provide more details.`
    );
    window.open(`https://wa.me/${companyPhone}?text=${message}`, '_blank');
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save your favorite products here</p>
          <Link
            href={`/${companySlug}/catalog`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist ({wishlist.length})</h1>
        
        <div className="grid gap-4">
          {wishlist.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={product.imageUrls?.[0] || '/placeholder-product.jpg'}
                    alt={product.productName}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <Link href={`/${companySlug}/catalog/${product.slug}`} className="hover:underline">
                    <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                  </Link>
                  <div className="mt-1 text-lg font-bold text-gray-900">
                    ₹{product.discountPrice?.toLocaleString()}
                    {product.mrp > product.discountPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₹{product.mrp?.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => buyNow(product)}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Now
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}