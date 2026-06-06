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
import { appTheme } from '../../../../src/constants/theme';

// ==================== IMAGE GALLERY COMPONENT ====================
const ImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get theme values
  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const backgroundColor = appTheme?.colors?.background || "#F9FAFB";
  const radiusMd = appTheme?.radius?.md || "8px";
  const radiusLg = appTheme?.radius?.lg || "12px";
  const transitionFast = appTheme?.transitions?.fast || "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";

  const handleMouseMove = (e) => {
    if (!isZoomed || isMobile) return;
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
              style={{
                borderWidth: "2px",
                borderRadius: radiusMd,
                transition: transitionFast,
                borderColor: selectedImage === idx ? primaryColor : borderColor,
                boxShadow: selectedImage === idx ? `0 0 0 2px ${primaryColor}20` : "none"
              }}
              className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0"
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
          style={{
            backgroundColor: backgroundColor,
            borderRadius: radiusLg,
            cursor: isZoomed && !isMobile ? 'zoom-out' : 'zoom-in',
            transition: transitionFast
          }}
          className={`relative aspect-square overflow-hidden`}
          onMouseEnter={() => !isMobile && setIsZoomed(true)}
          onMouseLeave={() => !isMobile && setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => !isMobile && setIsZoomed(!isZoomed)}
        >
          {!isZoomed || isMobile ? (
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
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(4px)",
              borderRadius: radiusMd,
              transition: transitionFast
            }}
            className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-white"
          >
            <ZoomIn style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: "#374151" }} />
          </button>
        </div>

        {images.length > 1 && (
          <div className="text-center mt-1 sm:mt-2" style={{ fontSize: appTheme?.fonts?.sizes?.xs || "0.75rem", color: appTheme?.colors?.textSecondary || "#6B7280" }}>
            {selectedImage + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== RATING STARS ====================
const RatingStars = ({ rating, totalReviews, size = 'md' }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const fontSizes = appTheme?.fonts?.sizes || { xs: "0.75rem", sm: "0.875rem", base: "1rem" };
  
  const starSizes = {
    sm: isMobile ? 'w-2 h-2' : 'w-3 h-3',
    md: isMobile ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5',
    lg: isMobile ? 'w-3 h-3' : 'w-4 h-4'
  };
  const textSizes = {
    sm: fontSizes.xs,
    md: fontSizes.sm,
    lg: fontSizes.base
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
        <span style={{ fontSize: textSizes[size], color: textSecondary }}>
          {rating.toFixed(1)} ({totalReviews})
        </span>
      )}
    </div>
  );
};

// ==================== SPECIFICATION TABLE ====================
const SpecificationTable = ({ specifications }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const backgroundColor = appTheme?.colors?.background || "#F9FAFB";
  const textPrimary = appTheme?.colors?.textPrimary || "#111827";
  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const fontSizes = appTheme?.fonts?.sizes || { xs: "0.75rem", sm: "0.875rem", base: "1rem" };
  const radiusLg = appTheme?.radius?.lg || "12px";
  
  if (!specifications || Object.keys(specifications).length === 0) return null;

  return (
    <div style={{ backgroundColor, borderRadius: radiusLg }} className="p-4 sm:p-6">
      <h3 style={{ fontSize: isMobile ? fontSizes.base : fontSizes.lg, fontWeight: "600", color: textPrimary }} className="mb-3 sm:mb-4">
        Specifications
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} style={{ borderBottomColor: borderColor }} className="flex items-center justify-between py-2 border-b last:border-0">
            <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }} className="capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
            <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: "500", color: textPrimary }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== VARIANT SELECTOR ====================
