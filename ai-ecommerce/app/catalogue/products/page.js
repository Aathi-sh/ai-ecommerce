// // app/catalogue/products/page.js
// 'use client';

// import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// import { useSearchParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import Link from 'next/link';
// import { debounce } from 'lodash';
// import {
//   Heart,
//   ShoppingCart,
//   Search,
//   Filter,
//   X,
//   Grid3x3,
//   List,
//   Star,
//   ChevronDown,
//   ChevronUp,
//   Loader2,
//   RefreshCw,
//   ZoomIn,
//   ChevronLeft,
//   ChevronRight,
//   Check,
//   AlertCircle,
//   SlidersHorizontal,
//   ArrowUpDown,
//   Tag,
//   Truck,
//   Shield,
//   Eye,
//   Share2,
//   Minus,
//   Plus,
//   Info,
//   Sparkles,
//   TrendingUp,
//   Clock,
//   Award,
//   ShoppingBag,
//   Store,
//   Percent,
//   Package,
//   HeartOff
// } from 'lucide-react';

// // ==================== IMAGE ZOOM MODAL ====================
// const ImageZoomModal = ({ images, currentIndex, onClose, onNext, onPrev }) => {
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [position, setPosition] = useState({ x: 0, y: 0 });

//   const handleMouseMove = (e) => {
//     if (!e.currentTarget || zoomLevel === 1) return;
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - rect.left) / rect.width) * 100;
//     const y = ((e.clientY - rect.top) / rect.height) * 100;
//     setPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) });
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center" onClick={onClose}>
//       <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-2 sm:m-4" onClick={(e) => e.stopPropagation()}>
//         <button onClick={onClose} className="absolute -top-10 right-0 sm:-top-12 text-white hover:text-gray-300 transition-colors z-20">
//           <X className="w-6 h-6 sm:w-8 sm:h-8" />
//         </button>

//         <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 z-20">
//           <button onClick={() => setZoomLevel(Math.min(zoomLevel + 0.5, 3))} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1.5 sm:p-2 rounded-lg transition">
//             <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
//           </button>
//           <button onClick={() => setZoomLevel(1)} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition">
//             Reset
//           </button>
//         </div>

//         <div className="relative w-full h-full overflow-hidden cursor-zoom-in" onMouseMove={handleMouseMove} onMouseLeave={() => setZoomLevel(1)}>
//           <div className="relative w-full h-full flex items-center justify-center">
//             <div
//               className="relative transition-transform duration-200"
//               style={{
//                 width: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%',
//                 height: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%',
//                 transform: zoomLevel > 1 ? `translate(-${position.x}%, -${position.y}%)` : 'none'
//               }}
//             >
//               <Image
//                 src={images[currentIndex] || '/placeholder-product.jpg'}
//                 alt="Product zoom"
//                 fill
//                 className="object-contain"
//                 priority
//               />
//             </div>
//           </div>
//         </div>

//         {images.length > 1 && (
//           <>
//             <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 sm:p-3 rounded-full transition">
//               <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
//             </button>
//             <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 sm:p-3 rounded-full transition">
//               <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
//             </button>
//           </>
//         )}

//         {images.length > 1 && (
//           <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:bottom-4 flex gap-1 sm:gap-2">
//             {images.map((img, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => {
//                   if (idx > currentIndex) onNext();
//                   else if (idx < currentIndex) onPrev();
//                 }}
//                 className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition ${idx === currentIndex ? 'border-blue-500' : 'border-transparent'}`}
//               >
//                 <div className="relative w-full h-full">
//                   <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
//                 </div>
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ==================== PRODUCT CARD COMPONENT ====================
// const ProductCard = ({ product, viewMode, onAddToWishlist, onBuyNow, onQuickView, isWishlisted }) => {
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const router = useRouter();
//   const companySlug = product.companySlug;

//   const discountPercentage = product.mrp && product.discountPrice && product.mrp > product.discountPrice
//     ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
//     : 0;

//   const images = product.imageUrls?.length > 0 ? product.imageUrls : ['/placeholder-product.jpg'];

//   const renderStars = (rating) => {
//     return (
//       <div className="flex items-center gap-0.5">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Star
//             key={star}
//             className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
//               star <= Math.floor(rating)
//                 ? 'text-yellow-400 fill-current'
//                 : star <= rating
//                 ? 'text-yellow-400 fill-current opacity-50'
//                 : 'text-gray-300'
//             }`}
//           />
//         ))}
//         <span className="ml-1 text-[10px] sm:text-xs text-gray-500">({product.totalReviews || 0})</span>
//       </div>
//     );
//   };

//   const nextImage = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setCurrentImageIndex((prev) => (prev + 1) % images.length);
//   };

//   const prevImage = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
//   };

//   const handleCardClick = () => {
//     router.push(`/catalogue/products/${product.slug}?company=${companySlug}`);
//   };

//   // List View
//   if (viewMode === 'list') {
//     return (
//       <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer" onClick={handleCardClick}>
//         <div className="flex flex-col sm:flex-row">
//           {/* Image Section */}
//           <div 
//             className="relative w-full sm:w-48 md:w-56 h-48 sm:h-56 bg-gray-100"
//             onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
//           >
//             {!imageLoaded && !imageError && (
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400" />
//               </div>
//             )}
//             {!imageError ? (
//               <>
//                 <Image
//                   src={images[currentImageIndex]}
//                   alt={product.productName}
//                   fill
//                   className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
//                   onLoad={() => setImageLoaded(true)}
//                   onError={() => setImageError(true)}
//                 />
//                 {images.length > 1 && (
//                   <>
//                     <button
//                       onClick={(e) => { e.stopPropagation(); prevImage(e); }}
//                       className="absolute left-1 top-1/2 -translate-y-1/2 sm:left-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
//                     >
//                       <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
//                     </button>
//                     <button
//                       onClick={(e) => { e.stopPropagation(); nextImage(e); }}
//                       className="absolute right-1 top-1/2 -translate-y-1/2 sm:right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
//                     >
//                       <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
//                     </button>
//                   </>
//                 )}
//               </>
//             ) : (
//               <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
//                 <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
//               </div>
//             )}
//             {discountPercentage > 0 && (
//               <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
//                 -{discountPercentage}%
//               </div>
//             )}
//             {product.isFeatured && (
//               <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
//                 Featured
//               </div>
//             )}
//           </div>

//           {/* Content Section */}
//           <div className="flex-1 p-3 sm:p-5">
//             <div className="flex flex-col h-full">
//               <div className="flex-1">
//                 <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
//                   {product.productName}
//                 </h3>
//                 <div className="mt-1">{renderStars(product.averageRating)}</div>
//                 <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">
//                   {product.shortDescription || product.description?.substring(0, 120)}
//                 </p>
//                 <div className="mt-2 flex flex-wrap gap-2 sm:gap-3">
//                   {product.brand && (
//                     <span className="text-xs text-gray-500 flex items-center gap-1">
//                       <Tag className="w-3 h-3" /> Brand: {product.brand}
//                     </span>
//                   )}
//                   {product.sku && (
//                     <span className="text-xs text-gray-500">SKU: {product.sku}</span>
//                   )}
//                   {product.inStock ? (
//                     <span className="text-xs text-green-600 flex items-center gap-1">
//                       <Check className="w-3 h-3" /> In Stock
//                     </span>
//                   ) : (
//                     <span className="text-xs text-red-600 flex items-center gap-1">
//                       <AlertCircle className="w-3 h-3" /> Out of Stock
//                     </span>
//                   )}
//                 </div>
//               </div>

