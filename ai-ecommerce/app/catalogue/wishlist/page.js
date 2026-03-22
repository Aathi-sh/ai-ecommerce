// app/catalogue/wishlist/page.js
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  MoveRight,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Loader2,
  HeartOff,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Grid3x3,
  List,
  Search,
  Share2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Package,
  Minus,
  Plus,
  Clock,
  Award,
  TrendingUp,
  Sparkles,
  Zap
} from 'lucide-react';

export default function WishlistPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const companySlug = searchParams.get('company');
  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('addedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (companySlug) {
      const savedWishlist = localStorage.getItem(`wishlist_${companySlug}`);
      if (savedWishlist) {
        try {
          const items = JSON.parse(savedWishlist);
          setWishlist(items);
          setFilteredWishlist(items);
        } catch (e) {
          console.error('Error parsing wishlist:', e);
        }
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [companySlug]);

  // Filter and sort wishlist
  useEffect(() => {
    let filtered = [...wishlist];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'price':
          comparison = (a.discountPrice || 0) - (b.discountPrice || 0);
          break;
        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'rating':
          comparison = (a.averageRating || 0) - (b.averageRating || 0);
          break;
        case 'addedDate':
        default:
          comparison = new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredWishlist(filtered);
  }, [wishlist, searchTerm, sortBy, sortOrder]);

  const removeFromWishlist = async (productId) => {
    setRemovingId(productId);
    await new Promise(resolve => setTimeout(resolve, 300));
    const updated = wishlist.filter(item => item._id !== productId);
    setWishlist(updated);
    localStorage.setItem(`wishlist_${companySlug}`, JSON.stringify(updated));
    setRemovingId(null);
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white bg-red-500 animate-slide-up text-sm';
    toast.textContent = 'Removed from wishlist';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const clearAllWishlist = () => {
    if (confirm('Are you sure you want to remove all items from your wishlist?')) {
      setWishlist([]);
      localStorage.setItem(`wishlist_${companySlug}`, JSON.stringify([]));
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white bg-red-500 animate-slide-up text-sm';
      toast.textContent = 'Wishlist cleared';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  const buyNow = (product) => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(product.productName);
    window.open(`https://wa.me/${finalNumber}?text=${message}`, '_blank');
  };

  const buyAll = () => {
    if (wishlist.length === 0) return;
    const productNames = wishlist.map(p => p.productName).join(', ');
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(`I'm interested in these products: ${productNames}`);
    window.open(`https://wa.me/${finalNumber}?text=${message}`, '_blank');
  };

  const shareWishlist = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: `Check out my wishlist with ${wishlist.length} items!`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white bg-green-500 animate-slide-up text-sm';
      toast.textContent = 'Link copied to clipboard!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating % 1) >= 0.5;
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
              i < fullStars
                ? 'text-yellow-400 fill-current'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-[10px] sm:text-xs text-gray-500">({rating?.toFixed(1) || 0})</span>
      </div>
    );
  };

  const sortOptions = [
    { value: 'addedDate', label: 'Date Added', icon: Clock },
    { value: 'name', label: 'Product Name', icon: Package },
    { value: 'price', label: 'Price', icon: ShoppingCart },
    { value: 'rating', label: 'Rating', icon: Star }
  ];

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option?.label || 'Sort By';
  };

  if (!companySlug && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-sm sm:text-base text-gray-600">Please use a valid catalog link</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
              </div>
              <Link href={`/catalogue/products?company=${companySlug}`} className="text-sm text-blue-600 hover:text-blue-700">
                Continue Shopping →
              </Link>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
          <div className="text-center max-w-md mx-auto p-6">
            <HeartOff className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Save your favorite products here</p>
            <Link
              href={`/catalogue/products?company=${companySlug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              Start Shopping
              <MoveRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => router.back()}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-current" />
                  My Wishlist
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={shareWishlist}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Share wishlist"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <Link
                href={`/catalogue/products?company=${companySlug}`}
                className="text-[10px] sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-0.5 sm:gap-1"
              >
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-1 sm:gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <Filter className="w-4 h-4" />
                  {getSortLabel()}
                  {showSortMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            if (sortBy === option.value) {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy(option.value);
                              setSortOrder('desc');
                            }
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                            sortBy === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </span>
                          {sortBy === option.value && (
                            <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Bulk Actions */}
              {wishlist.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={buyAll}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Buy All
                  </button>
                  <button
                    onClick={clearAllWishlist}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Count */}
          {searchTerm && (
            <div className="mb-3 text-xs sm:text-sm text-gray-500">
              Found {filteredWishlist.length} {filteredWishlist.length === 1 ? 'item' : 'items'} matching "{searchTerm}"
            </div>
          )}

          {/* Wishlist Items */}
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4' : 'space-y-3 sm:space-y-4'}`}>
            {filteredWishlist.map((item) => {
              const discountPercentage = item.mrp && item.discountPrice && item.mrp > item.discountPrice
                ? Math.round(((item.mrp - item.discountPrice) / item.mrp) * 100)
                : 0;
                
              if (viewMode === 'grid') {
                return (
                  <div key={item._id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
                    <Link href={`/catalogue/products/${item.slug}?company=${companySlug}`} className="block">
                      <div className="relative pt-[100%] bg-gray-100">
                        {item.imageUrls?.[0] ? (
                          <Image
                            src={item.imageUrls[0]}
                            alt={item.productName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        {discountPercentage > 0 && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            -{discountPercentage}%
                          </div>
                        )}
                        {item.isFeatured && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                          {item.productName}
                        </h3>
                        <div className="mt-1">{renderStars(item.averageRating)}</div>
                        <div className="mt-2 flex items-baseline gap-1 flex-wrap">
                          <span className="text-base font-bold text-gray-900">₹{item.discountPrice?.toLocaleString()}</span>
                          {item.mrp > item.discountPrice && (
                            <span className="text-xs text-gray-500 line-through">₹{item.mrp?.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          {item.inStock ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> In Stock
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              buyNow(item);
                            }}
                            disabled={!item.inStock}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1 ${
                              item.inStock
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCart className="w-3 h-3" />
                            Buy
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromWishlist(item._id);
                            }}
                            disabled={removingId === item._id}
                            className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                          >
                            {removingId === item._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              }

              // List View
              return (
                <div key={item._id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <Link href={`/catalogue/products/${item.slug}?company=${companySlug}`} className="relative w-full sm:w-28 md:w-32 h-32 bg-gray-100 flex-shrink-0">
                      {item.imageUrls?.[0] ? (
                        <Image
                          src={item.imageUrls[0]}
                          alt={item.productName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      {discountPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          -{discountPercentage}%
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1">
                          <Link href={`/catalogue/products/${item.slug}?company=${companySlug}`} className="hover:underline">
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 hover:text-blue-600">
                              {item.productName}
                            </h3>
                          </Link>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            {renderStars(item.averageRating)}
                            {item.brand && <span className="text-xs text-gray-500">{item.brand}</span>}
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {item.shortDescription || item.description?.substring(0, 100)}
                          </p>
                          <div className="mt-2 flex items-center gap-3 flex-wrap">
                            {item.inStock ? (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> In Stock
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Out of Stock
                              </span>
                            )}
                            {item.sku && <span className="text-xs text-gray-500">SKU: {item.sku}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-gray-900">₹{item.discountPrice?.toLocaleString()}</span>
                            {item.mrp > item.discountPrice && (
                              <span className="text-sm text-gray-500 line-through">₹{item.mrp?.toLocaleString()}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => buyNow(item)}
                              disabled={!item.inStock}
                              className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
                                item.inStock
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Buy Now
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item._id)}
                              disabled={removingId === item._id}
                              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-sm flex items-center gap-2"
                            >
                              {removingId === item._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty Search State */}
          {filteredWishlist.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No items found</h3>
              <p className="text-sm text-gray-500 mb-4">No items matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Delivery Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Truck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-900">Free Delivery</p>
                <p className="text-[10px] sm:text-xs text-gray-500">On all orders</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-900">Secure Checkout</p>
                <p className="text-[10px] sm:text-xs text-gray-500">100% secure payment</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <RefreshCw className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-gray-900">Easy Returns</p>
                <p className="text-[10px] sm:text-xs text-gray-500">7 days return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}