const VariantSelector = ({ variants, selectedVariant, onSelect }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const textPrimary = appTheme?.colors?.textPrimary || "#111827";
  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const fontSizes = appTheme?.fonts?.sizes || { xs: "0.75rem", sm: "0.875rem", base: "1rem" };
  const radiusMd = appTheme?.radius?.md || "8px";
  const transitionFast = appTheme?.transitions?.fast || "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
  
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
          <label style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: "500", color: textSecondary }} className="block mb-1.5 sm:mb-2">
            {name} <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {options.map((option) => (
              <button
                key={option.variantValue}
                onClick={() => onSelect(option)}
                style={{
                  padding: isMobile ? "4px 8px" : "6px 16px",
                  borderRadius: radiusMd,
                  borderWidth: "1px",
                  transition: transitionFast,
                  fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
                  borderColor: selectedVariant?.variantValue === option.variantValue ? primaryColor : borderColor,
                  backgroundColor: selectedVariant?.variantValue === option.variantValue ? `${primaryColor}10` : "transparent",
                  color: selectedVariant?.variantValue === option.variantValue ? primaryColor : textPrimary
                }}
                className="hover:border-blue-400 hover:bg-gray-50"
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">{option.variantValue}</span>
                  {option.price && (
                    <span style={{ fontSize: fontSizes.xs, color: textSecondary }}>₹{option.price}</span>
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const textPrimary = appTheme?.colors?.textPrimary || "#111827";
  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const successColor = appTheme?.colors?.success || "#10B981";
  const fontSizes = appTheme?.fonts?.sizes || { xs: "0.75rem", sm: "0.875rem", base: "1rem" };
  
  return (
    <div style={{ borderBottomColor: borderColor }} className="pb-4 mb-4 last:border-0 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <div style={{ backgroundColor: borderColor }} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
          <User style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: textSecondary }} />
        </div>
        <div>
          <p style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: "500", color: textPrimary }}>
            {review.userName || 'Customer'}
          </p>
          <RatingStars rating={review.rating} size="sm" />
        </div>
        <span style={{ fontSize: fontSizes.xs, color: textSecondary }} className="ml-auto">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>{review.comment}</p>
      {review.verifiedPurchase && (
        <p style={{ fontSize: fontSizes.xs, color: successColor }} className="mt-1 flex items-center gap-1">
          <CheckCircle2 style={{ width: "12px", height: "12px" }} />
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get theme values
  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const secondaryColor = appTheme?.colors?.secondary || "#8B5CF6";
  const backgroundColor = appTheme?.colors?.background || "#F9FAFB";
  const surfaceColor = appTheme?.colors?.surface || "#FFFFFF";
  const textPrimary = appTheme?.colors?.textPrimary || "#111827";
  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const successColor = appTheme?.colors?.success || "#10B981";
  const errorColor = appTheme?.colors?.error || "#EF4444";
  const warningColor = appTheme?.colors?.warning || "#F59E0B";
  
  const fontFamily = appTheme?.fonts?.families?.primary || "Inter, sans-serif";
  const fontSizes = appTheme?.fonts?.sizes || { xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem", "4xl": "2.25rem" };
  const fontWeights = appTheme?.fonts?.weights || { normal: 400, medium: 500, semibold: 600, bold: 700 };
  const spacing = appTheme?.spacing || { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px" };
  const radiusMd = appTheme?.radius?.md || "8px";
  const radiusLg = appTheme?.radius?.lg || "12px";
  const radiusFull = appTheme?.radius?.full || "9999px";
  const transitionFast = appTheme?.transitions?.fast || "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
  const transitionNormal = appTheme?.transitions?.normal || "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  const shadowSm = appTheme?.shadows?.sm || "0 1px 2px 0 rgba(0, 0, 0, 0.05)";

  // Load product details from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug || !companySlug) {
        setError('Invalid product link');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/catalog?company=${companySlug}&type=product&slug=${slug}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.data);
          setCompany({
            name: data.data.companyName || companySlug,
            slug: companySlug,
            whatsapp: data.data.whatsappNumber
          });
          
          if (data.data.category?._id) {
            const relatedRes = await fetch(`/api/catalog?company=${companySlug}&type=products&category=${data.data.category._id}&limit=4`);
            const relatedData = await relatedRes.json();
            if (relatedData.success) {
              setRelatedProducts(relatedData.data.filter(p => p._id !== data.data._id));
            }
          }
          
          try {
            const reviewsRes = await fetch(`/api/reviews?productId=${data.data._id}&company=${companySlug}`);
            const reviewsData = await reviewsRes.json();
            if (reviewsData.success) {
              setReviews(reviewsData.data);
            }
          } catch (e) {
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

  // ========== FIXED: WhatsApp buy now with proper product name and price ==========
  const buyNow = useCallback(() => {
    const whatsappNumber = company?.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

    // ✅ Only product name
    const message = encodeURIComponent(product.productName);

    window.open(`https://wa.me/${finalNumber}?text=${message}`, '_blank');
  }, [product, company]);

  // ========== FIXED: Share function with safe clipboard handling ==========
  const shareProduct = async () => {
    const url = window.location.href;
    const productName = product?.productName || 'Product';
    
    // Method 1: Use Web Share API (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `Check out ${productName} on our store!`,
          url: url,
        });
        return;
      } catch (err) {
        console.log('Share cancelled or failed:', err);
        // Fall through to clipboard method
      }
    }
    
    // Method 2: Use Clipboard API (HTTPS or localhost)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast('Link copied to clipboard!', 'success');
        return;
      } catch (err) {
        console.error('Clipboard write failed:', err);
        // Fall through to fallback method
      }
    }
    
    // Method 3: Fallback for older browsers or non-HTTPS
    try {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast('Link copied to clipboard!', 'success');
      } else {
        showToast('Unable to copy link. Please copy manually.', 'error');
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      showToast('Unable to copy link. Please copy manually.', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? successColor : type === 'error' ? errorColor : primaryColor;
    toast.className = `fixed bottom-4 right-4 z-50 px-3 py-2 sm:px-4 sm:py-2 rounded-lg shadow-lg text-white animate-slide-up text-xs sm:text-sm`;
    toast.style.backgroundColor = bgColor;
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
      <div style={{ minHeight: "100vh", backgroundColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 style={{ width: isMobile ? "32px" : "48px", height: isMobile ? "32px" : "48px", color: primaryColor, margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: fontSizes.sm, color: textSecondary, marginTop: spacing.sm }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily }}>
        <div style={{ textAlign: "center", maxWidth: "400px", margin: "0 auto", padding: spacing.lg }}>
          <AlertCircle style={{ width: isMobile ? "48px" : "64px", height: isMobile ? "48px" : "64px", color: errorColor, margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: isMobile ? fontSizes.lg : fontSizes["2xl"], fontWeight: fontWeights.semibold, color: textPrimary, marginBottom: spacing.xs }}>
            Product Not Found
          </h2>
          <p style={{ fontSize: fontSizes.sm, color: textSecondary, marginBottom: spacing.md }}>{error || 'The product you are looking for does not exist.'}</p>
          <Link
            href={`/catalogue/products?company=${companySlug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: spacing.xs,
              padding: `${spacing.xs} ${spacing.md}`,
              backgroundColor: primaryColor,
              color: "#fff",
              borderRadius: radiusMd,
              textDecoration: "none",
              fontSize: fontSizes.sm,
              transition: transitionFast
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <ChevronLeft style={{ width: "16px", height: "16px" }} />
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor, fontFamily }}>
      {/* Header */}
      <header style={{ backgroundColor: surfaceColor, borderBottom: `1px solid ${borderColor}`, position: "sticky", top: 0, zIndex: 30, boxShadow: shadowSm }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? spacing.sm : spacing.md }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href={`/catalogue/products?company=${companySlug}`} style={{ display: "flex", alignItems: "center", gap: spacing.xs, textDecoration: "none" }}>
              <div style={{ width: isMobile ? "32px" : "40px", height: isMobile ? "32px" : "40px", background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, borderRadius: radiusMd, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: fontWeights.bold, fontSize: isMobile ? fontSizes.base : fontSizes.lg }}>{company?.name?.[0] || 'S'}</span>
              </div>
              <span style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.xl, fontWeight: fontWeights.bold, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }} className="truncate max-w-[100px] sm:max-w-[120px] md:max-w-none">
                {company?.name || 'Store'}
              </span>
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
              <Link
                href={`/catalogue/wishlist?company=${companySlug}`}
                style={{ padding: spacing.xs, borderRadius: radiusFull, transition: transitionFast }}
                className="hover:bg-gray-100"
              >
                <Heart style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: textSecondary }} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? spacing.md : spacing.lg }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: spacing.md }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs, fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary, overflowX: "auto", whiteSpace: "nowrap", paddingBottom: spacing.xs }} className="pb-1 sm:pb-2">
            <Link href={`/catalogue/products?company=${companySlug}`} style={{ color: textSecondary, textDecoration: "none" }} className="hover:text-blue-600">Home</Link>
            {/* FIX 1: Larger, coloured chevron */}
            <ChevronRight style={{ width: isMobile ? "14px" : "16px", height: isMobile ? "14px" : "16px", flexShrink: 0, color: textSecondary }} />
            {product.category && (
              <>
                <Link href={`/catalogue/products?company=${companySlug}&category=${product.category._id}`} style={{ color: textSecondary, textDecoration: "none" }} className="hover:text-blue-600">
                  {product.category.name}
                </Link>
                <ChevronRight style={{ width: isMobile ? "14px" : "16px", height: isMobile ? "14px" : "16px", flexShrink: 0, color: textSecondary }} />
              </>
            )}
            {product.subCategory && (
              <>
                <Link href={`/catalogue/products?company=${companySlug}&subCategory=${product.subCategory._id}`} style={{ color: textSecondary, textDecoration: "none" }} className="hover:text-blue-600">
                  {product.subCategory.name}
                </Link>
                <ChevronRight style={{ width: isMobile ? "14px" : "16px", height: isMobile ? "14px" : "16px", flexShrink: 0, color: textSecondary }} />
              </>
            )}
            <span style={{ color: textPrimary, fontWeight: fontWeights.medium }} className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
              {product.productName}
            </span>
          </div>
        </div>

        {/* Product Main Section */}
        <div style={{ backgroundColor: surfaceColor, borderRadius: radiusLg, boxShadow: shadowSm, border: `1px solid ${borderColor}`, overflow: "hidden" }}>
          <div style={{ padding: isMobile ? spacing.sm : spacing.lg }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
              {/* Left Column - Images */}
              <div>
                <ImageGallery images={product.imageUrls || []} productName={product.productName} />
              </div>

              {/* Right Column - Product Info */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <h1 style={{ fontSize: isMobile ? fontSizes.lg : fontSizes["3xl"], fontWeight: fontWeights.bold, color: textPrimary }} className="mb-2 sm:mb-3">
                    {product.productName}
                  </h1>
                  
                  {product.brand && (
                    <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }} className="mb-1 sm:mb-2">
                      Brand: <span style={{ fontWeight: fontWeights.medium, color: textPrimary }}>{product.brand}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
                    <RatingStars rating={product.averageRating} totalReviews={product.totalReviews} size="md" />
                    {product.sku && (
                      <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>SKU: {product.sku}</span>
                    )}
                  </div>
                </div>

                {/* Price Section */}
                <div style={{ backgroundColor, borderRadius: radiusLg }} className="p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                    <span style={{ fontSize: isMobile ? fontSizes.xl : fontSizes["3xl"], fontWeight: fontWeights.bold, color: textPrimary }}>
                      ₹{product.discountPrice?.toLocaleString()}
                    </span>
                    {product.mrp > product.discountPrice && (
                      <>
                        <span style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.lg, color: textSecondary }} className="line-through">
                          ₹{product.mrp?.toLocaleString()}
                        </span>
                        <span style={{ backgroundColor: `${errorColor}20`, color: errorColor, padding: isMobile ? "2px 6px" : "4px 8px", borderRadius: radiusLg, fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: fontWeights.medium }}>
                          Save ₹{savingsAmount?.toLocaleString()} ({discountPercentage}% OFF)
                        </span>
                      </>
                    )}
                  </div>
                  
                  {product.gstRate && (
                    <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: successColor }} className="mt-1 sm:mt-2">
                      Inclusive of {product.gstRate}% GST
                    </div>
                  )}
                  
                  {product.discountPrice > 5000 && (
                    <div style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }} className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2">
                      <CreditCard style={{ width: isMobile ? "12px" : "16px", height: isMobile ? "12px" : "16px" }} />
                      No Cost EMI available
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {product.inStock ? (
                    <>
                      <CheckCircle2 style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: successColor }} />
                      <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: fontWeights.medium, color: successColor }}>In Stock</span>
                      {product.stock <= 10 && (
                        <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: warningColor }} className="ml-1 sm:ml-2">
                          Only {product.stock} left!
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <AlertCircle style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: errorColor }} />
                      <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: fontWeights.medium, color: errorColor }}>Out of Stock</span>
                    </>
                  )}
                </div>

                {/* Variant Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div style={{ borderTopColor: borderColor }} className="border-t pt-4 sm:pt-5 md:pt-6">
                    <VariantSelector
                      variants={product.variants}
                      selectedVariant={selectedVariant}
                      onSelect={setSelectedVariant}
                    />
                  </div>
                )}

                {/* Quantity Selector - FIX 2: Styled with proper colors */}
                {product.inStock && (
                  <div style={{ borderTopColor: borderColor }} className="border-t pt-4 sm:pt-5 md:pt-6">
                    <label style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: fontWeights.medium, color: textSecondary }} className="block mb-1.5 sm:mb-2 md:mb-3">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        style={{
                          width: isMobile ? "32px" : "40px",
                          height: isMobile ? "32px" : "40px",
                          borderRadius: radiusMd,
                          border: `1px solid ${borderColor}`,
                          transition: transitionFast,
                          color: textPrimary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        className="hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus style={{ width: isMobile ? "14px" : "18px", height: isMobile ? "14px" : "18px", color: "currentColor" }} />
                      </button>
                      <span
                        style={{
                          width: isMobile ? "44px" : "52px",
                          textAlign: "center",
                          fontSize: isMobile ? fontSizes.base : fontSizes.lg,
                          fontWeight: fontWeights.semibold,
                          color: primaryColor,
                          backgroundColor: `${primaryColor}10`,
                          padding: `${spacing.xs} 0`,
                          borderRadius: radiusMd
                        }}
                      >
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.maxOrderQuantity || 10, quantity + 1))}
                        disabled={quantity >= (product.maxOrderQuantity || 10)}
                        style={{
                          width: isMobile ? "32px" : "40px",
                          height: isMobile ? "32px" : "40px",
                          borderRadius: radiusMd,
                          border: `1px solid ${borderColor}`,
                          transition: transitionFast,
                          color: textPrimary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        className="hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus style={{ width: isMobile ? "14px" : "18px", height: isMobile ? "14px" : "18px", color: "currentColor" }} />
                      </button>
                      {product.maxOrderQuantity && (
                        <span style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }} className="ml-1 sm:ml-2">
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
                    style={{
                      flex: 1,
                      padding: isMobile ? `${spacing.xs} ${spacing.sm}` : `${spacing.sm} ${spacing.md}`,
                      borderRadius: radiusLg,
                      fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                      fontWeight: fontWeights.semibold,
                      background: product.inStock ? `linear-gradient(135deg, ${successColor}, ${successColor}CC)` : borderColor,
                      color: "#fff",
                      cursor: product.inStock ? "pointer" : "not-allowed",
                      opacity: product.inStock ? 1 : 0.6,
                      transition: transitionFast
                    }}
                    className="hover:shadow-lg hover:scale-[1.02] active:scale-98"
                  >
                    <ShoppingCart style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", display: "inline", marginRight: spacing.xs }} />
                    {product.inStock ? 'Buy Now' : 'Out of Stock'}
                  </button>
                  
                  <button
                    onClick={addToWishlist}
                    style={{
                      padding: isMobile ? `${spacing.xs} ${spacing.sm}` : `${spacing.sm} ${spacing.md}`,
                      borderRadius: radiusLg,
                      fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                      fontWeight: fontWeights.medium,
                      backgroundColor: isWishlisted ? `${errorColor}10` : "transparent",
                      border: `1px solid ${isWishlisted ? errorColor : borderColor}`,
                      color: isWishlisted ? errorColor : textSecondary,
                      transition: transitionFast
                    }}
                    className="hover:border-red-300 hover:text-red-600"
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                    {/* FIX 3: Use sm:inline instead of xs:inline */}
                    <span className="hidden sm:inline">{isWishlisted ? 'Added' : 'Add to Wishlist'}</span>
                  </button>
                  
                  <button
                    onClick={shareProduct}
                    style={{
                      padding: isMobile ? `${spacing.xs} ${spacing.sm}` : `${spacing.sm} ${spacing.md}`,
                      borderRadius: radiusLg,
                      fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                      fontWeight: fontWeights.medium,
                      backgroundColor: "transparent",
                      border: `1px solid ${borderColor}`,
                      color: textSecondary,
                      transition: transitionFast
                    }}
                    className="hover:bg-gray-50"
                  >
                    <Share2 style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", display: "inline", marginRight: spacing.xs }} />
                    {/* FIX 3: Use sm:inline instead of xs:inline */}
                    <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
                  </button>
                </div>

                {/* Delivery Info */}
                <div style={{ backgroundColor, borderRadius: radiusLg }} className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Truck style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: textSecondary }} />
                    <div>
                      <p style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: fontWeights.medium, color: textPrimary }}>Free Delivery</p>
                      <p style={{ fontSize: fontSizes.xs, color: textSecondary }}>Get by {new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <RotateCcw style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: textSecondary }} />
                    <div>
                      <p style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: fontWeights.medium, color: textPrimary }}>7 Days Return</p>
                      <p style={{ fontSize: fontSizes.xs, color: textSecondary }}>Easy returns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Shield style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: textSecondary }} />
                    <div>
                      <p style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: fontWeights.medium, color: textPrimary }}>Secure Checkout</p>
                      <p style={{ fontSize: fontSizes.xs, color: textSecondary }}>100% secure</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== TABS SECTION ========== */}
        <div style={{ marginTop: spacing.lg, backgroundColor: surfaceColor, borderRadius: radiusLg, border: `1px solid ${borderColor}`, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${borderColor}`, overflowX: "auto", gap: 0 }}>
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: isMobile ? `${spacing.sm} ${spacing.md}` : `${spacing.md} ${spacing.lg}`,
                  fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                  fontWeight: activeTab === tab ? fontWeights.semibold : fontWeights.medium,
                  color: activeTab === tab ? primaryColor : textSecondary,
                  borderBottom: activeTab === tab ? `2px solid ${primaryColor}` : "none",
                  transition: transitionFast,
                  whiteSpace: "nowrap"
                }}
                className="hover:text-blue-600"
              >
                {tab === 'description' && 'Product Details'}
                {tab === 'specifications' && 'Specifications'}
                {tab === 'reviews' && `Reviews (${product.totalReviews || 0})`}
              </button>
            ))}
          </div>

          <div style={{ padding: isMobile ? spacing.md : spacing.lg }}>
            {activeTab === 'description' && (
              <div>
                <h3 style={{ fontSize: isMobile ? fontSizes.base : fontSizes.lg, fontWeight: fontWeights.semibold, color: textPrimary, marginBottom: spacing.sm }}>Description</h3>
                <p style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.base, color: textSecondary, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {product.description}
                </p>
                {product.shortDescription && (
                  <div className="mt-4 p-3 sm:p-4" style={{ backgroundColor, borderRadius: radiusMd }}>
                    <p style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, color: textSecondary }}>
                      {product.shortDescription}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <SpecificationTable specifications={product.specifications} />
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 style={{ fontSize: isMobile ? fontSizes.base : fontSizes.lg, fontWeight: fontWeights.semibold, color: textPrimary }}>Customer Reviews</h3>
                  <button
                    onClick={() => window.open(`https://wa.me/${company?.whatsapp}?text=I%20want%20to%20review%20${product.productName}`, '_blank')}
                    style={{
                      padding: `${spacing.xs} ${spacing.md}`,
                      backgroundColor: successColor,
                      color: "#fff",
                      borderRadius: radiusMd,
                      fontSize: isMobile ? fontSizes.xs : fontSizes.sm,
                      fontWeight: fontWeights.medium,
                      border: "none",
                      cursor: "pointer",
                      transition: transitionFast
                    }}
                    className="hover:opacity-90"
                  >
                    Write a Review
                  </button>
                </div>
                {reviews.length > 0 ? (
                  reviews.map((review) => <ReviewItem key={review._id} review={review} />)
                ) : (
                  <div style={{ textAlign: "center", padding: spacing.xl }}>
                    <MessageSquare style={{ width: isMobile ? "32px" : "48px", height: isMobile ? "32px" : "48px", color: textSecondary, margin: "0 auto", opacity: 0.5 }} />
                    <p style={{ fontSize: fontSizes.sm, color: textSecondary, marginTop: spacing.sm }}>No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ========== RELATED PRODUCTS ========== */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: spacing.lg }}>
            <h2 style={{ fontSize: isMobile ? fontSizes.xl : fontSizes["2xl"], fontWeight: fontWeights.bold, color: textPrimary, marginBottom: spacing.md }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <Link
                  key={relProduct._id}
                  href={`/catalogue/products/${relProduct.slug}?company=${companySlug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{ backgroundColor: surfaceColor, borderRadius: radiusLg, overflow: "hidden", border: `1px solid ${borderColor}`, transition: transitionFast }} className="hover:shadow-lg hover:-translate-y-1">
                    <div className="relative aspect-square">
                      <Image
                        src={relProduct.imageUrls?.[0] || '/placeholder-product.jpg'}
                        alt={relProduct.productName}
                        fill
                        className="object-cover"
                      />
                      {relProduct.discountPrice && relProduct.mrp && relProduct.mrp > relProduct.discountPrice && (
                        <span style={{ position: "absolute", top: spacing.xs, right: spacing.xs, backgroundColor: errorColor, color: "#fff", padding: "2px 6px", borderRadius: radiusMd, fontSize: fontSizes.xs, fontWeight: fontWeights.bold }}>
                          -{Math.round(((relProduct.mrp - relProduct.discountPrice) / relProduct.mrp) * 100)}%
                        </span>
                      )}
                    </div>
                    <div style={{ padding: spacing.md }}>
                      <h3 style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.semibold, color: textPrimary, marginBottom: spacing.xs, lineHeight: 1.3 }} className="line-clamp-2">
                        {relProduct.productName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.base, fontWeight: fontWeights.bold, color: primaryColor }}>
                          ₹{relProduct.discountPrice?.toLocaleString()}
                        </span>
                        {relProduct.mrp > relProduct.discountPrice && (
                          <span style={{ fontSize: fontSizes.xs, color: textSecondary, textDecoration: "line-through" }}>
                            ₹{relProduct.mrp?.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <RatingStars rating={relProduct.averageRating} totalReviews={relProduct.totalReviews} size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar (mobile) */}
      {isMobile && product.inStock && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: surfaceColor,
          borderTop: `1px solid ${borderColor}`,
          padding: spacing.sm,
          display: "flex",
          gap: spacing.sm,
          zIndex: 40,
          boxShadow: "0 -4px 12px rgba(0,0,0,0.1)"
        }}>
          <button
            onClick={buyNow}
            style={{
              flex: 2,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: radiusLg,
              fontSize: fontSizes.base,
              fontWeight: fontWeights.semibold,
              background: `linear-gradient(135deg, ${successColor}, ${successColor}CC)`,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.xs
            }}
          >
            <ShoppingCart style={{ width: "18px", height: "18px" }} />
            Buy Now
          </button>
          <button
            onClick={addToWishlist}
            style={{
              flex: 1,
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: radiusLg,
              fontSize: fontSizes.base,
              backgroundColor: isWishlisted ? `${errorColor}10` : "transparent",
              border: `1px solid ${isWishlisted ? errorColor : borderColor}`,
              color: isWishlisted ? errorColor : textSecondary,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}