//               <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t pt-3 sm:pt-4 gap-2">
//                 <div>
//                   <div className="flex items-baseline gap-2 flex-wrap">
//                     <span className="text-xl sm:text-2xl font-bold text-gray-900">
//                       ₹{product.discountPrice?.toLocaleString()}
//                     </span>
//                     {product.mrp > product.discountPrice && (
//                       <span className="text-xs sm:text-sm text-gray-500 line-through">
//                         ₹{product.mrp?.toLocaleString()}
//                       </span>
//                     )}
//                     {discountPercentage > 0 && (
//                       <span className="text-xs sm:text-sm text-green-600 font-medium">
//                         Save ₹{(product.mrp - product.discountPrice).toLocaleString()}
//                       </span>
//                     )}
//                   </div>
//                   {product.gstRate && (
//                     <span className="text-xs text-green-600">incl. {product.gstRate}% GST</span>
//                   )}
//                 </div>
//                 <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); onAddToWishlist(product); }}
//                     className={`p-2 rounded-full transition-all duration-200 ${
//                       isWishlisted
//                         ? 'bg-red-50 text-red-500 hover:bg-red-100'
//                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500'
//                     }`}
//                   >
//                     <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
//                   </button>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}
//                     disabled={!product.inStock}
//                     className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${
//                       product.inStock
//                         ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:scale-105 active:scale-95'
//                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                   >
//                     <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
//                     Buy Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Grid View - Amazon/Flipkart Style
//   return (
//     <div
//       className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer"
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={handleCardClick}
//     >
//       {/* Image Section with Carousel */}
//       <div 
//         className="relative pt-[100%] bg-gray-100 overflow-hidden"
//         onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
//       >
//         {!imageLoaded && !imageError && (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400" />
//           </div>
//         )}
//         {!imageError ? (
//           <>
//             <Image
//               src={images[currentImageIndex]}
//               alt={product.productName}
//               fill
//               className={`absolute top-0 left-0 object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
//               onLoad={() => setImageLoaded(true)}
//               onError={() => setImageError(true)}
//             />
            
//             {/* Image Navigation Arrows */}
//             {images.length > 1 && isHovered && (
//               <>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     prevImage(e);
//                   }}
//                   className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all z-10"
//                 >
//                   <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
//                 </button>
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     nextImage(e);
//                   }}
//                   className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all z-10"
//                 >
//                   <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
//                 </button>
//               </>
//             )}

//             {/* Image Dots */}
//             {images.length > 1 && (
//               <div className="absolute bottom-1 left-1/2 -translate-x-1/2 sm:bottom-2 flex gap-0.5 sm:gap-1 z-10">
//                 {images.map((_, idx) => (
//                   <button
//                     key={idx}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setCurrentImageIndex(idx);
//                     }}
//                     className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all ${
//                       idx === currentImageIndex
//                         ? 'bg-white w-1.5 sm:w-3'
//                         : 'bg-white bg-opacity-50 hover:bg-opacity-75'
//                     }`}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Quick Actions Overlay */}
//             <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-1 sm:gap-2 transition-opacity duration-300 ${
//               isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
//             }`}>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onBuyNow(product);
//                 }}
//                 disabled={!product.inStock}
//                 className={`p-1.5 sm:p-2.5 rounded-full bg-white shadow-lg transition-all hover:scale-110 ${
//                   !product.inStock ? 'opacity-50 cursor-not-allowed' : ''
//                 }`}
//               >
//                 <ShoppingCart className="w-3 h-3 sm:w-5 sm:h-5 text-gray-700" />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onAddToWishlist(product);
//                 }}
//                 className="p-1.5 sm:p-2.5 rounded-full bg-white shadow-lg transition-all hover:scale-110"
//               >
//                 <Heart className={`w-3 h-3 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
//               </button>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onQuickView(product);
//                 }}
//                 className="p-1.5 sm:p-2.5 rounded-full bg-white shadow-lg transition-all hover:scale-110"
//               >
//                 <ZoomIn className="w-3 h-3 sm:w-5 sm:h-5 text-gray-700" />
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
//             <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
//           </div>
//         )}
        
//         {/* Badges */}
//         {discountPercentage > 0 && (
//           <div className="absolute top-1 left-1 sm:top-3 sm:left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
//             -{discountPercentage}%
//           </div>
//         )}
        
//         {product.isFeatured && (
//           <div className="absolute top-1 right-1 sm:top-3 sm:right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
//             Featured
//           </div>
//         )}

//         {product.isNewArrival && (
//           <div className="absolute bottom-1 left-1 sm:bottom-3 sm:left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
//             New
//           </div>
//         )}
//       </div>

//       {/* Content Section */}
//       <div className="p-2 sm:p-4">
//         <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 min-h-[32px] sm:min-h-[40px] hover:text-blue-600 transition-colors">
//           {product.productName}
//         </h3>

//         <div className="mt-1">{renderStars(product.averageRating)}</div>

//         <div className="mt-1 sm:mt-2">
//           <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
//             <span className="text-sm sm:text-lg font-bold text-gray-900">
//               ₹{product.discountPrice?.toLocaleString()}
//             </span>
//             {product.mrp > product.discountPrice && (
//               <span className="text-[10px] sm:text-xs text-gray-500 line-through">
//                 ₹{product.mrp?.toLocaleString()}
//               </span>
//             )}
//           </div>
//           {discountPercentage > 0 && (
//             <span className="text-[10px] sm:text-xs text-green-600 block">
//               Save ₹{(product.mrp - product.discountPrice).toLocaleString()}
//             </span>
//           )}
//           {product.gstRate && (
//             <span className="text-[10px] sm:text-xs text-green-600">incl. {product.gstRate}% GST</span>
//           )}
//         </div>

//         {/* Stock Status */}
//         {!product.inStock && (
//           <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-red-600 flex items-center gap-1">
//             <AlertCircle className="w-2 h-2 sm:w-3 sm:h-3" />
//             Out of Stock
//           </div>
//         )}

//         {/* Free Shipping Badge */}
//         <div className="mt-1 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs text-green-600">
//           <Truck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
//           Free Shipping
//         </div>

//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onBuyNow(product);
//           }}
//           disabled={!product.inStock}
//           className={`mt-2 sm:mt-3 w-full py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm ${
//             product.inStock
//               ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:scale-[1.02] active:scale-98'
//               : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//           }`}
//         >
//           <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
//           {product.inStock ? 'Buy Now' : 'Out of Stock'}
//         </button>
//       </div>
//     </div>
//   );
// };

// // ==================== FILTER SIDEBAR (same as before - keep unchanged) ====================
// const FilterSidebar = ({ filters, onFilterChange, categories, subCategories, isOpen, onClose }) => {
//   const [priceRange, setPriceRange] = useState({ min: filters.minPrice || '', max: filters.maxPrice || '' });
//   const [expandedSections, setExpandedSections] = useState({
//     categories: true,
//     subCategories: false,
//     price: true,
//     stock: true,
//     features: true
//   });

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
//   };

//   const handlePriceApply = () => {
//     onFilterChange({ minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined, maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined });
//   };

//   const clearFilters = () => {
//     setPriceRange({ min: '', max: '' });
//     onFilterChange({
//       category: undefined,
//       subCategory: undefined,
//       minPrice: undefined,
//       maxPrice: undefined,
//       inStock: undefined,
//       isFeatured: undefined,
//       isOnSale: undefined
//     });
//   };

//   const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all' && v !== undefined && v !== false).length;

//   const getSubCategories = () => {
//     if (!filters.category) return [];
//     return subCategories.filter(sub => sub.parentId === filters.category);
//   };

//   return (
//     <>
//       {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}
//       <aside className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
//         <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
//           <div className="p-4 flex justify-between items-center">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
//               {activeFiltersCount > 0 && <p className="text-xs text-gray-500 mt-0.5">{activeFiltersCount} active</p>}
//             </div>
//             <div className="flex gap-2">
//               {activeFiltersCount > 0 && (
//                 <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">Clear All</button>
//               )}
//               <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 space-y-6">
//           {/* Categories Section */}
//           <div className="border-b border-gray-200 pb-4">
//             <button onClick={() => toggleSection('categories')} className="w-full flex justify-between items-center font-semibold text-gray-900">
//               <span>Categories</span>
//               {expandedSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//             </button>
//             {expandedSections.categories && (
//               <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
//                 <button onClick={() => onFilterChange('category', '')} className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${!filters.category ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>All Categories</button>
//                 {categories.map(cat => (
//                   <button key={cat._id} onClick={() => onFilterChange('category', cat._id)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${filters.category === cat._id ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
//                     {cat.name}
//                     {cat.productCount > 0 && <span className="float-right text-xs text-gray-400">({cat.productCount})</span>}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* SubCategories Section */}
//           {filters.category && getSubCategories().length > 0 && (
//             <div className="border-b border-gray-200 pb-4">
//               <button onClick={() => toggleSection('subCategories')} className="w-full flex justify-between items-center font-semibold text-gray-900">
//                 <span>Sub-Categories</span>
//                 {expandedSections.subCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//               </button>
//               {expandedSections.subCategories && (
//                 <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
//                   <button onClick={() => onFilterChange('subCategory', '')} className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${!filters.subCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>All</button>
//                   {getSubCategories().map(sub => (
//                     <button key={sub._id} onClick={() => onFilterChange('subCategory', sub._id)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${filters.subCategory === sub._id ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
//                       {sub.name}
//                       {sub.productCount > 0 && <span className="float-right text-xs text-gray-400">({sub.productCount})</span>}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Price Range Section */}
//           <div className="border-b border-gray-200 pb-4">
//             <button onClick={() => toggleSection('price')} className="w-full flex justify-between items-center font-semibold text-gray-900">
//               <span>Price Range</span>
//               {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//             </button>
//             {expandedSections.price && (
//               <div className="mt-3 space-y-3">
//                 <div className="flex gap-2">
//                   <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">Min</label><input type="number" placeholder="₹0" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
//                   <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">Max</label><input type="number" placeholder="₹10,000" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
//                 </div>
//                 <button onClick={handlePriceApply} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">Apply</button>
//               </div>
//             )}
//           </div>

