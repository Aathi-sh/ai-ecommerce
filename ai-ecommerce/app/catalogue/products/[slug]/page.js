// app/catalogue/products/[slug]/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Check,
  AlertCircle,
  Truck,
  Shield,
  RefreshCw,
  Share2,
  Copy,
  CheckCircle2,
  Package,
  Clock,
  Award,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  Eye,
  HeartOff,
  Minus,
  Plus,
  Info,
  MapPin,
  Calendar,
  CreditCard,
  RotateCcw,
  Headphones,
  Zap,
  Sparkles,
  Leaf,
  Gem,
  Layers,
  Scale,
  Droplet,
  Ruler,
  Weight,
  Battery,
  Wifi,
  Bluetooth,
  Camera,
  Smartphone,
  Watch,
  Laptop,
  Loader2,
  Tablet,
  Headphones as HeadphonesIcon,
  User
} from 'lucide-react';

// ==================== IMAGE GALLERY COMPONENT ====================
const ImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-2 md:pb-0">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                selectedImage === idx ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} - Image ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 order-1 md:order-2">
        <div
          className={`relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          {!isZoomed ? (
            <Image
              src={images[selectedImage] || '/placeholder-product.jpg'}
              alt={productName}
              fill
              className="object-contain p-2 sm:p-4 transition-transform duration-300 hover:scale-110"
              priority
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={images[selectedImage] || '/placeholder-product.jpg'}
                alt={productName}
                fill
                className="object-contain transition-transform duration-200"
                style={{
                  transform: `scale(2) translate(${zoomPosition.x > 50 ? '-' : ''}${Math.abs(zoomPosition.x - 50) / 2}%, ${zoomPosition.y > 50 ? '-' : ''}${Math.abs(zoomPosition.y - 50) / 2}%)`
                }}
              />
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/90 backdrop-blur p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white transition"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
        </div>

        {images.length > 1 && (
          <div className="text-center mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500">
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== RATING STARS ====================
const RatingStars = ({ rating, totalReviews, size = 'md' }) => {
  const starSizes = {
    sm: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    md: 'w-3 h-3 sm:w-4 sm:h-4',
    lg: 'w-4 h-4 sm:w-5 sm:h-5'
  };
  const textSizes = {
    sm: 'text-[10px] sm:text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm sm:text-base'
  };

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${starSizes[size]} ${
              i < fullStars
                ? 'text-yellow-400 fill-current'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {totalReviews > 0 && (
        <span className={`${textSizes[size]} text-gray-500`}>
          {rating.toFixed(1)} ({totalReviews})
        </span>
      )}
    </div>
  );
};

// ==================== SPECIFICATION TABLE ====================
const SpecificationTable = ({ specifications }) => {
  if (!specifications || Object.keys(specifications).length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
            <span className="text-xs sm:text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== VARIANT SELECTOR ====================
const VariantSelector = ({ variants, selectedVariant, onSelect }) => {
  if (!variants || variants.length === 0) return null;

  const groupedVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.variantName]) {
      acc[variant.variantName] = [];
    }
    acc[variant.variantName].push(variant);
    return acc;
  }, {});

  return (
    <div className="space-y-3 sm:space-y-4">
      {Object.entries(groupedVariants).map(([name, options]) => (
        <div key={name}>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
            {name} <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {options.map((option) => (
              <button
                key={option.variantValue}
                onClick={() => onSelect(option)}
                className={`px-2.5 py-1 sm:px-4 sm:py-2 rounded-lg border transition-all text-xs sm:text-sm ${
                  selectedVariant?.variantValue === option.variantValue
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">{option.variantValue}</span>
                  {option.price && (
                    <span className="text-[10px] sm:text-xs text-gray-500">₹{option.price}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==================== REVIEW COMPONENT ====================
const ReviewItem = ({ review }) => {
  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-900">{review.userName || 'Customer'}</p>
          <RatingStars rating={review.rating} size="sm" />
        </div>
        <span className="text-[10px] sm:text-xs text-gray-400 ml-auto">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-gray-600">{review.comment}</p>
      {review.verifiedPurchase && (
        <p className="text-[10px] sm:text-xs text-green-600 mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Verified Purchase
        </p>
      )}
    </div>
  );
};

// ==================== MAIN PRODUCT DETAIL PAGE ====================
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const companySlug = searchParams.get('company');

  const [product, setProduct] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [copied, setCopied] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Load product details from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug || !companySlug) {
        setError('Invalid product link');
        setLoading(false);
        return;
      }

      try {
        // Fetch product details
        const response = await fetch(`/api/catalog?company=${companySlug}&type=product&slug=${slug}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
          setCompany({
            name: data.data.companyName || companySlug,
            slug: companySlug,
            whatsapp: data.data.whatsappNumber
          });
          
          // Fetch related products (same category)
          if (data.data.category?._id) {
            const relatedRes = await fetch(`/api/catalog?company=${companySlug}&type=products&category=${data.data.category._id}&limit=4`);
            const relatedData = await relatedRes.json();
            if (relatedData.success) {
              setRelatedProducts(relatedData.data.filter(p => p._id !== data.data._id));
            }
          }
          
          // Fetch reviews (if you have a reviews API)
          try {
            const reviewsRes = await fetch(`/api/reviews?productId=${data.data._id}&company=${companySlug}`);
            const reviewsData = await reviewsRes.json();
            if (reviewsData.success) {
              setReviews(reviewsData.data);
            }
          } catch (e) {
            // Reviews API may not exist yet
            console.log('Reviews not available');
          }
        } else {
          setError(data.message || 'Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, companySlug]);

  // Load wishlist status
  useEffect(() => {
    if (companySlug && product) {
      const savedWishlist = localStorage.getItem(`wishlist_${companySlug}`);
      if (savedWishlist) {
        try {
          const wishlist = JSON.parse(savedWishlist);
          setIsWishlisted(wishlist.some(item => item._id === product._id));
        } catch (e) {
          console.error('Error parsing wishlist:', e);
        }
      }
    }
  }, [companySlug, product]);

  const addToWishlist = useCallback(() => {
    if (!product || !companySlug) return;

    const savedWishlist = localStorage.getItem(`wishlist_${companySlug}`);
    let wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];

    if (isWishlisted) {
      wishlist = wishlist.filter(item => item._id !== product._id);
      showToast('Removed from wishlist', 'info');
    } else {
      wishlist.push(product);
      showToast('Added to wishlist', 'success');
    }

    localStorage.setItem(`wishlist_${companySlug}`, JSON.stringify(wishlist));
    setIsWishlisted(!isWishlisted);
  }, [product, companySlug, isWishlisted]);

  const buyNow = useCallback(() => {
    const whatsappNumber = company?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210';
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    
    let productDetails = product.productName;
    if (selectedVariant) {
      productDetails += ` (${selectedVariant.variantName}: ${selectedVariant.variantValue})`;
    }
    if (quantity > 1) {
      productDetails += ` - Quantity: ${quantity}`;
    }
    
    const message = encodeURIComponent(productDetails);
    window.open(`https://wa.me/${finalNumber}?text=${message}`, '_blank');
  }, [product, selectedVariant, quantity, company]);

  const shareProduct = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product?.productName,
        text: `Check out this product: ${product?.productName}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} animate-slide-up text-xs sm:text-sm`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const discountPercentage = product?.mrp && product?.discountPrice && product.mrp > product.discountPrice
    ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
    : 0;

  const savingsAmount = product?.mrp && product?.discountPrice && product.mrp > product.discountPrice
    ? product.mrp - product.discountPrice
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-blue-600 mx-auto mb-3 sm:mb-4" />
          <p className="text-xs sm:text-sm text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-4 sm:p-6">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            href={`/catalogue/products?company=${companySlug}`}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <Link href={`/catalogue/products?company=${companySlug}`} className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm md:text-lg">{company?.name?.[0] || 'S'}</span>
              </div>
              <span className="text-xs sm:text-sm md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate max-w-[100px] sm:max-w-[120px] md:max-w-none">
                {company?.name || 'Store'}
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={`/catalogue/wishlist?company=${companySlug}`}
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="mb-3 sm:mb-4 md:mb-6">
          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-gray-500 overflow-x-auto whitespace-nowrap pb-1 sm:pb-2">
            <Link href={`/catalogue/products?company=${companySlug}`} className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
            {product.category && (
              <>
                <Link href={`/catalogue/products?company=${companySlug}&category=${product.category._id}`} className="hover:text-blue-600">
                  {product.category.name}
                </Link>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
              </>
            )}
            {product.subCategory && (
              <>
                <Link href={`/catalogue/products?company=${companySlug}&subCategory=${product.subCategory._id}`} className="hover:text-blue-600">
                  {product.subCategory.name}
                </Link>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0" />
              </>
            )}
            <span className="text-gray-700 font-medium truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">{product.productName}</span>
          </div>
        </div>

        {/* Product Main Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
              {/* Left Column - Images */}
              <div>
                <ImageGallery images={product.imageUrls || []} productName={product.productName} />
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {product.productName}
                  </h1>
                  
                  {product.brand && (
                    <div className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                      Brand: <span className="font-medium text-gray-700">{product.brand}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
                    <RatingStars rating={product.averageRating} totalReviews={product.totalReviews} size="md" />
                    {product.sku && (
                      <span className="text-[10px] sm:text-xs text-gray-500">SKU: {product.sku}</span>
                    )}
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                    <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                      ₹{product.discountPrice?.toLocaleString()}
                    </span>
                    {product.mrp > product.discountPrice && (
                      <>
                        <span className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 line-through">
                          ₹{product.mrp?.toLocaleString()}
                        </span>
                        <span className="bg-red-100 text-red-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[10px] sm:text-xs md:text-sm font-medium">
                          Save ₹{savingsAmount?.toLocaleString()} ({discountPercentage}% OFF)
                        </span>
                      </>
                    )}
                  </div>
                  
                  {product.gstRate && (
                    <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-green-600">
                      Inclusive of {product.gstRate}% GST
                    </div>
                  )}
                  
                  {product.discountPrice > 5000 && (
                    <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 sm:gap-2">
                      <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                      No Cost EMI available
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {product.inStock ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="text-xs sm:text-sm font-medium text-green-700">In Stock</span>
                      {product.stock <= 10 && (
                        <span className="text-[10px] sm:text-xs text-orange-600 ml-1 sm:ml-2">
                          Only {product.stock} left!
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      <span className="text-xs sm:text-sm font-medium text-red-700">Out of Stock</span>
                    </>
                  )}
                </div>

                {/* Variant Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 sm:pt-5 md:pt-6">
                    <VariantSelector
                      variants={product.variants}
                      selectedVariant={selectedVariant}
                      onSelect={setSelectedVariant}
                    />
                  </div>
                )}

                {/* Quantity Selector */}
                {product.inStock && (
                  <div className="border-t border-gray-200 pt-4 sm:pt-5 md:pt-6">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 md:mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-10 sm:w-12 text-center font-medium text-base sm:text-lg">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.maxOrderQuantity || 10, quantity + 1))}
                        disabled={quantity >= (product.maxOrderQuantity || 10)}
                        className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      {product.maxOrderQuantity && (
                        <span className="text-[10px] sm:text-xs text-gray-500 ml-1 sm:ml-2">
                          Max {product.maxOrderQuantity}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    onClick={buyNow}
                    disabled={!product.inStock}
                    className={`flex-1 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                      product.inStock
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:scale-[1.02] active:scale-98'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    {product.inStock ? 'Buy Now' : 'Out of Stock'}
                  </button>
                  
                  <button
                    onClick={addToWishlist}
                    className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl font-medium border transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base ${
                      isWishlisted
                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                        : 'border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    <span className="hidden xs:inline">{isWishlisted ? 'Added' : 'Add to Wishlist'}</span>
                  </button>
                  
                  <button
                    onClick={shareProduct}
                    className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                  >
                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">Share</span>
                  </button>
                </div>

                {/* Delivery Info */}
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">Free Delivery</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Get by {new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">7 Days Return</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">Easy returns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">Secure Checkout</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">100% secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-4 sm:mt-6 md:mt-8">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 overflow-x-auto">
              <div className="flex min-w-max">
                {[
                  { id: 'description', label: 'Product Details', icon: Info },
                  { id: 'specifications', label: 'Specifications', icon: Layers },
                  { id: 'reviews', label: `Reviews (${product.totalReviews || 0})`, icon: MessageSquare },
                  { id: 'shipping', label: 'Shipping & Returns', icon: Truck }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 sm:gap-2 ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-5 lg:p-6">
              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 leading-relaxed">
                    {product.description || 'No description available for this product.'}
                  </div>
                  
                  {product.shortDescription && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2">Key Highlights</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{product.shortDescription}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                    {product.inStock && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-green-600">
                        <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> In Stock
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-amber-600">
                        <Award className="w-3 h-3 sm:w-4 sm:h-4" /> Featured
                      </div>
                    )}
                    {product.isOnSale && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-red-600">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4" /> On Sale
                      </div>
                    )}
                    {product.isNewArrival && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-blue-600">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> New Arrival
                      </div>
                    )}
                    {product.isBestSeller && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-purple-600">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> Best Seller
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specifications Tab */}
              {activeTab === 'specifications' && (
                <SpecificationTable specifications={product.specifications} />
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  {product.totalReviews > 0 && (
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{product.averageRating.toFixed(1)}</div>
                        <RatingStars rating={product.averageRating} size="sm" />
                        <div className="text-[10px] sm:text-xs text-gray-500 mt-1">{product.totalReviews} reviews</div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-gray-500">Customer reviews will appear here</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3 sm:space-y-4">
                    {reviews.length > 0 ? (
                      reviews.map((review, idx) => <ReviewItem key={idx} review={review} />)
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                        <p className="text-xs sm:text-sm text-gray-500">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping & Returns Tab */}
              {activeTab === 'shipping' && (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Shipping Information</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Free shipping on all orders. Estimated delivery within 3-5 business days. Once shipped, you will receive a tracking number via WhatsApp.</p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Returns Policy</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Not satisfied with your purchase? We offer a 7-day return policy. Please contact us via WhatsApp for return instructions. Items must be unused and in original packaging.</p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Contact Us</h4>
                    <p className="text-xs sm:text-sm text-gray-600">For any queries regarding your order, please reach out to us on WhatsApp. We're here to help!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((item) => (
                <Link
                  key={item._id}
                  href={`/catalogue/products/${item.slug}?company=${companySlug}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                >
                  <div className="relative pt-[100%] bg-gray-100">
                    {item.imageUrls?.[0] && (
                      <Image
                        src={item.imageUrls[0]}
                        alt={item.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {item.discountPercentage > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        -{item.discountPercentage}%
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                      {item.productName}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xs sm:text-sm font-bold">₹{item.discountPrice?.toLocaleString()}</span>
                      {item.mrp > item.discountPrice && (
                        <span className="text-[10px] text-gray-500 line-through">₹{item.mrp?.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2.5 sm:p-3 lg:hidden z-20">
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={addToWishlist}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium border transition flex items-center justify-center gap-1.5 sm:gap-2 text-sm ${
              isWishlisted
                ? 'bg-red-50 border-red-200 text-red-600'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={buyNow}
            disabled={!product.inStock}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 sm:gap-2 text-sm ${
              product.inStock
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            Buy Now
          </button>
        </div>
      </div>

      <div className="h-14 sm:h-16 lg:hidden"></div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        
        @media (max-width: 480px) {
          .xs\\:inline { display: inline; }
        }
        @media (min-width: 481px) {
          .xs\\:inline { display: none; }
        }
      `}</style>
    </div>
  );
}