//           {/* Availability Section */}
//           <div className="border-b border-gray-200 pb-4">
//             <button onClick={() => toggleSection('stock')} className="w-full flex justify-between items-center font-semibold text-gray-900">
//               <span>Availability</span>
//               {expandedSections.stock ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//             </button>
//             {expandedSections.stock && (
//               <div className="mt-3"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.inStock} onChange={(e) => onFilterChange('inStock', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" /><span className="text-sm text-gray-700">In Stock Only</span></label></div>
//             )}
//           </div>

//           {/* Features Section */}
//           <div className="border-b border-gray-200 pb-4">
//             <button onClick={() => toggleSection('features')} className="w-full flex justify-between items-center font-semibold text-gray-900">
//               <span>Features</span>
//               {expandedSections.features ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
//             </button>
//             {expandedSections.features && (
//               <div className="mt-3 space-y-2">
//                 <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.isFeatured} onChange={(e) => onFilterChange('isFeatured', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" /><span className="text-sm text-gray-700">Featured Products</span></label>
//                 <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={filters.isOnSale} onChange={(e) => onFilterChange('isOnSale', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" /><span className="text-sm text-gray-700">On Sale</span></label>
//               </div>
//             )}
//           </div>

//           {activeFiltersCount > 0 && (
//             <button onClick={clearFilters} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">Clear All Filters</button>
//           )}
//         </div>
//       </aside>
//     </>
//   );
// };

// // ==================== MAIN CATALOG PAGE ====================
// export default function CatalogPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [companyInfo, setCompanyInfo] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [wishlist, setWishlist] = useState([]);
//   const [viewMode, setViewMode] = useState('grid');
//   const [isFilterOpen, setIsFilterOpen] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [quickViewProduct, setQuickViewProduct] = useState(null);
//   const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0, limit: 20 });
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [sortMenuOpen, setSortMenuOpen] = useState(false);
//   const loadMoreRef = useRef(null);
//   const companySlug = searchParams.get('company');

//   const [filters, setFilters] = useState({
//     category: searchParams.get('category') || '',
//     subCategory: searchParams.get('subCategory') || '',
//     search: searchParams.get('search') || '',
//     minPrice: searchParams.get('minPrice') || '',
//     maxPrice: searchParams.get('maxPrice') || '',
//     inStock: searchParams.get('inStock') === 'true',
//     isFeatured: searchParams.get('isFeatured') === 'true',
//     isOnSale: searchParams.get('isOnSale') === 'true',
//     sortBy: searchParams.get('sortBy') || 'createdAt',
//     sortOrder: searchParams.get('sortOrder') || 'desc'
//   });

//   const sortOptions = [
//     { value: 'createdAt', label: 'Newest First', icon: Clock },
//     { value: '-discountPrice', label: 'Price: High to Low', icon: ArrowUpDown },
//     { value: 'discountPrice', label: 'Price: Low to High', icon: ArrowUpDown },
//     { value: 'productName', label: 'Name: A to Z', icon: ArrowUpDown },
//     { value: '-productName', label: 'Name: Z to A', icon: ArrowUpDown },
//     { value: 'averageRating', label: 'Top Rated', icon: Star },
//     { value: '-averageRating', label: 'Best Rating', icon: Award }
//   ];

//   const getCurrentSortLabel = () => {
//     const current = sortOptions.find(opt => opt.value === filters.sortBy);
//     return current ? current.label : 'Sort By';
//   };

//   // Load company info
//   useEffect(() => {
//     const loadCompany = async () => {
//       if (!companySlug) { setError('Please provide a company link'); setLoading(false); return; }
//       try {
//         const response = await fetch(`/api/catalog?company=${companySlug}&type=info`);
//         const data = await response.json();
//         if (data.success) setCompanyInfo(data.data);
//         else setError('Store not found');
//       } catch (error) { console.error('Error loading company:', error); setError('Failed to load store'); }
//       finally { setLoading(false); }
//     };
//     loadCompany();
//   }, [companySlug]);

//   // Load wishlist
//   useEffect(() => {
//     if (companySlug) {
//       const savedWishlist = localStorage.getItem(`wishlist_${companySlug}`);
//       if (savedWishlist) try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error('Error parsing wishlist:', e); }
//     }
//   }, [companySlug]);

//   const saveWishlist = useCallback((newWishlist) => {
//     if (companySlug) { localStorage.setItem(`wishlist_${companySlug}`, JSON.stringify(newWishlist)); setWishlist(newWishlist); }
//   }, [companySlug]);

//   const addToWishlist = useCallback((product) => {
//     const exists = wishlist.some(item => item._id === product._id);
//     if (exists) { saveWishlist(wishlist.filter(item => item._id !== product._id)); showToast('Removed from wishlist', 'info'); }
//     else { saveWishlist([...wishlist, product]); showToast('Added to wishlist', 'success'); }
//   }, [wishlist, saveWishlist]);

//   const buyNow = useCallback((product) => {
//     const whatsappNumber = companyInfo?.whatsappNumber || '919876543210';
//     const cleanNumber = whatsappNumber.replace(/\D/g, '');
//     const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
//     const message = encodeURIComponent(product.productName);
//     window.open(`https://wa.me/${finalNumber}?text=${message}`, '_blank');
//   }, [companyInfo]);

//   const showToast = (message, type = 'success') => {
//     const toast = document.createElement('div');
//     toast.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'} animate-slide-up`;
//     toast.textContent = message;
//     document.body.appendChild(toast);
//     setTimeout(() => toast.remove(), 3000);
//   };

//   // Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       if (!companySlug) return;
//       try {
//         const response = await fetch(`/api/catalog?company=${companySlug}&type=categories`);
//         const data = await response.json();
//         if (data.success) { const allCats = data.data || []; setCategories(allCats.filter(cat => !cat.parentId)); setSubCategories(allCats.filter(cat => cat.parentId)); }
//       } catch (error) { console.error('Error fetching categories:', error); }
//     };
//     if (companySlug) fetchCategories();
//   }, [companySlug]);

//   // Fetch products
//   const fetchProducts = useCallback(async (page = 1, append = false) => {
//     if (!companySlug) return;
//     try {
//       if (append) setLoadingMore(true); else setLoading(true);
//       setError(null);
//       const params = new URLSearchParams({ company: companySlug, type: 'products', page: page.toString(), limit: pagination.limit.toString(), sortBy: filters.sortBy, sortOrder: filters.sortOrder });
//       if (filters.category) params.append('category', filters.category);
//       if (filters.subCategory) params.append('subCategory', filters.subCategory);
//       if (filters.search) params.append('search', filters.search);
//       if (filters.minPrice) params.append('minPrice', filters.minPrice);
//       if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
//       if (filters.inStock) params.append('inStock', 'true');
//       if (filters.isFeatured) params.append('isFeatured', 'true');
//       if (filters.isOnSale) params.append('isOnSale', 'true');
//       const response = await fetch(`/api/catalog?${params.toString()}`);
//       const data = await response.json();
//       if (data.success) {
//         const newProducts = data.data || [];
//         if (append) setProducts(prev => [...prev, ...newProducts]);
//         else setProducts(newProducts);
//         setPagination({ page: data.pagination?.page || page, total: data.pagination?.total || newProducts.length, totalPages: data.pagination?.totalPages || 0, limit: data.pagination?.limit || pagination.limit });
//       } else setError(data.message || 'Failed to fetch products');
//     } catch (error) { console.error('Error fetching products:', error); setError('Network error. Please try again.'); }
//     finally { setLoading(false); setLoadingMore(false); }
//   }, [companySlug, filters, pagination.limit]);

//   useEffect(() => { if (companySlug) fetchProducts(1, false); }, [companySlug, filters]);

//   useEffect(() => {
//     const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && !loading && !loadingMore && pagination.page < pagination.totalPages) fetchProducts(pagination.page + 1, true); }, { threshold: 0.1 });
//     if (loadMoreRef.current) observer.observe(loadMoreRef.current);
//     return () => observer.disconnect();
//   }, [loading, loadingMore, pagination.page, pagination.totalPages, fetchProducts]);

//   const debouncedSearch = useMemo(() => debounce((value) => { setFilters(prev => ({ ...prev, search: value })); }, 500), []);
//   const handleFilterChange = (key, value) => { setFilters(prev => ({ ...prev, [key]: value })); setIsFilterOpen(false); };
//   const handleSortChange = (sortBy, sortOrder = 'desc') => { setFilters(prev => ({ ...prev, sortBy, sortOrder })); setSortMenuOpen(false); };
//   const clearFilters = () => { setFilters({ category: '', subCategory: '', search: '', minPrice: '', maxPrice: '', inStock: false, isFeatured: false, isOnSale: false, sortBy: 'createdAt', sortOrder: 'desc' }); };
//   const refreshProducts = () => { fetchProducts(1, false); showToast('Refreshing products...', 'info'); };

//   if (!companySlug && !loading) {
//     return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center max-w-md mx-auto p-6"><Store className="w-16 h-16 text-gray-400 mx-auto mb-4" /><h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Catalog Link</h2><p className="text-gray-600 mb-6">Please use a valid catalog link provided by the store.</p><p className="text-sm text-gray-500">Example: /catalogue/products?company=your-store-slug</p></div></div>);
//   }

//   if (loading && !loadingMore && products.length === 0) {
//     return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" /><p className="text-gray-600">Loading {companyInfo?.companyName || 'store'} catalog...</p></div></div>);
//   }

//   if (error && products.length === 0) {
//     return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-semibold text-gray-900 mb-2">Store Not Found</h2><p className="text-gray-600 mb-4">{error}</p><button onClick={refreshProducts} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try Again</button></div></div>);
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
//         <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
//           <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
//             <div className="flex items-center gap-2 flex-shrink-0">
//               <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-base sm:text-lg">{companyInfo?.companyName?.[0] || 'S'}</span></div>
//               <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-none">{companyInfo?.companyName || 'Store'}</span>
//             </div>
//             <div className="flex items-center gap-2 sm:gap-3">
//               <button onClick={refreshProducts} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors" title="Refresh"><RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /></button>
//               <Link href={`/catalogue/wishlist?company=${companySlug}`} className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"><Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />{wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">{wishlist.length}</span>}</Link>
//             </div>
//           </div>
//           <div className="relative"><Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" /><input type="text" placeholder={`Search ${companyInfo?.companyName || 'products'}...`} defaultValue={filters.search} onChange={(e) => debouncedSearch(e.target.value)} className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" /></div>
//         </div>
//       </header>

//       <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
//         <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2 sm:gap-3">
//           <div className="flex items-center gap-2 sm:gap-3">
//             <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"><SlidersHorizontal className="w-3 h-3 sm:w-4 sm:h-4" /> Filters{Object.values(filters).filter(v => v && v !== '' && v !== false).length > 0 && <span className="ml-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}</button>
//             <div className="relative"><button onClick={() => setSortMenuOpen(!sortMenuOpen)} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"><ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />{getCurrentSortLabel()}<ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" /></button>{sortMenuOpen && (<><div className="fixed inset-0 z-40" onClick={() => setSortMenuOpen(false)} /><div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">{sortOptions.map((option) => (<button key={option.value} onClick={() => { if (option.value.startsWith('-')) handleSortChange(option.value.substring(1), 'desc'); else if (option.value === 'discountPrice') handleSortChange('discountPrice', 'asc'); else if (option.value === '-discountPrice') handleSortChange('discountPrice', 'desc'); else if (option.value === '-productName') handleSortChange('productName', 'desc'); else handleSortChange(option.value, 'desc'); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${filters.sortBy === option.value || (option.value === '-discountPrice' && filters.sortBy === 'discountPrice' && filters.sortOrder === 'desc') || (option.value === 'discountPrice' && filters.sortBy === 'discountPrice' && filters.sortOrder === 'asc') ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}><option.icon className="w-4 h-4" />{option.label}</button>))}</div></>)}</div>
//           </div>
//           <div className="flex items-center gap-1 sm:gap-2"><button onClick={() => setViewMode('grid')} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}><Grid3x3 className="w-4 h-4 sm:w-5 sm:h-5" /></button><button onClick={() => setViewMode('list')} className={`p-1.5 sm:p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}><List className="w-4 h-4 sm:w-5 sm:h-5" /></button></div>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
//           <FilterSidebar filters={filters} onFilterChange={handleFilterChange} categories={categories} subCategories={subCategories} isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
//           <main className="flex-1">
//             <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">Showing {products.length} of {pagination.total} products</div>
//             <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
//               {products.length > 0 ? products.map(product => (<ProductCard key={product._id} product={{ ...product, companySlug }} viewMode={viewMode} onAddToWishlist={addToWishlist} onBuyNow={buyNow} onQuickView={setQuickViewProduct} isWishlisted={wishlist.some(item => item._id === product._id)} />)) : (!loading && <div className="col-span-full text-center py-12 sm:py-16"><div className="inline-flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full mb-4 sm:mb-6"><Search className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" /></div><h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3><p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{filters.search ? `No products matching "${filters.search}"` : 'No products available'}</p><button onClick={clearFilters} className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">Clear Filters</button></div>)}
//             </div>
//             {loadingMore && <div className="mt-4 sm:mt-6 flex justify-center"><Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-600" /></div>}
//             {!loading && products.length > 0 && pagination.page < pagination.totalPages && <div ref={loadMoreRef} className="h-8 sm:h-10" />}
//           </main>
//         </div>
//       </div>

//       {quickViewProduct && <ImageZoomModal images={quickViewProduct.imageUrls || ['/placeholder-product.jpg']} currentIndex={0} onClose={() => setQuickViewProduct(null)} onNext={() => {}} onPrev={() => {}} />}
//       <style jsx>{`@keyframes slide-up { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slide-up { animation: slide-up 0.3s ease-out; }`}</style>
//     </div>
//   );
// }

























// app/catalogue/products/page.js
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { debounce } from 'lodash';
import {
  Heart,
  ShoppingCart,
  Search,
  Filter,
  X,
  Grid3x3,
  List,
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  Truck,
  Shield,
  Eye,
  Share2,
  Minus,
  Plus,
  Info,
  Sparkles,
  TrendingUp,
  Clock,
  Award,
  ShoppingBag,
  Store,
  Percent,
  Package,
  HeartOff
} from 'lucide-react';
import { appTheme } from '../../../src/constants/theme';

// ==================== IMAGE ZOOM MODAL ====================
const ImageZoomModal = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get theme values
  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const backgroundColor = appTheme?.colors?.background || "#F9FAFB";

  const handleMouseMove = (e) => {
    if (!e.currentTarget || zoomLevel === 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x: Math.min(Math.max(x, 0), 100), y: Math.min(Math.max(y, 0), 100) });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-2 sm:m-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 sm:-top-12 text-white hover:text-gray-300 transition-colors z-20">
          <X className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 z-20">
          <button onClick={() => setZoomLevel(Math.min(zoomLevel + 0.5, 3))} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-1.5 sm:p-2 rounded-lg transition">
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button onClick={() => setZoomLevel(1)} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm transition">
            Reset
          </button>
        </div>

        <div className="relative w-full h-full overflow-hidden cursor-zoom-in" onMouseMove={handleMouseMove} onMouseLeave={() => setZoomLevel(1)}>
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              className="relative transition-transform duration-200"
              style={{
                width: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%',
                height: zoomLevel > 1 ? `${zoomLevel * 100}%` : '100%',
                transform: zoomLevel > 1 ? `translate(-${position.x}%, -${position.y}%)` : 'none'
              }}
            >
              <Image
                src={images[currentIndex] || '/placeholder-product.jpg'}
                alt="Product zoom"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 sm:left-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 sm:p-3 rounded-full transition">
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 sm:right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 sm:p-3 rounded-full transition">
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:bottom-4 flex gap-1 sm:gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx > currentIndex) onNext();
                  else if (idx < currentIndex) onPrev();
                }}
                className={`w-8 h-8 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 transition ${idx === currentIndex ? 'border-blue-500' : 'border-transparent'}`}
              >
                <div className="relative w-full h-full">
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== PRODUCT CARD COMPONENT ====================
const ProductCard = ({ product, viewMode, onAddToWishlist, onBuyNow, onQuickView, isWishlisted }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const companySlug = product.companySlug;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get theme values
  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const textPrimary = appTheme?.colors?.textPrimary || "#111827";
  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const successColor = appTheme?.colors?.success || "#10B981";
  const errorColor = appTheme?.colors?.error || "#EF4444";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const backgroundColor = appTheme?.colors?.background || "#F9FAFB";
  
  const fontSizes = appTheme?.fonts?.sizes || { xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem" };
  const fontWeights = appTheme?.fonts?.weights || { normal: 400, medium: 500, semibold: 600, bold: 700 };
  const radiusMd = appTheme?.radius?.md || "8px";
  const radiusLg = appTheme?.radius?.lg || "12px";
  const transitionFast = appTheme?.transitions?.fast || "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";

  const discountPercentage = product.mrp && product.discountPrice && product.mrp > product.discountPrice
    ? Math.round(((product.mrp - product.discountPrice) / product.mrp) * 100)
    : 0;

  const images = product.imageUrls?.length > 0 ? product.imageUrls : ['/placeholder-product.jpg'];

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }}
            className={star <= Math.floor(rating) ? 'text-yellow-400 fill-current' : star <= rating ? 'text-yellow-400 fill-current opacity-50' : 'text-gray-300'}
          />
        ))}
        <span style={{ fontSize: fontSizes.xs, color: textSecondary, marginLeft: '4px' }}>({product.totalReviews || 0})</span>
      </div>
    );
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleCardClick = () => {
    router.push(`/catalogue/products/${product.slug}?company=${companySlug}`);
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div 
        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer" 
        onClick={handleCardClick}
        style={{ backgroundColor: '#FFFFFF', borderColor: borderColor, transition: transitionFast }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div 
            className="relative w-full sm:w-48 md:w-56 h-48 sm:h-56 bg-gray-100"
            style={{ backgroundColor: backgroundColor }}
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
          >
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400" />
              </div>
            )}
            {!imageError ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={product.productName}
                  fill
                  className={`object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(e); }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 sm:left-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(e); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 sm:right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <span style={{ fontSize: fontSizes.xs, color: textSecondary }}>No Image</span>
              </div>
            )}
            {discountPercentage > 0 && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
                -{discountPercentage}%
              </div>
            )}
            {product.isFeatured && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
                Featured
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-3 sm:p-5">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 style={{ fontSize: isMobile ? fontSizes.base : fontSizes.lg, fontWeight: fontWeights.semibold, color: textPrimary }} className="line-clamp-2 hover:text-blue-600 transition-colors">
                  {product.productName}
                </h3>
                <div className="mt-1">{renderStars(product.averageRating)}</div>
                <p style={{ fontSize: fontSizes.sm, color: textSecondary }} className="mt-1 sm:mt-2 line-clamp-2">
                  {product.shortDescription || product.description?.substring(0, 120)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 sm:gap-3">
                  {product.brand && (
                    <span style={{ fontSize: fontSizes.xs, color: textSecondary }} className="flex items-center gap-1">
                      <Tag style={{ width: '12px', height: '12px' }} /> Brand: {product.brand}
                    </span>
                  )}
                  {product.sku && (
                    <span style={{ fontSize: fontSizes.xs, color: textSecondary }}>SKU: {product.sku}</span>
                  )}
                  {product.inStock ? (
                    <span style={{ fontSize: fontSizes.xs, color: successColor }} className="flex items-center gap-1">
                      <Check style={{ width: '12px', height: '12px' }} /> In Stock
                    </span>
                  ) : (
                    <span style={{ fontSize: fontSizes.xs, color: errorColor }} className="flex items-center gap-1">
                      <AlertCircle style={{ width: '12px', height: '12px' }} /> Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t pt-3 sm:pt-4 gap-2" style={{ borderTopColor: borderColor }}>
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span style={{ fontSize: isMobile ? fontSizes.lg : fontSizes.xl, fontWeight: fontWeights.bold, color: textPrimary }}>
                      ₹{product.discountPrice?.toLocaleString()}
                    </span>
                    {product.mrp > product.discountPrice && (
                      <span style={{ fontSize: fontSizes.xs, color: textSecondary }} className="line-through">
                        ₹{product.mrp?.toLocaleString()}
                      </span>
                    )}
                    {discountPercentage > 0 && (
                      <span style={{ fontSize: fontSizes.xs, color: successColor }} className="font-medium">
                        Save ₹{(product.mrp - product.discountPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {product.gstRate && (
                    <span style={{ fontSize: fontSizes.xs, color: successColor }}>incl. {product.gstRate}% GST</span>
                  )}
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddToWishlist(product); }}
                    className={`p-2 rounded-full transition-all duration-200 ${isWishlisted ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500'}`}
                    style={{ transition: transitionFast }}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onBuyNow(product); }}
                    disabled={!product.inStock}
                    className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm ${product.inStock ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:scale-105 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    style={{ transition: transitionFast }}
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden cursor-pointer"
      style={{ backgroundColor: '#FFFFFF', borderColor: borderColor, transition: transitionFast }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image Section with Carousel */}
      <div 
        className="relative pt-[100%] bg-gray-100 overflow-hidden"
        style={{ backgroundColor: backgroundColor }}
        onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-400" />
          </div>
        )}
        {!imageError ? (
          <>
            <Image
              src={images[currentImageIndex]}
              alt={product.productName}
              fill
              className={`absolute top-0 left-0 object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            
            {images.length > 1 && isHovered && !isMobile && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage(e);
                  }}
                  className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all z-10"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage(e);
                  }}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all z-10"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 sm:bottom-2 flex gap-0.5 sm:gap-1 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-1.5 sm:w-3' : 'bg-white bg-opacity-50 hover:bg-opacity-75'}`}
                  />
                ))}
              </div>
            )}

            <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-1 sm:gap-2 transition-opacity duration-300 ${isHovered && !isMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBuyNow(product);
                }}
                disabled={!product.inStock}
                className={`p-1.5 sm:p-2.5 rounded-full bg-white shadow-lg transition-all hover:scale-110 ${!product.inStock ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ShoppingCart className="w-3 h-3 sm:w-5 sm:h-5 text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWishlist(product);
                }}
                className="p-1.5 sm:p-2.5 rounded-full bg-white shadow-lg transition-all hover:scale-110"
              >
                <Heart className={`w-3 h-3 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickView(product);
                }}
                className="p-1.5 sm:p-2.5 rounded-full bg-white shadow-lg transition-all hover:scale-110"
              >
                <ZoomIn className="w-3 h-3 sm:w-5 sm:h-5 text-gray-700" />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span style={{ fontSize: fontSizes.xs, color: textSecondary }}>No Image</span>
          </div>
        )}
        
        {discountPercentage > 0 && (
          <div className="absolute top-1 left-1 sm:top-3 sm:left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
            -{discountPercentage}%
          </div>
        )}
        
        {product.isFeatured && (
          <div className="absolute top-1 right-1 sm:top-3 sm:right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
            Featured
          </div>
        )}

        {product.isNewArrival && (
          <div className="absolute bottom-1 left-1 sm:bottom-3 sm:left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg z-10">
            New
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-2 sm:p-4">
        <h3 style={{ fontSize: isMobile ? fontSizes.xs : fontSizes.sm, fontWeight: fontWeights.semibold, color: textPrimary }} className="line-clamp-2 min-h-[32px] sm:min-h-[40px] hover:text-blue-600 transition-colors">
          {product.productName}
        </h3>

        <div className="mt-1">{renderStars(product.averageRating)}</div>

        <div className="mt-1 sm:mt-2">
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <span style={{ fontSize: isMobile ? fontSizes.sm : fontSizes.lg, fontWeight: fontWeights.bold, color: textPrimary }}>
              ₹{product.discountPrice?.toLocaleString()}
            </span>
            {product.mrp > product.discountPrice && (
              <span style={{ fontSize: fontSizes.xs, color: textSecondary }} className="line-through">
                ₹{product.mrp?.toLocaleString()}
              </span>
            )}
          </div>
          {discountPercentage > 0 && (
            <span style={{ fontSize: fontSizes.xs, color: successColor }} className="block">
              Save ₹{(product.mrp - product.discountPrice).toLocaleString()}
            </span>
          )}
          {product.gstRate && (
            <span style={{ fontSize: fontSizes.xs, color: successColor }}>incl. {product.gstRate}% GST</span>
          )}
        </div>

        {!product.inStock && (
          <div className="mt-1 sm:mt-2 flex items-center gap-1" style={{ fontSize: fontSizes.xs, color: errorColor }}>
            <AlertCircle style={{ width: '10px', height: '10px' }} />
            Out of Stock
          </div>
        )}

        <div className="mt-1 sm:mt-2 flex items-center gap-1" style={{ fontSize: fontSizes.xs, color: successColor }}>
          <Truck style={{ width: '10px', height: '10px' }} />
          Free Shipping
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onBuyNow(product);
          }}
          disabled={!product.inStock}
          className={`mt-2 sm:mt-3 w-full py-1.5 sm:py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm ${product.inStock ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg hover:scale-[1.02] active:scale-98' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          style={{ transition: transitionFast }}
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
          {product.inStock ? 'Buy Now' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

// ==================== FILTER SIDEBAR ====================
const FilterSidebar = ({ filters, onFilterChange, categories, subCategories, isOpen, onClose }) => {
  const [priceRange, setPriceRange] = useState({ min: filters.minPrice || '', max: filters.maxPrice || '' });
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    subCategories: false,
    price: true,
    stock: true,
    features: true
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get theme values
  const primaryColor = appTheme?.colors?.primary || "#3B82F6";
  const textPrimary = appTheme?.colors?.textPrimary || "#111827";
  const textSecondary = appTheme?.colors?.textSecondary || "#6B7280";
  const borderColor = appTheme?.colors?.border || "#E5E7EB";
  const backgroundColor = appTheme?.colors?.background || "#F9FAFB";
  const errorColor = appTheme?.colors?.error || "#EF4444";
  
  const fontSizes = appTheme?.fonts?.sizes || { xs: "0.75rem", sm: "0.875rem", base: "1rem" };
  const fontWeights = appTheme?.fonts?.weights || { normal: 400, medium: 500, semibold: 600 };
  const radiusMd = appTheme?.radius?.md || "8px";
  const radiusLg = appTheme?.radius?.lg || "12px";
  const transitionFast = appTheme?.transitions?.fast || "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePriceApply = () => {
    onFilterChange({ minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined, maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined });
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    onFilterChange({
      category: undefined,
      subCategory: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      inStock: undefined,
      isFeatured: undefined,
      isOnSale: undefined
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'all' && v !== undefined && v !== false).length;

  const getSubCategories = () => {
    if (!filters.category) return [];
    return subCategories.filter(sub => sub.parentId === filters.category);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-none overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ backgroundColor: '#FFFFFF', transition: transitionFast }}>
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200" style={{ borderBottomColor: borderColor }}>
          <div className="p-4 flex justify-between items-center">
            <div>
              <h2 style={{ fontSize: fontSizes.base, fontWeight: fontWeights.semibold, color: textPrimary }}>Filters</h2>
              {activeFiltersCount > 0 && <p style={{ fontSize: fontSizes.xs, color: textSecondary }} className="mt-0.5">{activeFiltersCount} active</p>}
            </div>
            <div className="flex gap-2">
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} style={{ fontSize: fontSizes.sm, color: errorColor }} className="hover:text-red-700">Clear All</button>
              )}
              <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Categories Section */}
          <div className="border-b pb-4" style={{ borderBottomColor: borderColor }}>
            <button onClick={() => toggleSection('categories')} className="w-full flex justify-between items-center font-semibold" style={{ color: textPrimary }}>
              <span>Categories</span>
              {expandedSections.categories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.categories && (
              <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
                <button onClick={() => onFilterChange('category', '')} className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${!filters.category ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`} style={{ transition: transitionFast }}>
                  All Categories
                </button>
                {categories.map(cat => (
                  <button key={cat._id} onClick={() => onFilterChange('category', cat._id)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${filters.category === cat._id ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`} style={{ transition: transitionFast }}>
                    {cat.name}
                    {cat.productCount > 0 && <span className="float-right text-xs text-gray-400">({cat.productCount})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SubCategories Section */}
          {filters.category && getSubCategories().length > 0 && (
            <div className="border-b pb-4" style={{ borderBottomColor: borderColor }}>
              <button onClick={() => toggleSection('subCategories')} className="w-full flex justify-between items-center font-semibold" style={{ color: textPrimary }}>
                <span>Sub-Categories</span>
                {expandedSections.subCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedSections.subCategories && (
                <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                  <button onClick={() => onFilterChange('subCategory', '')} className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${!filters.subCategory ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`} style={{ transition: transitionFast }}>
                    All
                  </button>
                  {getSubCategories().map(sub => (
                    <button key={sub._id} onClick={() => onFilterChange('subCategory', sub._id)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${filters.subCategory === sub._id ? 'bg-blue-50 text-blue-600 font-medium' : 'hover:bg-gray-50 text-gray-700'}`} style={{ transition: transitionFast }}>
                      {sub.name}
                      {sub.productCount > 0 && <span className="float-right text-xs text-gray-400">({sub.productCount})</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Range Section */}
          <div className="border-b pb-4" style={{ borderBottomColor: borderColor }}>
            <button onClick={() => toggleSection('price')} className="w-full flex justify-between items-center font-semibold" style={{ color: textPrimary }}>
              <span>Price Range</span>
              {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.price && (
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label style={{ fontSize: fontSizes.xs, color: textSecondary }} className="mb-1 block">Min</label>
                    <input type="number" placeholder="₹0" value={priceRange.min} onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" style={{ borderColor: borderColor, borderRadius: radiusMd }} />
                  </div>
                  <div className="flex-1">
                    <label style={{ fontSize: fontSizes.xs, color: textSecondary }} className="mb-1 block">Max</label>
                    <input type="number" placeholder="₹10,000" value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" style={{ borderColor: borderColor, borderRadius: radiusMd }} />
                  </div>
                </div>
                <button onClick={handlePriceApply} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm" style={{ backgroundColor: primaryColor, transition: transitionFast }}>
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* Availability Section */}
          <div className="border-b pb-4" style={{ borderBottomColor: borderColor }}>
            <button onClick={() => toggleSection('stock')} className="w-full flex justify-between items-center font-semibold" style={{ color: textPrimary }}>
              <span>Availability</span>
              {expandedSections.stock ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.stock && (
              <div className="mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.inStock} onChange={(e) => onFilterChange('inStock', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span style={{ fontSize: fontSizes.sm, color: textPrimary }}>In Stock Only</span>
                </label>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="border-b pb-4" style={{ borderBottomColor: borderColor }}>
            <button onClick={() => toggleSection('features')} className="w-full flex justify-between items-center font-semibold" style={{ color: textPrimary }}>
              <span>Features</span>
              {expandedSections.features ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expandedSections.features && (
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.isFeatured} onChange={(e) => onFilterChange('isFeatured', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span style={{ fontSize: fontSizes.sm, color: textPrimary }}>Featured Products</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.isOnSale} onChange={(e) => onFilterChange('isOnSale', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span style={{ fontSize: fontSizes.sm, color: textPrimary }}>On Sale</span>
                </label>
              </div>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium" style={{ transition: transitionFast }}>
              Clear All Filters
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

// ==================== MAIN CATALOG PAGE ====================
export default function CatalogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [companyInfo, setCompanyInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0, limit: 20 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const loadMoreRef = useRef(null);
  const companySlug = searchParams.get('company');

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
  
  const fontFamily = appTheme?.fonts?.families?.primary || "Inter, sans-serif";
  const fontSizes = appTheme?.fonts?.sizes || { xs: "0.75rem", sm: "0.875rem", base: "1rem", lg: "1.125rem", xl: "1.25rem" };
  const fontWeights = appTheme?.fonts?.weights || { normal: 400, medium: 500, semibold: 600, bold: 700 };
  const spacing = appTheme?.spacing || { xs: "4px", sm: "8px", md: "16px", lg: "24px" };
  const radiusMd = appTheme?.radius?.md || "8px";
  const radiusLg = appTheme?.radius?.lg || "12px";
  const transitionFast = appTheme?.transitions?.fast || "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)";
  const shadowSm = appTheme?.shadows?.sm || "0 1px 2px 0 rgba(0, 0, 0, 0.05)";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    isFeatured: searchParams.get('isFeatured') === 'true',
    isOnSale: searchParams.get('isOnSale') === 'true',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First', icon: Clock },
    { value: '-discountPrice', label: 'Price: High to Low', icon: ArrowUpDown },
    { value: 'discountPrice', label: 'Price: Low to High', icon: ArrowUpDown },
    { value: 'productName', label: 'Name: A to Z', icon: ArrowUpDown },
    { value: '-productName', label: 'Name: Z to A', icon: ArrowUpDown },
    { value: 'averageRating', label: 'Top Rated', icon: Star },
    { value: '-averageRating', label: 'Best Rating', icon: Award }
  ];

  const getCurrentSortLabel = () => {
    const current = sortOptions.find(opt => opt.value === filters.sortBy);
    return current ? current.label : 'Sort By';
  };

  // Load company info
  useEffect(() => {
    const loadCompany = async () => {
      if (!companySlug) { setError('Please provide a company link'); setLoading(false); return; }
      try {
        const response = await fetch(`/api/catalog?company=${companySlug}&type=info`);
        const data = await response.json();
        if (data.success) setCompanyInfo(data.data);
        else setError('Store not found');
      } catch (error) { console.error('Error loading company:', error); setError('Failed to load store'); }
      finally { setLoading(false); }
    };
    loadCompany();
  }, [companySlug]);

  // Load wishlist
  useEffect(() => {
    if (companySlug) {
      const savedWishlist = localStorage.getItem(`wishlist_${companySlug}`);
      if (savedWishlist) try { setWishlist(JSON.parse(savedWishlist)); } catch (e) { console.error('Error parsing wishlist:', e); }
    }
  }, [companySlug]);

  const saveWishlist = useCallback((newWishlist) => {
    if (companySlug) { localStorage.setItem(`wishlist_${companySlug}`, JSON.stringify(newWishlist)); setWishlist(newWishlist); }
  }, [companySlug]);

  const addToWishlist = useCallback((product) => {
    const exists = wishlist.some(item => item._id === product._id);
    if (exists) { saveWishlist(wishlist.filter(item => item._id !== product._id)); showToast('Removed from wishlist', 'info'); }
    else { saveWishlist([...wishlist, product]); showToast('Added to wishlist', 'success'); }
  }, [wishlist, saveWishlist]);

  const buyNow = useCallback((product) => {
    const whatsappNumber = companyInfo?.whatsappNumber || '919876543210';
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const message = encodeURIComponent(`I'm interested in: ${product.productName}\nPrice: ₹${product.discountPrice?.toLocaleString()}`);
    window.open(`https://wa.me/${finalNumber}?text=${message}`, '_blank');
  }, [companyInfo]);

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white animate-slide-up`;
    toast.style.backgroundColor = type === 'success' ? successColor : type === 'error' ? errorColor : primaryColor;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!companySlug) return;
      try {
        const response = await fetch(`/api/catalog?company=${companySlug}&type=categories`);
        const data = await response.json();
        if (data.success) { const allCats = data.data || []; setCategories(allCats.filter(cat => !cat.parentId)); setSubCategories(allCats.filter(cat => cat.parentId)); }
      } catch (error) { console.error('Error fetching categories:', error); }
    };
    if (companySlug) fetchCategories();
  }, [companySlug]);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1, append = false) => {
    if (!companySlug) return;
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      setError(null);
      const params = new URLSearchParams({ company: companySlug, type: 'products', page: page.toString(), limit: pagination.limit.toString(), sortBy: filters.sortBy, sortOrder: filters.sortOrder });
      if (filters.category) params.append('category', filters.category);
      if (filters.subCategory) params.append('subCategory', filters.subCategory);
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.isFeatured) params.append('isFeatured', 'true');
      if (filters.isOnSale) params.append('isOnSale', 'true');
      const response = await fetch(`/api/catalog?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        const newProducts = data.data || [];
        if (append) setProducts(prev => [...prev, ...newProducts]);
        else setProducts(newProducts);
        setPagination({ page: data.pagination?.page || page, total: data.pagination?.total || newProducts.length, totalPages: data.pagination?.totalPages || 0, limit: data.pagination?.limit || pagination.limit });
      } else setError(data.message || 'Failed to fetch products');
    } catch (error) { console.error('Error fetching products:', error); setError('Network error. Please try again.'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [companySlug, filters, pagination.limit]);

  useEffect(() => { if (companySlug) fetchProducts(1, false); }, [companySlug, filters]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => { if (entries[0].isIntersecting && !loading && !loadingMore && pagination.page < pagination.totalPages) fetchProducts(pagination.page + 1, true); }, { threshold: 0.1 });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading, loadingMore, pagination.page, pagination.totalPages, fetchProducts]);

  const debouncedSearch = useMemo(() => debounce((value) => { setFilters(prev => ({ ...prev, search: value })); }, 500), []);
  const handleFilterChange = (key, value) => { setFilters(prev => ({ ...prev, [key]: value })); setIsFilterOpen(false); };
  const handleSortChange = (sortBy, sortOrder = 'desc') => { setFilters(prev => ({ ...prev, sortBy, sortOrder })); setSortMenuOpen(false); };
  const clearFilters = () => { setFilters({ category: '', subCategory: '', search: '', minPrice: '', maxPrice: '', inStock: false, isFeatured: false, isOnSale: false, sortBy: 'createdAt', sortOrder: 'desc' }); };
  const refreshProducts = () => { fetchProducts(1, false); showToast('Refreshing products...', 'info'); };

  if (!companySlug && !loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: backgroundColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontFamily }}>
        <div style={{ textAlign: "center", maxWidth: "400px", margin: "0 auto", padding: spacing.lg }}>
          <Store style={{ width: "64px", height: "64px", color: textSecondary, margin: "0 auto 16px", opacity: 0.5 }} />
          <h2 style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, color: textPrimary, marginBottom: spacing.xs }}>Invalid Catalog Link</h2>
          <p style={{ fontSize: fontSizes.sm, color: textSecondary, marginBottom: spacing.lg }}>Please use a valid catalog link provided by the store.</p>
          <p style={{ fontSize: fontSizes.xs, color: textSecondary }}>Example: /catalogue/products?company=your-store-slug</p>
        </div>
      </div>
    );
  }

  if (loading && !loadingMore && products.length === 0) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: backgroundColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontFamily }}>
        <div style={{ textAlign: "center" }}>
          <Loader2 style={{ width: "48px", height: "48px", color: primaryColor, margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: fontSizes.sm, color: textSecondary }}>Loading {companyInfo?.companyName || 'store'} catalog...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: backgroundColor, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontFamily }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle style={{ width: "48px", height: "48px", color: errorColor, margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, color: textPrimary, marginBottom: spacing.xs }}>Store Not Found</h2>
          <p style={{ fontSize: fontSizes.sm, color: textSecondary, marginBottom: spacing.md }}>{error}</p>
          <button onClick={refreshProducts} style={{ padding: `${spacing.xs} ${spacing.md}`, backgroundColor: primaryColor, color: "#fff", border: "none", borderRadius: radiusMd, cursor: "pointer", transition: transitionFast }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: backgroundColor, fontFamily: fontFamily }}>
      <header style={{ backgroundColor: surfaceColor, borderBottom: `1px solid ${borderColor}`, position: "sticky", top: 0, zIndex: 30, boxShadow: shadowSm }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? spacing.sm : spacing.md }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, marginBottom: spacing.sm }}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div style={{ width: isMobile ? "32px" : "40px", height: isMobile ? "32px" : "40px", background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, borderRadius: radiusMd, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: fontWeights.bold, fontSize: isMobile ? fontSizes.base : fontSizes.lg }}>{companyInfo?.companyName?.[0] || 'S'}</span>
              </div>
              <span style={{ fontSize: isMobile ? fontSizes.base : fontSizes.xl, fontWeight: fontWeights.bold, background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }} className="truncate max-w-[150px] sm:max-w-none">
                {companyInfo?.companyName || 'Store'}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
              <button onClick={refreshProducts} style={{ padding: spacing.xs, borderRadius: radiusFull, cursor: "pointer", transition: transitionFast }} className="hover:bg-gray-100" title="Refresh">
                <RefreshCw style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: textSecondary }} />
              </button>
              <Link href={`/catalogue/wishlist?company=${companySlug}`} style={{ position: "relative", padding: spacing.xs, borderRadius: radiusFull, cursor: "pointer", transition: transitionFast }} className="hover:bg-gray-100">
                <Heart style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", color: textSecondary }} />
                {wishlist.length > 0 && (
                  <span style={{ position: "absolute", top: "-4px", right: "-4px", backgroundColor: errorColor, color: "#fff", fontSize: fontSizes.xs, borderRadius: radiusFull, width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {wishlist.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: isMobile ? "12px" : "16px", top: "50%", transform: "translateY(-50%)", color: textSecondary, width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px" }} />
            <input
              type="text"
              placeholder={`Search ${companyInfo?.companyName || 'products'}...`}
              defaultValue={filters.search}
              onChange={(e) => debouncedSearch(e.target.value)}
              style={{
                width: "100%",
                padding: isMobile ? `${spacing.xs} ${spacing.sm} ${spacing.xs} ${spacing.xl}` : `${spacing.sm} ${spacing.md} ${spacing.sm} ${spacing.xl}`,
                border: `1px solid ${borderColor}`,
                borderRadius: radiusLg,
                fontSize: isMobile ? fontSizes.sm : fontSizes.base,
                outline: "none",
                transition: transitionFast,
                fontFamily: fontFamily,
              }}
              onFocus={(e) => { e.target.style.borderColor = primaryColor; e.target.style.boxShadow = `0 0 0 3px ${primaryColor}20`; }}
              onBlur={(e) => { e.target.style.borderColor = borderColor; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: isMobile ? spacing.md : spacing.lg }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md, flexWrap: "wrap", gap: spacing.sm }}>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.sm }}>
            <button onClick={() => setIsFilterOpen(true)} style={{ display: "flex", alignItems: "center", gap: spacing.xs, padding: isMobile ? `${spacing.xs} ${spacing.sm}` : `${spacing.xs} ${spacing.md}`, backgroundColor: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: radiusMd, fontSize: fontSizes.sm, cursor: "pointer", transition: transitionFast }} className="hover:bg-gray-50">
              <SlidersHorizontal style={{ width: isMobile ? "12px" : "16px", height: isMobile ? "12px" : "16px" }} />
              Filters
              {Object.values(filters).filter(v => v && v !== '' && v !== false).length > 0 && <span style={{ marginLeft: "4px", width: "6px", height: "6px", backgroundColor: primaryColor, borderRadius: "50%" }}></span>}
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setSortMenuOpen(!sortMenuOpen)} style={{ display: "flex", alignItems: "center", gap: spacing.xs, padding: isMobile ? `${spacing.xs} ${spacing.sm}` : `${spacing.xs} ${spacing.md}`, backgroundColor: surfaceColor, border: `1px solid ${borderColor}`, borderRadius: radiusMd, fontSize: fontSizes.sm, cursor: "pointer", transition: transitionFast }} className="hover:bg-gray-50">
                <ArrowUpDown style={{ width: isMobile ? "12px" : "16px", height: isMobile ? "12px" : "16px" }} />
                {getCurrentSortLabel()}
                <ChevronDown style={{ width: isMobile ? "12px" : "16px", height: isMobile ? "12px" : "16px" }} />
              </button>
              {sortMenuOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSortMenuOpen(false)} />
                  <div style={{ position: "absolute", top: "100%", right: 0, marginTop: spacing.xs, width: "180px", backgroundColor: surfaceColor, borderRadius: radiusMd, boxShadow: shadowSm, border: `1px solid ${borderColor}`, zIndex: 50 }}>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          if (option.value.startsWith('-')) handleSortChange(option.value.substring(1), 'desc');
                          else if (option.value === 'discountPrice') handleSortChange('discountPrice', 'asc');
                          else if (option.value === '-discountPrice') handleSortChange('discountPrice', 'desc');
                          else if (option.value === '-productName') handleSortChange('productName', 'desc');
                          else handleSortChange(option.value, 'desc');
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: `${spacing.xs} ${spacing.md}`,
                          fontSize: fontSizes.sm,
                          backgroundColor: (filters.sortBy === option.value || (option.value === '-discountPrice' && filters.sortBy === 'discountPrice' && filters.sortOrder === 'desc') || (option.value === 'discountPrice' && filters.sortBy === 'discountPrice' && filters.sortOrder === 'asc')) ? `${primaryColor}10` : "transparent",
                          color: (filters.sortBy === option.value || (option.value === '-discountPrice' && filters.sortBy === 'discountPrice' && filters.sortOrder === 'desc') || (option.value === 'discountPrice' && filters.sortBy === 'discountPrice' && filters.sortOrder === 'asc')) ? primaryColor : textPrimary,
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: spacing.xs,
                          transition: transitionFast,
                        }}
                        className="hover:bg-gray-50"
                      >
                        <option.icon style={{ width: "16px", height: "16px" }} />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: spacing.xs }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: spacing.xs, borderRadius: radiusMd, backgroundColor: viewMode === 'grid' ? primaryColor : borderColor, color: viewMode === 'grid' ? "#fff" : textSecondary, transition: transitionFast }}>
              <Grid3x3 style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px" }} />
            </button>
            <button onClick={() => setViewMode('list')} style={{ padding: spacing.xs, borderRadius: radiusMd, backgroundColor: viewMode === 'list' ? primaryColor : borderColor, color: viewMode === 'list' ? "#fff" : textSecondary, transition: transitionFast }}>
              <List style={{ width: isMobile ? "16px" : "20px", height: isMobile ? "16px" : "20px" }} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: spacing.md }}>
          <FilterSidebar filters={filters} onFilterChange={handleFilterChange} categories={categories} subCategories={subCategories} isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
          <main style={{ flex: 1 }}>
            <div style={{ marginBottom: spacing.sm, fontSize: fontSizes.sm, color: textSecondary }}>Showing {products.length} of {pagination.total} products</div>
            <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {products.length > 0 ? products.map(product => (
                <ProductCard
                  key={product._id}
                  product={{ ...product, companySlug }}
                  viewMode={viewMode}
                  onAddToWishlist={addToWishlist}
                  onBuyNow={buyNow}
                  onQuickView={setQuickViewProduct}
                  isWishlisted={wishlist.some(item => item._id === product._id)}
                />
              )) : (!loading && (
                <div className="col-span-full text-center py-12 sm:py-16">
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: isMobile ? "64px" : "96px", height: isMobile ? "64px" : "96px", backgroundColor: borderColor, borderRadius: radiusFull, marginBottom: spacing.md }}>
                    <Search style={{ width: isMobile ? "32px" : "48px", height: isMobile ? "32px" : "48px", color: textSecondary }} />
                  </div>
                  <h3 style={{ fontSize: isMobile ? fontSizes.lg : fontSizes.xl, fontWeight: fontWeights.semibold, color: textPrimary, marginBottom: spacing.xs }}>No products found</h3>
                  <p style={{ fontSize: fontSizes.sm, color: textSecondary, marginBottom: spacing.md }}>{filters.search ? `No products matching "${filters.search}"` : 'No products available'}</p>
                  <button onClick={clearFilters} style={{ padding: `${spacing.xs} ${spacing.md}`, backgroundColor: primaryColor, color: "#fff", border: "none", borderRadius: radiusMd, cursor: "pointer", transition: transitionFast }}>
                    Clear Filters
                  </button>
                </div>
              ))}
            </div>
            {loadingMore && (
              <div style={{ marginTop: spacing.md, display: "flex", justifyContent: "center" }}>
                <Loader2 style={{ width: isMobile ? "24px" : "32px", height: isMobile ? "24px" : "32px", color: primaryColor, animation: "spin 0.8s linear infinite" }} />
              </div>
            )}
            {!loading && products.length > 0 && pagination.page < pagination.totalPages && <div ref={loadMoreRef} style={{ height: isMobile ? "32px" : "40px" }} />}
          </main>
        </div>
      </div>

      {quickViewProduct && (
        <ImageZoomModal
          images={quickViewProduct.imageUrls || ['/placeholder-product.jpg']}
          currentIndex={0}
          onClose={() => setQuickViewProduct(null)}
          onNext={() => {}}
          onPrev={() => {}}
        />
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