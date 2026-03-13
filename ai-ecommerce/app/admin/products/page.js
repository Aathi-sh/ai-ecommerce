// // app/admin/products/page.js
// "use client";

// import React, { useEffect, useState, useMemo } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { appTheme } from "../../../src/constants/theme";
// import { DataTable } from "../../../src/components/table";
// import { 
//   FaSearch, 
//   FaTimes, 
//   FaPlus, 
//   FaEdit, 
//   FaTrash, 
//   FaToggleOn, 
//   FaToggleOff,
//   FaTag,
//   FaBoxes,
//   FaChartLine,
//   FaStar,
//   FaFire,
//   FaCalendarAlt,
//   FaPercent,
//   FaHashtag
// } from 'react-icons/fa';

// // Safe number formatter utility
// const safeNumber = (value, defaultValue = 0) => {
//   if (value === null || value === undefined) return defaultValue;
//   if (typeof value === 'number') return value;
//   const parsed = parseFloat(value);
//   return isNaN(parsed) ? defaultValue : parsed;
// };

// const safeToFixed = (value, digits = 2) => {
//   const num = safeNumber(value);
//   return num.toFixed(digits);
// };

// // Format custom ID to 5-digit format (00123)
// const formatCustomId = (id) => {
//   if (!id && id !== 0) return 'N/A';
//   return String(id).padStart(5, '0');
// };

// // Get category display name from populated object
// const getCategoryName = (category) => {
//   if (!category) return 'Uncategorized';
//   if (typeof category === 'string') return category;
//   return category.name || 'Uncategorized';
// };

// // Get subcategory display name from populated object
// const getSubCategoryName = (subCategory) => {
//   if (!subCategory) return null;
//   if (typeof subCategory === 'string') return subCategory;
//   return subCategory.name || null;
// };

// // ✅ Helper to validate ObjectId (added for safety)
// const isValidObjectId = (id) => {
//   return /^[0-9a-fA-F]{24}$/.test(id);
// };

// // Mobile Card Component with enhanced product data
// const MobileProductCard = ({ product, onEdit, onDelete, onToggleStatus, appTheme }) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Safe number values
//   const mrp = safeNumber(product.mrp);
//   const discountPrice = safeNumber(product.discountPrice);
//   const stock = safeNumber(product.stock);
//   const gstRate = safeNumber(product.gstRate);
//   const costPrice = safeNumber(product.costPrice);
//   const margin = safeNumber(product.margin);
//   const averageRating = safeNumber(product.averageRating);
//   const customId = product.customId;

//   // Get category names
//   const categoryName = getCategoryName(product.category);
//   const subCategoryName = getSubCategoryName(product.subCategory);
//   const fullCategory = subCategoryName ? `${categoryName} → ${subCategoryName}` : categoryName;

//   // Calculate discount percentage
//   const discountPercentage = useMemo(() => {
//     if (mrp > 0 && discountPrice < mrp) {
//       return Math.round(((mrp - discountPrice) / mrp) * 100);
//     }
//     return 0;
//   }, [mrp, discountPrice]);

//   // Determine stock status
//   const getStockStatus = () => {
//     if (stock === 0) return { label: "Out of Stock", color: appTheme.colors.error };
//     if (stock <= (product.lowStockThreshold || 5)) return { label: "Low Stock", color: appTheme.colors.warning };
//     return { label: "In Stock", color: appTheme.colors.success };
//   };

//   const stockStatus = getStockStatus();

//   return (
//     <div style={{
//       backgroundColor: appTheme.colors.surface,
//       borderRadius: "12px",
//       padding: "16px",
//       marginBottom: "12px",
//       border: `1px solid ${appTheme.colors.border}`,
//       boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
//       position: "relative",
//     }}>
//       {/* Product Header */}
//       <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
//         {/* Product Image */}
//         <div style={{
//           width: "70px",
//           height: "70px",
//           borderRadius: "8px",
//           overflow: "hidden",
//           flexShrink: 0,
//           backgroundColor: appTheme.colors.background,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           border: `1px solid ${appTheme.colors.border}`,
//         }}>
//           {product.imageUrls?.[0] ? (
//             <img 
//               src={product.imageUrls[0]} 
//               alt={product.productName}
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover"
//               }}
//               onError={(e) => {
//                 e.target.style.display = 'none';
//                 e.target.nextElementSibling.style.display = 'flex';
//               }}
//             />
//           ) : null}
//           {!product.imageUrls?.[0] && (
//             <div style={{
//               color: appTheme.colors.textSecondary,
//               fontSize: "0.7rem",
//               fontWeight: "600",
//               textAlign: "center"
//             }}>
//               No Image
//             </div>
//           )}
//         </div>

//         {/* Product Info */}
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ 
//             display: "flex", 
//             justifyContent: "space-between", 
//             alignItems: "flex-start",
//             marginBottom: "6px" 
//           }}>
//             <h3 style={{
//               fontSize: "0.95rem",
//               fontWeight: "600",
//               color: appTheme.colors.textPrimary,
//               margin: 0,
//               lineHeight: 1.3,
//               flex: 1,
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               marginRight: "8px"
//             }}>
//               {product.productName}
//             </h3>
//             <span style={{
//               backgroundColor: product.isActive ? appTheme.colors.success + "20" : appTheme.colors.textSecondary + "20",
//               color: product.isActive ? appTheme.colors.success : appTheme.colors.textSecondary,
//               padding: "3px 8px",
//               borderRadius: "10px",
//               fontSize: "0.7rem",
//               fontWeight: "600",
//               whiteSpace: "nowrap",
//               display: "flex",
//               alignItems: "center",
//               gap: "4px"
//             }}>
//               {product.isActive ? "Active" : "Inactive"}
//             </span>
//           </div>

//           {/* Custom ID Display */}
//           <div style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "4px",
//             marginBottom: "4px",
//             fontSize: "0.7rem",
//             color: appTheme.colors.textSecondary
//           }}>
//             <FaHashtag size={10} />
//             <span style={{ fontFamily: "monospace", fontWeight: "500" }}>
//               ID: {formatCustomId(customId)}
//             </span>
//           </div>

//           <div style={{ 
//             display: "flex", 
//             alignItems: "center", 
//             gap: "6px", 
//             marginBottom: "6px",
//             flexWrap: "wrap" 
//           }}>
//             <span style={{
//               backgroundColor: appTheme.colors.primary + "15",
//               color: appTheme.colors.primary,
//               padding: "2px 8px",
//               borderRadius: "8px",
//               fontSize: "0.7rem",
//               fontWeight: "500",
//               border: `1px solid ${appTheme.colors.primary}20`
//             }}>
//               {fullCategory}
//             </span>
            
//             {product.brand && (
//               <span style={{
//                 backgroundColor: appTheme.colors.secondary + "15",
//                 color: appTheme.colors.secondary,
//                 padding: "2px 8px",
//                 borderRadius: "8px",
//                 fontSize: "0.7rem",
//                 fontWeight: "500",
//                 border: `1px solid ${appTheme.colors.secondary}20`
//               }}>
//                 {product.brand}
//               </span>
//             )}
//           </div>

//           {/* Pricing */}
//           <div style={{ 
//             display: "flex", 
//             alignItems: "center", 
//             gap: "8px",
//             marginBottom: "6px"
//           }}>
//             <span style={{
//               fontWeight: "700",
//               color: appTheme.colors.primary,
//               fontSize: "0.95rem"
//             }}>
//               ₹{safeToFixed(discountPrice)}
//             </span>
//             {mrp > discountPrice && (
//               <>
//                 <span style={{
//                   fontSize: "0.75rem",
//                   color: appTheme.colors.textSecondary,
//                   textDecoration: "line-through"
//                 }}>
//                   ₹{safeToFixed(mrp)}
//                 </span>
//                 <span style={{
//                   backgroundColor: appTheme.colors.success + "20",
//                   color: appTheme.colors.success,
//                   padding: "2px 6px",
//                   borderRadius: "4px",
//                   fontSize: "0.65rem",
//                   fontWeight: "600"
//                 }}>
//                   {discountPercentage}% OFF
//                 </span>
//               </>
//             )}
//           </div>

//           {/* Stock and Flags */}
//           <div style={{ 
//             display: "flex", 
//             alignItems: "center", 
//             justifyContent: "space-between",
//             flexWrap: "wrap",
//             gap: "6px"
//           }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//               <span style={{
//                 color: stockStatus.color,
//                 fontWeight: "600",
//                 fontSize: "0.8rem",
//               }}>
//                 {stockStatus.label}: {stock}
//               </span>
//             </div>
            
//             <div style={{ display: "flex", gap: "4px" }}>
//               {product.isFeatured && (
//                 <span style={{
//                   backgroundColor: appTheme.colors.warning + "20",
//                   color: appTheme.colors.warning,
//                   padding: "2px 6px",
//                   borderRadius: "4px",
//                   fontSize: "0.65rem",
//                   fontWeight: "600",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "2px"
//                 }}>
//                   <FaStar size={8} /> Featured
//                 </span>
//               )}
//               {product.isOnSale && (
//                 <span style={{
//                   backgroundColor: appTheme.colors.success + "20",
//                   color: appTheme.colors.success,
//                   padding: "2px 6px",
//                   borderRadius: "4px",
//                   fontSize: "0.65rem",
//                   fontWeight: "600",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "2px"
//                 }}>
//                   <FaFire size={8} /> Sale
//                 </span>
//               )}
//             </div>
//           </div>

//           <button
//             onClick={() => setIsExpanded(!isExpanded)}
//             style={{
//               background: "none",
//               border: "none",
//               color: appTheme.colors.primary,
//               cursor: "pointer",
//               fontSize: "0.75rem",
//               padding: "4px 0",
//               display: "flex",
//               alignItems: "center",
//               gap: "4px",
//               fontWeight: "500",
//               marginTop: "4px"
//             }}
//           >
//             {isExpanded ? "Show Less" : "View Details"}
//           </button>
//         </div>
//       </div>

//       {/* Expanded Details */}
//       {isExpanded && (
//         <div style={{
//           marginTop: "12px",
//           paddingTop: "12px",
//           borderTop: `1px solid ${appTheme.colors.border}`,
//           animation: "slideDown 0.3s ease"
//         }}>
//           {/* Custom ID and MongoDB ID */}
//           <div style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(2, 1fr)",
//             gap: "8px",
//             marginBottom: "12px",
//             background: appTheme.colors.background,
//             padding: "10px",
//             borderRadius: "8px"
//           }}>
//             <div>
//               <div style={{
//                 fontSize: "0.65rem",
//                 color: appTheme.colors.textSecondary,
//                 marginBottom: "2px",
//                 textTransform: "uppercase"
//               }}>
//                 Product ID
//               </div>
//               <div style={{
//                 fontSize: "0.75rem",
//                 color: appTheme.colors.primary,
//                 fontWeight: "700",
//                 fontFamily: "monospace"
//               }}>
//                 {formatCustomId(customId)}
//               </div>
//             </div>
//             <div>
//               <div style={{
//                 fontSize: "0.65rem",
//                 color: appTheme.colors.textSecondary,
//                 marginBottom: "2px",
//                 textTransform: "uppercase"
//               }}>
//                 MongoDB ID
//               </div>
//               <div style={{
//                 fontSize: "0.7rem",
//                 color: appTheme.colors.textSecondary,
//                 fontFamily: "monospace",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis"
//               }}>
//                 {product._id?.slice(-8) || 'N/A'}
//               </div>
//             </div>
//           </div>

//           {/* SKU and HSN */}
//           <div style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(2, 1fr)",
//             gap: "8px",
//             marginBottom: "12px",
//             background: appTheme.colors.background,
//             padding: "10px",
//             borderRadius: "8px"
//           }}>
//             <div>
//               <div style={{
//                 fontSize: "0.65rem",
//                 color: appTheme.colors.textSecondary,
//                 marginBottom: "2px",
//                 textTransform: "uppercase"
//               }}>
//                 SKU
//               </div>
//               <div style={{
//                 fontSize: "0.75rem",
//                 color: appTheme.colors.textPrimary,
//                 fontWeight: "600",
//                 fontFamily: "monospace"
//               }}>
//                 {product.sku || "N/A"}
//               </div>
//             </div>
//             <div>
//               <div style={{
//                 fontSize: "0.65rem",
//                 color: appTheme.colors.textSecondary,
//                 marginBottom: "2px",
//                 textTransform: "uppercase"
//               }}>
//                 HSN Code
//               </div>
//               <div style={{
//                 fontSize: "0.75rem",
//                 color: appTheme.colors.textPrimary,
//                 fontWeight: "600",
//                 fontFamily: "monospace"
//               }}>
//                 {product.hsnCode || "N/A"}
//               </div>
//             </div>
//           </div>

//           {/* Description */}
//           {product.description && (
//             <div style={{ marginBottom: "12px" }}>
//               <div style={{
//                 fontSize: "0.7rem",
//                 color: appTheme.colors.textSecondary,
//                 fontWeight: "600",
//                 marginBottom: "4px"
//               }}>
//                 Description:
//               </div>
//               <div style={{
//                 fontSize: "0.75rem",
//                 color: appTheme.colors.textPrimary,
//                 lineHeight: 1.4,
//                 maxHeight: "60px",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 display: "-webkit-box",
//                 WebkitLineClamp: 3,
//                 WebkitBoxOrient: "vertical"
//               }}>
//                 {product.description}
//               </div>
//             </div>
//           )}

//           {/* Specifications */}
//           {product.specifications && Object.keys(product.specifications).length > 0 && (
//             <div style={{ marginBottom: "12px" }}>
//               <div style={{
//                 fontSize: "0.7rem",
//                 color: appTheme.colors.textSecondary,
//                 fontWeight: "600",
//                 marginBottom: "6px"
//               }}>
//                 Specifications:
//               </div>
//               <div style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(2, 1fr)",
//                 gap: "6px"
//               }}>
//                 {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
//                   <div key={key} style={{
//                     fontSize: "0.7rem",
//                     background: appTheme.colors.surface,
//                     padding: "4px 6px",
//                     borderRadius: "4px",
//                     border: `1px solid ${appTheme.colors.border}`
//                   }}>
//                     <span style={{ color: appTheme.colors.textSecondary }}>{key}:</span>{' '}
//                     <span style={{ color: appTheme.colors.textPrimary, fontWeight: "500" }}>{value}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* GST and Pricing Info */}
//           <div style={{
//             display: "flex",
//             gap: "8px",
//             flexWrap: "wrap",
//             marginBottom: "12px"
//           }}>
//             <span style={{
//               background: appTheme.colors.info + "15",
//               color: appTheme.colors.info,
//               padding: "4px 8px",
//               borderRadius: "6px",
//               fontSize: "0.7rem",
//               fontWeight: "500",
//               display: "flex",
//               alignItems: "center",
//               gap: "4px"
//             }}>
//               <FaPercent size={8} />
//               GST: {gstRate}%
//             </span>
//             {costPrice > 0 && (
//               <span style={{
//                 background: appTheme.colors.textSecondary + "15",
//                 color: appTheme.colors.textSecondary,
//                 padding: "4px 8px",
//                 borderRadius: "6px",
//                 fontSize: "0.7rem",
//                 fontWeight: "500"
//               }}>
//                 Cost: ₹{safeToFixed(costPrice)}
//               </span>
//             )}
//             {margin > 0 && (
//               <span style={{
//                 background: appTheme.colors.success + "15",
//                 color: appTheme.colors.success,
//                 padding: "4px 8px",
//                 borderRadius: "6px",
//                 fontSize: "0.7rem",
//                 fontWeight: "500"
//               }}>
//                 Margin: {safeToFixed(margin, 1)}%
//               </span>
//             )}
//           </div>

//           {/* Additional Info */}
//           <div style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(2, 1fr)",
//             gap: "8px",
//             marginBottom: "12px"
//           }}>
//             <div>
//               <div style={{
//                 fontSize: "0.65rem",
//                 color: appTheme.colors.textSecondary,
//                 marginBottom: "2px"
//               }}>
//                 Created:
//               </div>
//               <div style={{
//                 fontSize: "0.7rem",
//                 color: appTheme.colors.textPrimary,
//                 fontWeight: "500"
//               }}>
//                 {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', {
//                   day: 'numeric',
//                   month: 'short',
//                   year: 'numeric'
//                 }) : "N/A"}
//               </div>
//             </div>
//             <div>
//               <div style={{
//                 fontSize: "0.65rem",
//                 color: appTheme.colors.textSecondary,
//                 marginBottom: "2px"
//               }}>
//                 Last Updated:
//               </div>
//               <div style={{
//                 fontSize: "0.7rem",
//                 color: appTheme.colors.textPrimary,
//                 fontWeight: "500"
//               }}>
//                 {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-IN', {
//                   day: 'numeric',
//                   month: 'short'
//                 }) : "N/A"}
//               </div>
//             </div>
//           </div>

//           {/* Ratings */}
//           {averageRating > 0 && (
//             <div style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               marginBottom: "12px",
//               padding: "8px",
//               background: appTheme.colors.warning + "10",
//               borderRadius: "6px"
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <FaStar
//                     key={star}
//                     size={12}
//                     color={star <= averageRating ? appTheme.colors.warning : appTheme.colors.border}
//                   />
//                 ))}
//               </div>
//               <span style={{
//                 fontSize: "0.75rem",
//                 fontWeight: "600",
//                 color: appTheme.colors.warning
//               }}>
//                 {safeToFixed(averageRating, 1)}
//               </span>
//               <span style={{
//                 fontSize: "0.7rem",
//                 color: appTheme.colors.textSecondary
//               }}>
//                 ({product.totalReviews || 0} reviews)
//               </span>
//             </div>
//           )}

//           {/* Action Buttons */}
//           <div style={{
//             display: "flex",
//             gap: "6px",
//             flexWrap: "wrap"
//           }}>
//             <button
//               onClick={() => onEdit(product)}
//               style={{
//                 flex: 1,
//                 backgroundColor: appTheme.colors.primary + "15",
//                 color: appTheme.colors.primary,
//                 border: `1px solid ${appTheme.colors.primary}30`,
//                 padding: "8px 12px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "0.75rem",
//                 fontWeight: "600",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "4px",
//                 minHeight: "36px"
//               }}
//             >
//               <FaEdit size={11} />
//               Edit
//             </button>
            
//             <button
//               onClick={() => onToggleStatus(product)}
//               style={{
//                 flex: 1,
//                 backgroundColor: product.isActive ? appTheme.colors.warning + "15" : appTheme.colors.success + "15",
//                 color: product.isActive ? appTheme.colors.warning : appTheme.colors.success,
//                 border: `1px solid ${product.isActive ? appTheme.colors.warning + "30" : appTheme.colors.success + "30"}`,
//                 padding: "8px 12px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "0.75rem",
//                 fontWeight: "600",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "4px",
//                 minHeight: "36px"
//               }}
//             >
//               {product.isActive ? <FaToggleOff size={11} /> : <FaToggleOn size={11} />}
//               {product.isActive ? "Deactivate" : "Activate"}
//             </button>
            
//             <button
//               onClick={() => onDelete(product)}
//               style={{
//                 flex: 1,
//                 backgroundColor: appTheme.colors.error + "15",
//                 color: appTheme.colors.error,
//                 border: `1px solid ${appTheme.colors.error}30`,
//                 padding: "8px 12px",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "0.75rem",
//                 fontWeight: "600",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "4px",
//                 minHeight: "36px"
//               }}
//             >
//               <FaTrash size={11} />
//               Delete
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default function ProductTablePage() {
//   const router = useRouter();
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isMobile, setIsMobile] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [selectedSubCategory, setSelectedSubCategory] = useState("all");
//   const [selectedBrand, setSelectedBrand] = useState("all");
//   const [priceRange, setPriceRange] = useState({ min: "", max: "" });
//   const [showFilters, setShowFilters] = useState(false);
//   const [customIdFilter, setCustomIdFilter] = useState("");
  
//   // State for categories
//   const [categories, setCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [loadingCategories, setLoadingCategories] = useState(false);

//   // Detect mobile on mount and resize
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
    
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Fetch categories on mount
//   useEffect(() => {
//     fetchCategories();
//   }, []);
//   useEffect(() => {
//   console.log('Selected category ID:', selectedCategory);
//   console.log('URL params:', window.location.search);
// }, [selectedCategory]);

// // Also check what categories are loaded
// useEffect(() => {
//   console.log('Categories loaded:', categories);
// }, [categories]);

//   // Update subcategories when category changes
//   useEffect(() => {
//     if (selectedCategory && selectedCategory !== 'all') {
//       const cat = categories.find(c => c._id === selectedCategory);
//       setSubCategories(cat?.subcategories || []);
//       setSelectedSubCategory('all');
//     } else {
//       setSubCategories([]);
//       setSelectedSubCategory('all');
//     }
//   }, [selectedCategory, categories]);

//   // Fetch all categories
//   const fetchCategories = async () => {
//     setLoadingCategories(true);
//     try {
//       const res = await fetch('/api/masters?type=categories&format=tree');
//       const data = await res.json();
//       if (data.success) {
//         setCategories(data.data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch categories:', error);
//     } finally {
//       setLoadingCategories(false);
//     }
//   };

//   // Fetch all products
//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/products?isActive=all");
      
//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }
      
//       const data = await res.json();
      
//       if (data.success) {
//         // Add formatted ID to each product
//         const productsWithFormat = (data.data || []).map(product => ({
//           ...product,
//           formattedId: product.customId ? String(product.customId).padStart(5, '0') : null
//         }));
//         setProducts(productsWithFormat);
//         setFilteredProducts(productsWithFormat);
//       } else {
//         console.error("API Error:", data.message);
//         setProducts([]);
//         setFilteredProducts([]);
//       }
//     } catch (err) {
//       console.error("Error fetching products:", err);
//       setProducts([]);
//       setFilteredProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   // Get unique brands for filters
//   const brands = useMemo(() => {
//     const br = [...new Set(products.map(p => p.brand).filter(Boolean))];
//     return ["all", ...br];
//   }, [products]);

//   // Filter and search products with enhanced criteria
//   useEffect(() => {
//     let filtered = products;

//     // Apply status filter
//     switch (activeFilter) {
//       case "low":
//         filtered = filtered.filter(product => 
//           safeNumber(product.stock) <= (product.lowStockThreshold || 5) && 
//           safeNumber(product.stock) > 0 && 
//           product.isActive
//         );
//         break;
//       case "out":
//         filtered = filtered.filter(product => safeNumber(product.stock) === 0 && product.isActive);
//         break;
//       case "active":
//         filtered = filtered.filter(product => product.isActive === true);
//         break;
//       case "inactive":
//         filtered = filtered.filter(product => product.isActive === false);
//         break;
//       case "featured":
//         filtered = filtered.filter(product => product.isFeatured === true && product.isActive);
//         break;
//       case "sale":
//         filtered = filtered.filter(product => product.isOnSale === true && product.isActive);
//         break;
//       default:
//         break;
//     }

//     // Apply category filter using ID
//     if (selectedCategory !== "all") {
//       filtered = filtered.filter(product => 
//         product.category?._id === selectedCategory || 
//         product.category === selectedCategory
//       );
//     }

//     // Apply subcategory filter using ID
//     if (selectedSubCategory !== "all") {
//       filtered = filtered.filter(product => 
//         product.subCategory?._id === selectedSubCategory || 
//         product.subCategory === selectedSubCategory
//       );
//     }

//     // Apply brand filter
//     if (selectedBrand !== "all") {
//       filtered = filtered.filter(product => product.brand === selectedBrand);
//     }

//     // Apply price range filter
//     if (priceRange.min) {
//       const min = safeNumber(priceRange.min);
//       filtered = filtered.filter(product => safeNumber(product.discountPrice) >= min);
//     }
//     if (priceRange.max) {
//       const max = safeNumber(priceRange.max);
//       filtered = filtered.filter(product => safeNumber(product.discountPrice) <= max);
//     }

//     // Apply custom ID filter
//     if (customIdFilter.trim()) {
//       const idNum = parseInt(customIdFilter, 10);
//       if (!isNaN(idNum)) {
//         filtered = filtered.filter(product => product.customId === idNum);
//       } else {
//         // Search by formatted ID string
//         const paddedId = customIdFilter.padStart(5, '0');
//         filtered = filtered.filter(product => 
//           product.formattedId === paddedId
//         );
//       }
//     }

//     // Apply search
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase().trim();
//       filtered = filtered.filter(product => {
//         const categoryName = getCategoryName(product.category).toLowerCase();
//         const subCategoryName = getSubCategoryName(product.subCategory)?.toLowerCase() || '';
        
//         return (
//           product.productName?.toLowerCase().includes(term) ||
//           product.sku?.toLowerCase().includes(term) ||
//           product.hsnCode?.toLowerCase().includes(term) ||
//           categoryName.includes(term) ||
//           subCategoryName.includes(term) ||
//           product.brand?.toLowerCase().includes(term) ||
//           product.description?.toLowerCase().includes(term) ||
//           product.formattedId?.includes(term) ||
//           String(product.customId).includes(term)
//         );
//       });
//     }

//     setFilteredProducts(filtered);
//   }, [activeFilter, searchTerm, products, selectedCategory, selectedSubCategory, selectedBrand, priceRange, customIdFilter]);

//   // Edit handler - using MongoDB _id for navigation
//   const handleEdit = (product) => {
//     router.push(`/admin/products/productForm?id=${product._id}`);
//   };

//   // Delete handler
//   const handleDelete = async (product) => {
//     if (!confirm(`Are you sure you want to delete "${product.productName}" (ID: ${product.formattedId})? This action cannot be undone.`)) return;

//     try {
//       const res = await fetch(`/api/products?id=${product._id}`, {
//         method: "DELETE",
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         alert(`"${product.productName}" has been deleted successfully.`);
//         fetchProducts();
//       } else {
//         alert(`Failed to delete product: ${data.message}`);
//       }
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert("Failed to delete product. Please try again.");
//     }
//   };

//   // Toggle product status
//   const handleToggleStatus = async (product) => {
//     const newStatus = !product.isActive;
//     const action = newStatus ? "activate" : "deactivate";
    
//     if (!confirm(`Are you sure you want to ${action} "${product.productName}"?`)) return;

//     try {
//       const res = await fetch("/api/products", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           _id: product._id,
//           isActive: newStatus
//         }),
//       });
      
//       const data = await res.json();
      
//       if (data.success) {
//         alert(`Product ${action}d successfully.`);
//         fetchProducts();
//       } else {
//         alert(`Failed to ${action} product: ${data.message}`);
//       }
//     } catch (err) {
//       console.error("Toggle status error:", err);
//       alert(`Failed to ${action} product. Please try again.`);
//     }
//   };

//   // Calculate comprehensive statistics
//   const statistics = useMemo(() => {
//     const stats = {
//       total: products.length,
//       active: products.filter(p => p.isActive).length,
//       inactive: products.filter(p => !p.isActive).length,
//       lowStock: products.filter(p => {
//         const stock = safeNumber(p.stock);
//         return stock <= (p.lowStockThreshold || 5) && stock > 0 && p.isActive;
//       }).length,
//       outOfStock: products.filter(p => safeNumber(p.stock) === 0 && p.isActive).length,
//       featured: products.filter(p => p.isFeatured && p.isActive).length,
//       onSale: products.filter(p => p.isOnSale && p.isActive).length,
//       totalValue: products.reduce((sum, p) => {
//         return sum + (safeNumber(p.discountPrice) * safeNumber(p.stock));
//       }, 0),
//       totalMRP: products.reduce((sum, p) => {
//         return sum + (safeNumber(p.mrp) * safeNumber(p.stock));
//       }, 0),
//       potentialSavings: products.reduce((sum, p) => {
//         return sum + ((safeNumber(p.mrp) - safeNumber(p.discountPrice)) * safeNumber(p.stock));
//       }, 0),
//       avgRating: (() => {
//         const ratings = products.filter(p => safeNumber(p.averageRating) > 0);
//         if (ratings.length === 0) return 0;
//         return ratings.reduce((sum, p) => sum + safeNumber(p.averageRating), 0) / ratings.length;
//       })(),
//       minCustomId: products.length > 0 ? Math.min(...products.map(p => p.customId).filter(Boolean)) : 100,
//       maxCustomId: products.length > 0 ? Math.max(...products.map(p => p.customId).filter(Boolean)) : 100
//     };
//     return stats;
//   }, [products]);

//   // Reset all filters
//   const resetFilters = () => {
//     setActiveFilter("all");
//     setSelectedCategory("all");
//     setSelectedSubCategory("all");
//     setSelectedBrand("all");
//     setPriceRange({ min: "", max: "" });
//     setCustomIdFilter("");
//     setSearchTerm("");
//   };

//   // Columns for desktop table with proper category display
//   const columns = [
//     { 
//       header: "ID", 
//       accessor: "customId",
//       cell: (value, row) => (
//         <div style={{ 
//           display: "flex", 
//           flexDirection: "column",
//           alignItems: "center",
//           gap: "2px"
//         }}>
//           <span style={{
//             backgroundColor: appTheme.colors.primary + "15",
//             color: appTheme.colors.primary,
//             padding: "4px 8px",
//             borderRadius: "12px",
//             fontSize: "0.8rem",
//             fontWeight: "700",
//             fontFamily: "monospace"
//           }}>
//             {row.formattedId || formatCustomId(value)}
//           </span>
//           <span style={{
//             fontSize: "0.6rem",
//             color: appTheme.colors.textSecondary
//           }}>
//             {row._id?.slice(-6)}
//           </span>
//         </div>
//       )
//     },
//     { 
//       header: "Product Info", 
//       accessor: "productName",
//       cell: (value, row) => (
//         <div style={{ 
//           display: "flex", 
//           alignItems: "center", 
//           gap: "12px",
//           minWidth: "250px"
//         }}>
//           {row.imageUrls?.[0] && (
//             <img 
//               src={row.imageUrls[0]} 
//               alt={value}
//               style={{
//                 width: "48px",
//                 height: "48px",
//                 borderRadius: "6px",
//                 objectFit: "cover",
//                 border: `1px solid ${appTheme.colors.border}`,
//                 flexShrink: 0
//               }}
//               onError={(e) => {
//                 e.target.style.display = 'none';
//               }}
//             />
//           )}
//           <div style={{ minWidth: 0 }}>
//             <div style={{ 
//               fontWeight: "600", 
//               fontSize: "0.9rem", 
//               marginBottom: "2px",
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis"
//             }}>
//               {value}
//             </div>
//             <div style={{ 
//               display: "flex",
//               gap: "4px",
//               alignItems: "center",
//               flexWrap: "wrap"
//             }}>
//               <span style={{ 
//                 fontSize: "0.7rem", 
//                 color: appTheme.colors.textSecondary,
//                 background: appTheme.colors.background,
//                 padding: "2px 4px",
//                 borderRadius: "4px"
//               }}>
//                 SKU: {row.sku || "N/A"}
//               </span>
//               {row.brand && (
//                 <span style={{ 
//                   fontSize: "0.7rem", 
//                   color: appTheme.colors.secondary,
//                   background: appTheme.colors.secondary + "10",
//                   padding: "2px 4px",
//                   borderRadius: "4px"
//                 }}>
//                   {row.brand}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       )
//     },
//     { 
//       header: "Category", 
//       accessor: "category",
//       cell: (value, row) => {
//         const categoryName = getCategoryName(row.category);
//         const subCategoryName = getSubCategoryName(row.subCategory);
//         const displayText = subCategoryName ? `${categoryName} → ${subCategoryName}` : categoryName;
        
//         return (
//           <span style={{
//             backgroundColor: appTheme.colors.primary + "15",
//             color: appTheme.colors.primary,
//             padding: "4px 10px",
//             borderRadius: "12px",
//             fontSize: "0.75rem",
//             fontWeight: "500",
//             border: `1px solid ${appTheme.colors.primary}20`,
//             display: "inline-block",
//             whiteSpace: "nowrap",
//           }}>
//             {displayText}
//           </span>
//         );
//       }
//     },
//     { 
//       header: "Pricing", 
//       accessor: "discountPrice",
//       cell: (value, row) => {
//         const mrp = safeNumber(row.mrp);
//         const discountPrice = safeNumber(value);
//         const discount = mrp > discountPrice ? Math.round(((mrp - discountPrice) / mrp) * 100) : 0;
        
//         return (
//           <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
//             <span style={{ 
//               fontWeight: "700", 
//               color: appTheme.colors.primary,
//               fontSize: "0.9rem",
//             }}>
//               ₹{safeToFixed(discountPrice)}
//             </span>
//             {mrp > discountPrice && (
//               <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//                 <span style={{ 
//                   fontSize: "0.7rem", 
//                   color: appTheme.colors.textSecondary,
//                   textDecoration: "line-through"
//                 }}>
//                   ₹{safeToFixed(mrp)}
//                 </span>
//                 <span style={{
//                   backgroundColor: appTheme.colors.success + "20",
//                   color: appTheme.colors.success,
//                   padding: "2px 4px",
//                   borderRadius: "4px",
//                   fontSize: "0.6rem",
//                   fontWeight: "600"
//                 }}>
//                   {discount}% OFF
//                 </span>
//               </div>
//             )}
//           </div>
//         );
//       }
//     },
//     { 
//       header: "Stock", 
//       accessor: "stock",
//       cell: (value, row) => {
//         const stock = safeNumber(value);
//         const threshold = row.lowStockThreshold || 5;
//         const stockStatus = stock === 0 ? "out" : stock <= threshold ? "low" : "good";
        
//         return (
//           <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
//             <span style={{
//               color: stockStatus === "good" ? appTheme.colors.success : 
//                      stockStatus === "low" ? appTheme.colors.warning : 
//                      appTheme.colors.error,
//               fontWeight: "600",
//               fontSize: "0.9rem",
//             }}>
//               {stock} units
//             </span>
//             {stockStatus === "low" && (
//               <span style={{
//                 fontSize: "0.65rem",
//                 color: appTheme.colors.warning,
//                 fontWeight: "500"
//               }}>
//                 Below threshold
//               </span>
//             )}
//           </div>
//         );
//       }
//     },
//     { 
//       header: "GST", 
//       accessor: "gstRate",
//       cell: (value) => {
//         const gst = safeNumber(value);
//         return (
//           <span style={{
//             backgroundColor: appTheme.colors.info + "15",
//             color: appTheme.colors.info,
//             padding: "4px 8px",
//             borderRadius: "8px",
//             fontSize: "0.7rem",
//             fontWeight: "600",
//             border: `1px solid ${appTheme.colors.info}20`,
//             whiteSpace: "nowrap"
//           }}>
//             {gst}%
//           </span>
//         );
//       }
//     },
//     { 
//       header: "Flags", 
//       accessor: "isFeatured",
//       cell: (value, row) => (
//         <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
//           {row.isFeatured && (
//             <span style={{
//               backgroundColor: appTheme.colors.warning + "20",
//               color: appTheme.colors.warning,
//               padding: "2px 6px",
//               borderRadius: "4px",
//               fontSize: "0.65rem",
//               fontWeight: "600",
//               display: "flex",
//               alignItems: "center",
//               gap: "2px"
//             }}>
//               <FaStar size={8} /> Featured
//             </span>
//           )}
//           {row.isOnSale && (
//             <span style={{
//               backgroundColor: appTheme.colors.success + "20",
//               color: appTheme.colors.success,
//               padding: "2px 6px",
//               borderRadius: "4px",
//               fontSize: "0.65rem",
//               fontWeight: "600",
//               display: "flex",
//               alignItems: "center",
//               gap: "2px"
//             }}>
//               <FaFire size={8} /> Sale
//             </span>
//           )}
//           {row.isNewArrival && (
//             <span style={{
//               backgroundColor: appTheme.colors.info + "20",
//               color: appTheme.colors.info,
//               padding: "2px 6px",
//               borderRadius: "4px",
//               fontSize: "0.65rem",
//               fontWeight: "600"
//             }}>
//               New
//             </span>
//           )}
//           {row.isBestSeller && (
//             <span style={{
//               backgroundColor: appTheme.colors.secondary + "20",
//               color: appTheme.colors.secondary,
//               padding: "2px 6px",
//               borderRadius: "4px",
//               fontSize: "0.65rem",
//               fontWeight: "600"
//             }}>
//               Bestseller
//             </span>
//           )}
//         </div>
//       )
//     },
//     { 
//       header: "Rating", 
//       accessor: "averageRating",
//       cell: (value, row) => {
//         const rating = safeNumber(value);
//         const reviews = row.totalReviews || 0;
        
//         return rating > 0 ? (
//           <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
//             <span style={{ fontWeight: "600", fontSize: "0.8rem" }}>{safeToFixed(rating, 1)}</span>
//             <div style={{ display: "flex", gap: "1px" }}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <FaStar
//                   key={star}
//                   size={8}
//                   color={star <= rating ? appTheme.colors.warning : appTheme.colors.border}
//                 />
//               ))}
//             </div>
//             <span style={{ fontSize: "0.65rem", color: appTheme.colors.textSecondary }}>
//               ({reviews})
//             </span>
//           </div>
//         ) : (
//           <span style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>No ratings</span>
//         );
//       }
//     },
//     { 
//       header: "Status", 
//       accessor: "isActive",
//       cell: (value) => (
//         <span style={{
//           padding: "6px 12px",
//           borderRadius: "12px",
//           fontSize: "0.7rem",
//           fontWeight: "600",
//           backgroundColor: value ? appTheme.colors.success + "20" : appTheme.colors.textSecondary + "20",
//           color: value ? appTheme.colors.success : appTheme.colors.textSecondary,
//           border: `1px solid ${value ? appTheme.colors.success + "40" : appTheme.colors.textSecondary + "40"}`,
//           whiteSpace: "nowrap",
//           display: "inline-block"
//         }}>
//           {value ? "🟢 Active" : "⚫ Inactive"}
//         </span>
//       )
//     },
//   ];

//   return (
//     <div
//       style={{
//         backgroundColor: appTheme.colors.background,
//         minHeight: "100vh",
//         padding: isMobile ? "12px" : "24px",
//         fontFamily: appTheme.fonts.primary,
//         color: appTheme.colors.textPrimary,
//         maxWidth: "100%",
//         overflowX: "hidden",
//         boxSizing: "border-box"
//       }}
//     >
//       {/* Header Section */}
//       <div
//         style={{
//           display: "flex",
//           flexDirection: isMobile ? "column" : "row",
//           justifyContent: "space-between",
//           alignItems: isMobile ? "stretch" : "center",
//           marginBottom: isMobile ? "16px" : "24px",
//           gap: isMobile ? "12px" : "16px",
//           width: "100%"
//         }}
//       >
//         <div style={{ flex: 1 }}>
//           <h1
//             style={{
//               color: appTheme.colors.primary,
//               fontSize: isMobile ? "1.3rem" : "1.8rem",
//               fontWeight: "700",
//               marginBottom: "4px",
//               lineHeight: 1.2
//             }}
//           >
//             Products Management
//           </h1>
//           <p style={{
//             color: appTheme.colors.textSecondary,
//             fontSize: isMobile ? "0.8rem" : "0.875rem",
//             margin: 0
//           }}>
//             Manage your product catalog, inventory, and pricing
//           </p>
//         </div>
        
//         <div style={{
//           display: "flex",
//           gap: "8px",
//           flexWrap: isMobile ? "wrap" : "nowrap",
//         }}>
//           <button
//             onClick={() => setShowFilters(!showFilters)}
//             style={{
//               backgroundColor: showFilters ? appTheme.colors.primary + "30" : appTheme.colors.surface,
//               color: showFilters ? appTheme.colors.primary : appTheme.colors.textSecondary,
//               border: `1px solid ${appTheme.colors.border}`,
//               padding: isMobile ? "10px 16px" : "12px 20px",
//               borderRadius: "10px",
//               cursor: "pointer",
//               fontWeight: "600",
//               fontSize: isMobile ? "0.85rem" : "0.875rem",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "6px",
//               minHeight: "44px"
//             }}
//           >
//             <FaSearch size={isMobile ? 14 : 16} />
//             {isMobile ? "Filters" : "Advanced Filters"}
//           </button>
          
//           <Link 
//             href="/admin/products/productForm" 
//             style={{ 
//               textDecoration: "none",
//               display: "block"
//             }}
//           >
//             <button
//               style={{
//                 backgroundColor: appTheme.colors.primary,
//                 color: "#fff",
//                 padding: isMobile ? "10px 16px" : "12px 20px",
//                 border: "none",
//                 borderRadius: "10px",
//                 cursor: "pointer",
//                 fontWeight: "600",
//                 fontSize: isMobile ? "0.85rem" : "0.875rem",
//                 boxShadow: `0 4px 12px ${appTheme.colors.primary}30`,
//                 transition: "all 0.2s ease",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "6px",
//                 minHeight: "44px",
//                 whiteSpace: "nowrap"
//               }}
//             >
//               <FaPlus size={isMobile ? 14 : 16} />
//               {isMobile ? "Add" : "Add New Product"}
//             </button>
//           </Link>
//         </div>
//       </div>

//       {/* Advanced Filters Section */}
//       {showFilters && (
//         <div style={{
//           backgroundColor: appTheme.colors.surface,
//           padding: isMobile ? "16px" : "20px",
//           borderRadius: "12px",
//           marginBottom: "20px",
//           border: `1px solid ${appTheme.colors.border}`,
//           boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
//         }}>
//           <div style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "16px"
//           }}>
//             <h3 style={{
//               fontSize: "1rem",
//               fontWeight: "600",
//               color: appTheme.colors.textPrimary,
//               margin: 0
//             }}>
//               Filter Products
//             </h3>
//             <button
//               onClick={resetFilters}
//               style={{
//                 background: "none",
//                 border: "none",
//                 color: appTheme.colors.primary,
//                 cursor: "pointer",
//                 fontSize: "0.8rem",
//                 fontWeight: "500",
//                 padding: "4px 8px"
//               }}
//             >
//               Reset All
//             </button>
//           </div>

//           <div style={{
//             display: "grid",
//             gridTemplateColumns: isMobile ? "1fr" : "repeat(6, 1fr)",
//             gap: "12px"
//           }}>
//             {/* Category Filter with Hierarchy */}
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               style={{
//                 padding: "10px",
//                 border: `1px solid ${appTheme.colors.border}`,
//                 borderRadius: "8px",
//                 fontSize: "0.85rem",
//                 backgroundColor: appTheme.colors.background,
//                 color: appTheme.colors.textPrimary,
//                 cursor: "pointer",
//                 minHeight: "44px"
//               }}
//               disabled={loadingCategories}
//             >
//               <option value="all">All Categories</option>
//               {categories.map(cat => (
//                 <optgroup key={cat._id} label={cat.name}>
//                   <option value={cat._id}>{cat.name}</option>
//                   {cat.subcategories?.map(sub => (
//                     <option key={sub._id} value={sub._id}>
//                       &nbsp;&nbsp;↳ {sub.name}
//                     </option>
//                   ))}
//                 </optgroup>
//               ))}
//             </select>

//             {/* SubCategory Filter */}
//             <select
//               value={selectedSubCategory}
//               onChange={(e) => setSelectedSubCategory(e.target.value)}
//               style={{
//                 padding: "10px",
//                 border: `1px solid ${appTheme.colors.border}`,
//                 borderRadius: "8px",
//                 fontSize: "0.85rem",
//                 backgroundColor: appTheme.colors.background,
//                 color: appTheme.colors.textPrimary,
//                 cursor: "pointer",
//                 minHeight: "44px"
//               }}
//               disabled={!selectedCategory || selectedCategory === 'all' || subCategories.length === 0}
//             >
//               <option value="all">All SubCategories</option>
//               {subCategories.map(sub => (
//                 <option key={sub._id} value={sub._id}>
//                   {sub.name}
//                 </option>
//               ))}
//             </select>

//             {/* Brand Filter */}
//             <select
//               value={selectedBrand}
//               onChange={(e) => setSelectedBrand(e.target.value)}
//               style={{
//                 padding: "10px",
//                 border: `1px solid ${appTheme.colors.border}`,
//                 borderRadius: "8px",
//                 fontSize: "0.85rem",
//                 backgroundColor: appTheme.colors.background,
//                 color: appTheme.colors.textPrimary,
//                 cursor: "pointer",
//                 minHeight: "44px"
//               }}
//             >
//               <option value="all">All Brands</option>
//               {brands.filter(b => b !== "all").map(brand => (
//                 <option key={brand} value={brand}>{brand}</option>
//               ))}
//             </select>

//             {/* Price Range */}
//             <div style={{ display: "flex", gap: "8px" }}>
//               <input
//                 type="number"
//                 placeholder="Min Price"
//                 value={priceRange.min}
//                 onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
//                 style={{
//                   width: "50%",
//                   padding: "10px",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   fontSize: "0.85rem",
//                   backgroundColor: appTheme.colors.background,
//                   color: appTheme.colors.textPrimary,
//                   minHeight: "44px"
//                 }}
//               />
//               <input
//                 type="number"
//                 placeholder="Max Price"
//                 value={priceRange.max}
//                 onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
//                 style={{
//                   width: "50%",
//                   padding: "10px",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   fontSize: "0.85rem",
//                   backgroundColor: appTheme.colors.background,
//                   color: appTheme.colors.textPrimary,
//                   minHeight: "44px"
//                 }}
//               />
//             </div>

//             {/* Custom ID Filter */}
//             <input
//               type="text"
//               placeholder="Product ID (00123)"
//               value={customIdFilter}
//               onChange={(e) => setCustomIdFilter(e.target.value)}
//               style={{
//                 padding: "10px",
//                 border: `1px solid ${appTheme.colors.border}`,
//                 borderRadius: "8px",
//                 fontSize: "0.85rem",
//                 backgroundColor: appTheme.colors.background,
//                 color: appTheme.colors.textPrimary,
//                 minHeight: "44px"
//               }}
//             />

//             <div style={{
//               fontSize: "0.8rem",
//               color: appTheme.colors.textSecondary,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               background: appTheme.colors.background,
//               padding: "10px",
//               borderRadius: "8px",
//               border: `1px solid ${appTheme.colors.border}`
//             }}>
//               {filteredProducts.length} products found
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Search Bar */}
//       <div style={{ 
//         marginBottom: isMobile ? "16px" : "24px",
//         position: "relative",
//         width: "100%"
//       }}>
//         <div style={{ position: "relative", width: "100%" }}>
//           <input
//             type="text"
//             placeholder={isMobile ? "Search products..." : "Search by name, ID, SKU, HSN, category, brand, or description..."}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{
//               width: "100%",
//               padding: isMobile ? "10px 14px 10px 40px" : "12px 16px 12px 44px",
//               border: `1px solid ${appTheme.colors.border}`,
//               borderRadius: "10px",
//               fontSize: isMobile ? "0.9rem" : "0.95rem",
//               backgroundColor: appTheme.colors.surface,
//               color: appTheme.colors.textPrimary,
//               outline: "none",
//               minHeight: "44px",
//               boxSizing: "border-box"
//             }}
//           />
//           <FaSearch 
//             size={16}
//             style={{
//               position: "absolute",
//               left: "14px",
//               top: "50%",
//               transform: "translateY(-50%)",
//               color: appTheme.colors.textSecondary
//             }}
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm("")}
//               style={{
//                 position: "absolute",
//                 right: "14px",
//                 top: "50%",
//                 transform: "translateY(-50%)",
//                 background: "none",
//                 border: "none",
//                 color: appTheme.colors.textSecondary,
//                 cursor: "pointer",
//                 padding: "4px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center"
//               }}
//             >
//               <FaTimes size={14} />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Enhanced Statistics */}
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
//           gap: isMobile ? "10px" : "16px",
//           marginBottom: isMobile ? "16px" : "24px",
//           width: "100%"
//         }}
//       >
//         <StatCard
//           label="All Products"
//           value={statistics.total}
//           filter="all"
//           active={activeFilter === "all"}
//           onClick={() => setActiveFilter("all")}
//           color={appTheme.colors.primary}
//           icon="📦"
//           isMobile={isMobile}
//         />
//         <StatCard
//           label="Active"
//           value={statistics.active}
//           filter="active"
//           active={activeFilter === "active"}
//           onClick={() => setActiveFilter("active")}
//           color={appTheme.colors.success}
//           icon="✅"
//           isMobile={isMobile}
//         />
//         <StatCard
//           label="Low Stock"
//           value={statistics.lowStock}
//           filter="low"
//           active={activeFilter === "low"}
//           onClick={() => setActiveFilter("low")}
//           color={appTheme.colors.warning}
//           icon="⚠️"
//           isMobile={isMobile}
//         />
//         <StatCard
//           label="Out of Stock"
//           value={statistics.outOfStock}
//           filter="out"
//           active={activeFilter === "out"}
//           onClick={() => setActiveFilter("out")}
//           color={appTheme.colors.error}
//           icon="🚫"
//           isMobile={isMobile}
//         />
//       </div>

//       {/* Secondary Statistics */}
//       {!isMobile && (
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(5, 1fr)",
//             gap: "16px",
//             marginBottom: "24px"
//           }}
//         >
//           <MetricCard
//             label="Inventory Value"
//             value={`₹${safeToFixed(statistics.totalValue)}`}
//             icon={<FaChartLine />}
//             color={appTheme.colors.info}
//           />
//           <MetricCard
//             label="Featured Products"
//             value={statistics.featured}
//             icon={<FaStar />}
//             color={appTheme.colors.warning}
//           />
//           <MetricCard
//             label="On Sale"
//             value={statistics.onSale}
//             icon={<FaFire />}
//             color={appTheme.colors.success}
//           />
//           <MetricCard
//             label="Avg Rating"
//             value={safeToFixed(statistics.avgRating, 1)}
//             icon="⭐"
//             color={appTheme.colors.secondary}
//           />
//           <MetricCard
//             label="ID Range"
//             value={`${statistics.minCustomId} - ${statistics.maxCustomId}`}
//             icon={<FaHashtag />}
//             color={appTheme.colors.primary}
//           />
//         </div>
//       )}

//       {/* Active Filter Info */}
//       {activeFilter !== "all" && (
//         <div style={{ 
//           backgroundColor: appTheme.colors.surface, 
//           padding: "12px 16px", 
//           borderRadius: "10px", 
//           marginBottom: "16px", 
//           border: `1px solid ${appTheme.colors.border}`, 
//           display: "flex", 
//           flexDirection: isMobile ? "column" : "row",
//           justifyContent: "space-between", 
//           alignItems: isMobile ? "stretch" : "center",
//           gap: isMobile ? "10px" : "0",
//           width: "100%"
//         }}>
//           <div style={{ 
//             display: "flex", 
//             alignItems: "center", 
//             gap: isMobile ? "6px" : "8px",
//             flexWrap: "wrap" 
//           }}>
//             <span style={{ 
//               fontSize: isMobile ? "0.9rem" : "1rem", 
//               fontWeight: "600", 
//               color: appTheme.colors.textPrimary 
//             }}>
//               {activeFilter === "active" ? "Active Products" :
//                activeFilter === "low" ? "Low Stock Products" :
//                activeFilter === "out" ? "Out of Stock Products" :
//                activeFilter === "featured" ? "Featured Products" :
//                "Inactive Products"}
//             </span>
//             <span style={{ 
//               fontSize: "0.75rem", 
//               color: appTheme.colors.textSecondary,
//               backgroundColor: appTheme.colors.background,
//               padding: "4px 8px",
//               borderRadius: "6px",
//               fontWeight: "500",
//               whiteSpace: "nowrap"
//             }}>
//               {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
//             </span>
//           </div>
//           <button
//             onClick={() => setActiveFilter("all")}
//             style={{
//               backgroundColor: "transparent",
//               color: appTheme.colors.primary,
//               border: `1px solid ${appTheme.colors.primary}`,
//               padding: "6px 12px",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "0.8rem",
//               fontWeight: "500",
//               transition: "all 0.2s ease",
//               whiteSpace: "nowrap",
//               minHeight: "36px",
//               width: isMobile ? "100%" : "auto"
//             }}
//           >
//             {isMobile ? "Show All" : "Show All Products"}
//           </button>
//         </div>
//       )}

//       {/* Products Content */}
//       <div style={{ 
//         backgroundColor: appTheme.colors.surface, 
//         padding: isMobile ? "8px" : "24px", 
//         borderRadius: "12px", 
//         boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
//         border: `1px solid ${appTheme.colors.border}`,
//         width: "100%",
//         boxSizing: "border-box"
//       }}>
//         {loading ? (
//           <div style={{ 
//             display: "flex", 
//             flexDirection: "column",
//             justifyContent: "center", 
//             alignItems: "center", 
//             padding: "60px 20px",
//             textAlign: "center"
//           }}>
//             <div style={{ 
//               width: "50px", 
//               height: "50px", 
//               border: `3px solid ${appTheme.colors.border}`,
//               borderTop: `3px solid ${appTheme.colors.primary}`,
//               borderRadius: "50%",
//               marginBottom: "16px",
//               animation: "spin 1s linear infinite"
//             }} />
//             <div style={{ 
//               fontWeight: "600",
//               fontSize: isMobile ? "0.9rem" : "1rem",
//               color: appTheme.colors.textPrimary,
//               marginBottom: "4px"
//             }}>
//               Loading products...
//             </div>
//           </div>
//         ) : filteredProducts.length === 0 ? (
//           <div style={{ 
//             display: "flex", 
//             flexDirection: "column",
//             justifyContent: "center", 
//             alignItems: "center", 
//             padding: "60px 20px",
//             textAlign: "center"
//           }}>
//             <div style={{ 
//               fontSize: isMobile ? "3rem" : "4rem", 
//               marginBottom: isMobile ? "16px" : "20px",
//               color: appTheme.colors.border
//             }}>📦</div>
//             <div style={{ 
//               fontWeight: "600", 
//               fontSize: isMobile ? "1rem" : "1.1rem", 
//               marginBottom: "8px",
//               color: appTheme.colors.textPrimary
//             }}>
//               {searchTerm || activeFilter !== "all" || selectedCategory !== "all" || selectedSubCategory !== "all" || selectedBrand !== "all" || priceRange.min || priceRange.max || customIdFilter
//                 ? "No products match your filters"
//                 : "No products available"}
//             </div>
//             <div style={{ 
//               fontSize: isMobile ? "0.85rem" : "0.9rem", 
//               marginBottom: isMobile ? "16px" : "20px",
//               maxWidth: "400px",
//               lineHeight: 1.5,
//               color: appTheme.colors.textSecondary
//             }}>
//               {searchTerm || activeFilter !== "all" || selectedCategory !== "all" || selectedSubCategory !== "all" || selectedBrand !== "all" || priceRange.min || priceRange.max || customIdFilter
//                 ? "Try adjusting your filters or search term"
//                 : "Get started by adding your first product"}
//             </div>
//             <button
//               onClick={resetFilters}
//               style={{
//                 backgroundColor: appTheme.colors.primary,
//                 color: "#fff",
//                 padding: isMobile ? "10px 20px" : "12px 24px",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontWeight: "600",
//                 fontSize: isMobile ? "0.85rem" : "0.875rem",
//                 minHeight: "44px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "8px"
//               }}
//             >
//               <FaTimes size={14} />
//               Clear All Filters
//             </button>
//           </div>
//         ) : isMobile ? (
//           // Mobile Card View
//           <div>
//             <h3 style={{
//               fontSize: "1rem",
//               fontWeight: "600",
//               color: appTheme.colors.textPrimary,
//               marginBottom: "16px",
//               paddingBottom: "12px",
//               borderBottom: `1px solid ${appTheme.colors.border}`,
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center"
//             }}>
//               <span>Products ({filteredProducts.length})</span>
//               <span style={{
//                 fontSize: "0.7rem",
//                 color: appTheme.colors.textSecondary,
//                 backgroundColor: appTheme.colors.background,
//                 padding: "4px 8px",
//                 borderRadius: "6px"
//               }}>
//                 {activeFilter !== "all" ? activeFilter : "all"}
//               </span>
//             </h3>
//             <div>
//               {filteredProducts.map((product) => (
//                 <MobileProductCard
//                   key={product._id}
//                   product={product}
//                   onEdit={handleEdit}
//                   onDelete={handleDelete}
//                   onToggleStatus={handleToggleStatus}
//                   appTheme={appTheme}
//                 />
//               ))}
//             </div>
//           </div>
//         ) : (
//           // Desktop Table View
//           <div style={{ width: "100%", overflowX: "auto" }}>
//             <div style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: "20px",
//               flexWrap: "wrap",
//               gap: "8px"
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                 <h3 style={{
//                   fontSize: "1.2rem",
//                   fontWeight: "600",
//                   color: appTheme.colors.textPrimary,
//                   margin: 0
//                 }}>
//                   Product Inventory
//                 </h3>
//                 {activeFilter !== "all" && (
//                   <span style={{
//                     backgroundColor: appTheme.colors.primary + "15",
//                     color: appTheme.colors.primary,
//                     padding: "4px 10px",
//                     borderRadius: "20px",
//                     fontSize: "0.7rem",
//                     fontWeight: "600"
//                   }}>
//                     {activeFilter === "active" ? "Active" :
//                      activeFilter === "low" ? "Low Stock" :
//                      activeFilter === "out" ? "Out of Stock" :
//                      activeFilter === "featured" ? "Featured" :
//                      activeFilter === "sale" ? "On Sale" :
//                      "Inactive"}
//                   </span>
//                 )}
//               </div>
//               <div style={{
//                 fontSize: "0.8rem",
//                 color: appTheme.colors.textSecondary,
//                 backgroundColor: appTheme.colors.background,
//                 padding: "4px 12px",
//                 borderRadius: "8px",
//                 fontWeight: "500"
//               }}>
//                 Showing {filteredProducts.length} of {products.length} products
//               </div>
//             </div>
//             <DataTable
//               title=""
//               columns={columns}
//               data={filteredProducts}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               onToggleStatus={handleToggleStatus}
//               loading={loading}
//               searchable={false}
//               pagination={true}
//               exportable={true}
//               itemsPerPage={10}
//               isMobile={false}
//             />
//           </div>
//         )}
//       </div>

//       {/* Global Styles */}
//       <style jsx global>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         @keyframes slideDown {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
        
//         @media (max-width: 767px) {
//           body {
//             overflow-x: hidden;
//           }
          
//           * {
//             box-sizing: border-box;
//           }
          
//           input, select, button {
//             font-size: 16px !important;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// // Stat Card Component
// const StatCard = ({ label, value, filter, active, onClick, color, icon, isMobile }) => (
//   <div
//     onClick={onClick}
//     style={{
//       backgroundColor: active ? color + "15" : appTheme.colors.surface,
//       padding: isMobile ? "14px 8px" : "16px",
//       borderRadius: "10px",
//       boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
//       border: `2px solid ${active ? color : appTheme.colors.border}`,
//       textAlign: "center",
//       cursor: "pointer",
//       minHeight: isMobile ? "60px" : "70px",
//       display: "flex",
//       flexDirection: "column",
//       justifyContent: "center",
//       alignItems: "center",
//       transition: "all 0.2s ease"
//     }}
//   >
//     <div style={{ 
//       fontSize: isMobile ? "1.2rem" : "1.4rem", 
//       fontWeight: "700", 
//       color: active ? color : appTheme.colors.textPrimary, 
//       marginBottom: "2px",
//       lineHeight: 1,
//       display: "flex",
//       alignItems: "center",
//       gap: "4px"
//     }}>
//       <span>{value}</span>
//       <span style={{ fontSize: isMobile ? "0.8rem" : "1rem" }}>{icon}</span>
//     </div>
//     <div style={{ 
//       fontSize: isMobile ? "0.65rem" : "0.75rem", 
//       color: active ? color : appTheme.colors.textSecondary, 
//       fontWeight: "600",
//       lineHeight: 1.2,
//       textTransform: "uppercase",
//       letterSpacing: "0.5px"
//     }}>
//       {label}
//     </div>
//   </div>
// );

// // Metric Card Component for additional stats
// const MetricCard = ({ label, value, icon, color }) => (
//   <div style={{
//     backgroundColor: appTheme.colors.surface,
//     padding: "16px",
//     borderRadius: "10px",
//     boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
//     border: `1px solid ${appTheme.colors.border}`,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between"
//   }}>
//     <div>
//       <div style={{
//         fontSize: "0.7rem",
//         color: appTheme.colors.textSecondary,
//         fontWeight: "600",
//         textTransform: "uppercase",
//         letterSpacing: "0.5px",
//         marginBottom: "4px"
//       }}>
//         {label}
//       </div>
//       <div style={{
//         fontSize: "1.2rem",
//         fontWeight: "700",
//         color: appTheme.colors.textPrimary
//       }}>
//         {value}
//       </div>
//     </div>
//     <div style={{
//       backgroundColor: color + "20",
//       color: color,
//       width: "40px",
//       height: "40px",
//       borderRadius: "10px",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       fontSize: "1.2rem"
//     }}>
//       {icon}
//     </div>
//   </div>
// );








// above is working without saas



















// app/admin/products/page.js
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { appTheme } from "../../../src/constants/theme";
import { DataTable } from "../../../src/components/table";
import { 
  FaSearch, 
  FaTimes, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff,
  FaTag,
  FaBoxes,
  FaChartLine,
  FaStar,
  FaFire,
  FaCalendarAlt,
  FaPercent,
  FaHashtag,
  FaBuilding,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

// Safe number formatter utility
const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const safeToFixed = (value, digits = 2) => {
  const num = safeNumber(value);
  return num.toFixed(digits);
};

// Format custom ID to 5-digit format (00123)
const formatCustomId = (id) => {
  if (!id && id !== 0) return 'N/A';
  return String(id).padStart(5, '0');
};

// Get category display name from populated object
const getCategoryName = (category) => {
  if (!category) return 'Uncategorized';
  if (typeof category === 'string') return category;
  return category.name || 'Uncategorized';
};

// Get subcategory display name from populated object
const getSubCategoryName = (subCategory) => {
  if (!subCategory) return null;
  if (typeof subCategory === 'string') return subCategory;
  return subCategory.name || null;
};

// Helper to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Mobile Card Component with enhanced product data
const MobileProductCard = ({ product, onEdit, onDelete, onToggleStatus, appTheme, user }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Safe number values
  const mrp = safeNumber(product.mrp);
  const discountPrice = safeNumber(product.discountPrice);
  const stock = safeNumber(product.stock);
  const gstRate = safeNumber(product.gstRate);
  const costPrice = safeNumber(product.costPrice);
  const margin = safeNumber(product.margin);
  const averageRating = safeNumber(product.averageRating);
  const customId = product.customId;

  // Get category names
  const categoryName = getCategoryName(product.category);
  const subCategoryName = getSubCategoryName(product.subCategory);
  const fullCategory = subCategoryName ? `${categoryName} → ${subCategoryName}` : categoryName;

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (mrp > 0 && discountPrice < mrp) {
      return Math.round(((mrp - discountPrice) / mrp) * 100);
    }
    return 0;
  }, [mrp, discountPrice]);

  // Determine stock status
  const getStockStatus = () => {
    if (stock === 0) return { label: "Out of Stock", color: appTheme.colors.error };
    if (stock <= (product.lowStockThreshold || 5)) return { label: "Low Stock", color: appTheme.colors.warning };
    return { label: "In Stock", color: appTheme.colors.success };
  };

  const stockStatus = getStockStatus();

  return (
    <div style={{
      backgroundColor: appTheme.colors.surface,
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "12px",
      border: `1px solid ${appTheme.colors.border}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      position: "relative",
    }}>
      {/* Product Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Product Image */}
        <div style={{
          width: "70px",
          height: "70px",
          borderRadius: "8px",
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: appTheme.colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${appTheme.colors.border}`,
        }}>
          {product.imageUrls?.[0] ? (
            <img 
              src={product.imageUrls[0]} 
              alt={product.productName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {!product.imageUrls?.[0] && (
            <div style={{
              color: appTheme.colors.textSecondary,
              fontSize: "0.7rem",
              fontWeight: "600",
              textAlign: "center"
            }}>
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "flex-start",
            marginBottom: "6px" 
          }}>
            <h3 style={{
              fontSize: "0.95rem",
              fontWeight: "600",
              color: appTheme.colors.textPrimary,
              margin: 0,
              lineHeight: 1.3,
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginRight: "8px"
            }}>
              {product.productName}
            </h3>
            <span style={{
              backgroundColor: product.isActive ? appTheme.colors.success + "20" : appTheme.colors.textSecondary + "20",
              color: product.isActive ? appTheme.colors.success : appTheme.colors.textSecondary,
              padding: "3px 8px",
              borderRadius: "10px",
              fontSize: "0.7rem",
              fontWeight: "600",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Custom ID Display */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "4px",
            fontSize: "0.7rem",
            color: appTheme.colors.textSecondary
          }}>
            <FaHashtag size={10} />
            <span style={{ fontFamily: "monospace", fontWeight: "500" }}>
              ID: {formatCustomId(customId)}
            </span>
          </div>

          {/* Company Badge - NEW */}
          {user?.companyName && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "4px",
              fontSize: "0.65rem",
              color: appTheme.colors.primary,
              backgroundColor: appTheme.colors.primary + "10",
              padding: "2px 6px",
              borderRadius: "4px",
              width: "fit-content"
            }}>
              <FaBuilding size={8} />
              <span>{user.companyName}</span>
            </div>
          )}

          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px", 
            marginBottom: "6px",
            flexWrap: "wrap" 
          }}>
            <span style={{
              backgroundColor: appTheme.colors.primary + "15",
              color: appTheme.colors.primary,
              padding: "2px 8px",
              borderRadius: "8px",
              fontSize: "0.7rem",
              fontWeight: "500",
              border: `1px solid ${appTheme.colors.primary}20`
            }}>
              {fullCategory}
            </span>
            
            {product.brand && (
              <span style={{
                backgroundColor: appTheme.colors.secondary + "15",
                color: appTheme.colors.secondary,
                padding: "2px 8px",
                borderRadius: "8px",
                fontSize: "0.7rem",
                fontWeight: "500",
                border: `1px solid ${appTheme.colors.secondary}20`
              }}>
                {product.brand}
              </span>
            )}
          </div>

          {/* Pricing */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            marginBottom: "6px"
          }}>
            <span style={{
              fontWeight: "700",
              color: appTheme.colors.primary,
              fontSize: "0.95rem"
            }}>
              ₹{safeToFixed(discountPrice)}
            </span>
            {mrp > discountPrice && (
              <>
                <span style={{
                  fontSize: "0.75rem",
                  color: appTheme.colors.textSecondary,
                  textDecoration: "line-through"
                }}>
                  ₹{safeToFixed(mrp)}
                </span>
                <span style={{
                  backgroundColor: appTheme.colors.success + "20",
                  color: appTheme.colors.success,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "0.65rem",
                  fontWeight: "600"
                }}>
                  {discountPercentage}% OFF
                </span>
              </>
            )}
          </div>

          {/* Stock and Flags */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "6px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{
                color: stockStatus.color,
                fontWeight: "600",
                fontSize: "0.8rem",
              }}>
                {stockStatus.label}: {stock}
              </span>
            </div>
            
            <div style={{ display: "flex", gap: "4px" }}>
              {product.isFeatured && (
                <span style={{
                  backgroundColor: appTheme.colors.warning + "20",
                  color: appTheme.colors.warning,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "0.65rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px"
                }}>
                  <FaStar size={8} /> Featured
                </span>
              )}
              {product.isOnSale && (
                <span style={{
                  backgroundColor: appTheme.colors.success + "20",
                  color: appTheme.colors.success,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "0.65rem",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px"
                }}>
                  <FaFire size={8} /> Sale
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: "none",
              border: "none",
              color: appTheme.colors.primary,
              cursor: "pointer",
              fontSize: "0.75rem",
              padding: "4px 0",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontWeight: "500",
              marginTop: "4px"
            }}
          >
            {isExpanded ? "Show Less" : "View Details"}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: `1px solid ${appTheme.colors.border}`,
          animation: "slideDown 0.3s ease"
        }}>
          {/* Custom ID and MongoDB ID */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            marginBottom: "12px",
            background: appTheme.colors.background,
            padding: "10px",
            borderRadius: "8px"
          }}>
            <div>
              <div style={{
                fontSize: "0.65rem",
                color: appTheme.colors.textSecondary,
                marginBottom: "2px",
                textTransform: "uppercase"
              }}>
                Product ID
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: appTheme.colors.primary,
                fontWeight: "700",
                fontFamily: "monospace"
              }}>
                {formatCustomId(customId)}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: "0.65rem",
                color: appTheme.colors.textSecondary,
                marginBottom: "2px",
                textTransform: "uppercase"
              }}>
                MongoDB ID
              </div>
              <div style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textSecondary,
                fontFamily: "monospace",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {product._id?.slice(-8) || 'N/A'}
              </div>
            </div>
          </div>

          {/* SKU and HSN */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            marginBottom: "12px",
            background: appTheme.colors.background,
            padding: "10px",
            borderRadius: "8px"
          }}>
            <div>
              <div style={{
                fontSize: "0.65rem",
                color: appTheme.colors.textSecondary,
                marginBottom: "2px",
                textTransform: "uppercase"
              }}>
                SKU
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: appTheme.colors.textPrimary,
                fontWeight: "600",
                fontFamily: "monospace"
              }}>
                {product.sku || "N/A"}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: "0.65rem",
                color: appTheme.colors.textSecondary,
                marginBottom: "2px",
                textTransform: "uppercase"
              }}>
                HSN Code
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: appTheme.colors.textPrimary,
                fontWeight: "600",
                fontFamily: "monospace"
              }}>
                {product.hsnCode || "N/A"}
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textSecondary,
                fontWeight: "600",
                marginBottom: "4px"
              }}>
                Description:
              </div>
              <div style={{
                fontSize: "0.75rem",
                color: appTheme.colors.textPrimary,
                lineHeight: 1.4,
                maxHeight: "60px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical"
              }}>
                {product.description}
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textSecondary,
                fontWeight: "600",
                marginBottom: "6px"
              }}>
                Specifications:
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "6px"
              }}>
                {Object.entries(product.specifications).slice(0, 4).map(([key, value]) => (
                  <div key={key} style={{
                    fontSize: "0.7rem",
                    background: appTheme.colors.surface,
                    padding: "4px 6px",
                    borderRadius: "4px",
                    border: `1px solid ${appTheme.colors.border}`
                  }}>
                    <span style={{ color: appTheme.colors.textSecondary }}>{key}:</span>{' '}
                    <span style={{ color: appTheme.colors.textPrimary, fontWeight: "500" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GST and Pricing Info */}
          <div style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "12px"
          }}>
            <span style={{
              background: appTheme.colors.info + "15",
              color: appTheme.colors.info,
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.7rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <FaPercent size={8} />
              GST: {gstRate}%
            </span>
            {costPrice > 0 && (
              <span style={{
                background: appTheme.colors.textSecondary + "15",
                color: appTheme.colors.textSecondary,
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.7rem",
                fontWeight: "500"
              }}>
                Cost: ₹{safeToFixed(costPrice)}
              </span>
            )}
            {margin > 0 && (
              <span style={{
                background: appTheme.colors.success + "15",
                color: appTheme.colors.success,
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.7rem",
                fontWeight: "500"
              }}>
                Margin: {safeToFixed(margin, 1)}%
              </span>
            )}
          </div>

          {/* Additional Info */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
            marginBottom: "12px"
          }}>
            <div>
              <div style={{
                fontSize: "0.65rem",
                color: appTheme.colors.textSecondary,
                marginBottom: "2px"
              }}>
                Created:
              </div>
              <div style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textPrimary,
                fontWeight: "500"
              }}>
                {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : "N/A"}
              </div>
            </div>
            <div>
              <div style={{
                fontSize: "0.65rem",
                color: appTheme.colors.textSecondary,
                marginBottom: "2px"
              }}>
                Last Updated:
              </div>
              <div style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textPrimary,
                fontWeight: "500"
              }}>
                {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                }) : "N/A"}
              </div>
            </div>
          </div>

          {/* Ratings */}
          {averageRating > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              padding: "8px",
              background: appTheme.colors.warning + "10",
              borderRadius: "6px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    size={12}
                    color={star <= averageRating ? appTheme.colors.warning : appTheme.colors.border}
                  />
                ))}
              </div>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                color: appTheme.colors.warning
              }}>
                {safeToFixed(averageRating, 1)}
              </span>
              <span style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textSecondary
              }}>
                ({product.totalReviews || 0} reviews)
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap"
          }}>
            <button
              onClick={() => onEdit(product)}
              style={{
                flex: 1,
                backgroundColor: appTheme.colors.primary + "15",
                color: appTheme.colors.primary,
                border: `1px solid ${appTheme.colors.primary}30`,
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                minHeight: "36px"
              }}
            >
              <FaEdit size={11} />
              Edit
            </button>
            
            <button
              onClick={() => onToggleStatus(product)}
              style={{
                flex: 1,
                backgroundColor: product.isActive ? appTheme.colors.warning + "15" : appTheme.colors.success + "15",
                color: product.isActive ? appTheme.colors.warning : appTheme.colors.success,
                border: `1px solid ${product.isActive ? appTheme.colors.warning + "30" : appTheme.colors.success + "30"}`,
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                minHeight: "36px"
              }}
            >
              {product.isActive ? <FaToggleOff size={11} /> : <FaToggleOn size={11} />}
              {product.isActive ? "Deactivate" : "Activate"}
            </button>
            
            <button
              onClick={() => onDelete(product)}
              style={{
                flex: 1,
                backgroundColor: appTheme.colors.error + "15",
                color: appTheme.colors.error,
                border: `1px solid ${appTheme.colors.error}30`,
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                minHeight: "36px"
              }}
            >
              <FaTrash size={11} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProductTablePage() {
  const router = useRouter();
  const { user, isAuthenticated, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [customIdFilter, setCustomIdFilter] = useState("");
  const [apiError, setApiError] = useState(null);
  
  // State for categories
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Redirect if not authenticated or not company admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!isCompanyAdmin && !isSuperAdmin) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isCompanyAdmin, isSuperAdmin, router]);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    if (user?.companyId) {
      fetchCategories();
    }
  }, [user]);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      const cat = categories.find(c => c._id === selectedCategory);
      setSubCategories(cat?.subcategories || []);
      setSelectedSubCategory('all');
    } else {
      setSubCategories([]);
      setSelectedSubCategory('all');
    }
  }, [selectedCategory, categories]);

  // Fetch all categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const params = new URLSearchParams({
        type: 'categories',
        format: 'tree'
      });
      
      const res = await fetch(`/api/masters?${params}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch all products with company context
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setApiError(null);
      
      const res = await fetch("/api/products?isActive=all", {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("You don't have permission to view these products");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Add formatted ID to each product
        const productsWithFormat = (data.data || []).map(product => ({
          ...product,
          formattedId: product.customId ? String(product.customId).padStart(5, '0') : null
        }));
        setProducts(productsWithFormat);
        setFilteredProducts(productsWithFormat);
      } else {
        console.error("API Error:", data.message);
        setApiError(data.message);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setApiError(err.message);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.companyId) {
      fetchProducts();
    }
  }, [user]);

  // Get unique brands for filters
  const brands = useMemo(() => {
    const br = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return ["all", ...br];
  }, [products]);

  // Filter and search products with enhanced criteria
  useEffect(() => {
    let filtered = products;

    // Apply status filter
    switch (activeFilter) {
      case "low":
        filtered = filtered.filter(product => 
          safeNumber(product.stock) <= (product.lowStockThreshold || 5) && 
          safeNumber(product.stock) > 0 && 
          product.isActive
        );
        break;
      case "out":
        filtered = filtered.filter(product => safeNumber(product.stock) === 0 && product.isActive);
        break;
      case "active":
        filtered = filtered.filter(product => product.isActive === true);
        break;
      case "inactive":
        filtered = filtered.filter(product => product.isActive === false);
        break;
      case "featured":
        filtered = filtered.filter(product => product.isFeatured === true && product.isActive);
        break;
      case "sale":
        filtered = filtered.filter(product => product.isOnSale === true && product.isActive);
        break;
      default:
        break;
    }

    // Apply category filter using ID
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => 
        product.category?._id === selectedCategory || 
        product.category === selectedCategory
      );
    }

    // Apply subcategory filter using ID
    if (selectedSubCategory !== "all") {
      filtered = filtered.filter(product => 
        product.subCategory?._id === selectedSubCategory || 
        product.subCategory === selectedSubCategory
      );
    }

    // Apply brand filter
    if (selectedBrand !== "all") {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Apply price range filter
    if (priceRange.min) {
      const min = safeNumber(priceRange.min);
      filtered = filtered.filter(product => safeNumber(product.discountPrice) >= min);
    }
    if (priceRange.max) {
      const max = safeNumber(priceRange.max);
      filtered = filtered.filter(product => safeNumber(product.discountPrice) <= max);
    }

    // Apply custom ID filter
    if (customIdFilter.trim()) {
      const idNum = parseInt(customIdFilter, 10);
      if (!isNaN(idNum)) {
        filtered = filtered.filter(product => product.customId === idNum);
      } else {
        // Search by formatted ID string
        const paddedId = customIdFilter.padStart(5, '0');
        filtered = filtered.filter(product => 
          product.formattedId === paddedId
        );
      }
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const categoryName = getCategoryName(product.category).toLowerCase();
        const subCategoryName = getSubCategoryName(product.subCategory)?.toLowerCase() || '';
        
        return (
          product.productName?.toLowerCase().includes(term) ||
          product.sku?.toLowerCase().includes(term) ||
          product.hsnCode?.toLowerCase().includes(term) ||
          categoryName.includes(term) ||
          subCategoryName.includes(term) ||
          product.brand?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.formattedId?.includes(term) ||
          String(product.customId).includes(term)
        );
      });
    }

    setFilteredProducts(filtered);
  }, [activeFilter, searchTerm, products, selectedCategory, selectedSubCategory, selectedBrand, priceRange, customIdFilter]);

  // Edit handler - using MongoDB _id for navigation
  const handleEdit = (product) => {
    router.push(`/admin/products/productForm?id=${product._id}`);
  };

  // Delete handler
  const handleDelete = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.productName}" (ID: ${product.formattedId})? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/products?id=${product._id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`"${product.productName}" has been deleted successfully.`);
        fetchProducts();
      } else {
        alert(`Failed to delete product: ${data.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product. Please try again.");
    }
  };

  // Toggle product status
  const handleToggleStatus = async (product) => {
    const newStatus = !product.isActive;
    const action = newStatus ? "activate" : "deactivate";
    
    if (!confirm(`Are you sure you want to ${action} "${product.productName}"?`)) return;

    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          _id: product._id,
          isActive: newStatus
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Product ${action}d successfully.`);
        fetchProducts();
      } else {
        alert(`Failed to ${action} product: ${data.message}`);
      }
    } catch (err) {
      console.error("Toggle status error:", err);
      alert(`Failed to ${action} product. Please try again.`);
    }
  };

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    const stats = {
      total: products.length,
      active: products.filter(p => p.isActive).length,
      inactive: products.filter(p => !p.isActive).length,
      lowStock: products.filter(p => {
        const stock = safeNumber(p.stock);
        return stock <= (p.lowStockThreshold || 5) && stock > 0 && p.isActive;
      }).length,
      outOfStock: products.filter(p => safeNumber(p.stock) === 0 && p.isActive).length,
      featured: products.filter(p => p.isFeatured && p.isActive).length,
      onSale: products.filter(p => p.isOnSale && p.isActive).length,
      totalValue: products.reduce((sum, p) => {
        return sum + (safeNumber(p.discountPrice) * safeNumber(p.stock));
      }, 0),
      totalMRP: products.reduce((sum, p) => {
        return sum + (safeNumber(p.mrp) * safeNumber(p.stock));
      }, 0),
      potentialSavings: products.reduce((sum, p) => {
        return sum + ((safeNumber(p.mrp) - safeNumber(p.discountPrice)) * safeNumber(p.stock));
      }, 0),
      avgRating: (() => {
        const ratings = products.filter(p => safeNumber(p.averageRating) > 0);
        if (ratings.length === 0) return 0;
        return ratings.reduce((sum, p) => sum + safeNumber(p.averageRating), 0) / ratings.length;
      })(),
      minCustomId: products.length > 0 ? Math.min(...products.map(p => p.customId).filter(Boolean)) : 100,
      maxCustomId: products.length > 0 ? Math.max(...products.map(p => p.customId).filter(Boolean)) : 100
    };
    return stats;
  }, [products]);

  // Reset all filters
  const resetFilters = () => {
    setActiveFilter("all");
    setSelectedCategory("all");
    setSelectedSubCategory("all");
    setSelectedBrand("all");
    setPriceRange({ min: "", max: "" });
    setCustomIdFilter("");
    setSearchTerm("");
  };

  // Show loading if auth not ready
  if (!isAuthenticated || !user) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appTheme.colors.background
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            border: `3px solid ${appTheme.colors.border}`,
            borderTop: `3px solid ${appTheme.colors.primary}`,
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 1s linear infinite"
          }} />
          <p style={{ color: appTheme.colors.textPrimary }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Columns for desktop table with proper category display
  const columns = [
    { 
      header: "ID", 
      accessor: "customId",
      cell: (value, row) => (
        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center",
          gap: "2px"
        }}>
          <span style={{
            backgroundColor: appTheme.colors.primary + "15",
            color: appTheme.colors.primary,
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "0.8rem",
            fontWeight: "700",
            fontFamily: "monospace"
          }}>
            {row.formattedId || formatCustomId(value)}
          </span>
          <span style={{
            fontSize: "0.6rem",
            color: appTheme.colors.textSecondary
          }}>
            {row._id?.slice(-6)}
          </span>
        </div>
      )
    },
    { 
      header: "Product Info", 
      accessor: "productName",
      cell: (value, row) => (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          minWidth: "250px"
        }}>
          {row.imageUrls?.[0] && (
            <img 
              src={row.imageUrls[0]} 
              alt={value}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "6px",
                objectFit: "cover",
                border: `1px solid ${appTheme.colors.border}`,
                flexShrink: 0
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              fontWeight: "600", 
              fontSize: "0.9rem", 
              marginBottom: "2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {value}
            </div>
            <div style={{ 
              display: "flex",
              gap: "4px",
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <span style={{ 
                fontSize: "0.7rem", 
                color: appTheme.colors.textSecondary,
                background: appTheme.colors.background,
                padding: "2px 4px",
                borderRadius: "4px"
              }}>
                SKU: {row.sku || "N/A"}
              </span>
              {row.brand && (
                <span style={{ 
                  fontSize: "0.7rem", 
                  color: appTheme.colors.secondary,
                  background: appTheme.colors.secondary + "10",
                  padding: "2px 4px",
                  borderRadius: "4px"
                }}>
                  {row.brand}
                </span>
              )}
              {/* Company badge for super admin view */}
              {isSuperAdmin && row.companyId && (
                <span style={{ 
                  fontSize: "0.6rem", 
                  color: appTheme.colors.primary,
                  background: appTheme.colors.primary + "10",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px"
                }}>
                  <FaBuilding size={8} />
                  {row.companyId?.companyName || 'Company'}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    { 
      header: "Category", 
      accessor: "category",
      cell: (value, row) => {
        const categoryName = getCategoryName(row.category);
        const subCategoryName = getSubCategoryName(row.subCategory);
        const displayText = subCategoryName ? `${categoryName} → ${subCategoryName}` : categoryName;
        
        return (
          <span style={{
            backgroundColor: appTheme.colors.primary + "15",
            color: appTheme.colors.primary,
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "0.75rem",
            fontWeight: "500",
            border: `1px solid ${appTheme.colors.primary}20`,
            display: "inline-block",
            whiteSpace: "nowrap",
          }}>
            {displayText}
          </span>
        );
      }
    },
    { 
      header: "Pricing", 
      accessor: "discountPrice",
      cell: (value, row) => {
        const mrp = safeNumber(row.mrp);
        const discountPrice = safeNumber(value);
        const discount = mrp > discountPrice ? Math.round(((mrp - discountPrice) / mrp) * 100) : 0;
        
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{ 
              fontWeight: "700", 
              color: appTheme.colors.primary,
              fontSize: "0.9rem",
            }}>
              ₹{safeToFixed(discountPrice)}
            </span>
            {mrp > discountPrice && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ 
                  fontSize: "0.7rem", 
                  color: appTheme.colors.textSecondary,
                  textDecoration: "line-through"
                }}>
                  ₹{safeToFixed(mrp)}
                </span>
                <span style={{
                  backgroundColor: appTheme.colors.success + "20",
                  color: appTheme.colors.success,
                  padding: "2px 4px",
                  borderRadius: "4px",
                  fontSize: "0.6rem",
                  fontWeight: "600"
                }}>
                  {discount}% OFF
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    { 
      header: "Stock", 
      accessor: "stock",
      cell: (value, row) => {
        const stock = safeNumber(value);
        const threshold = row.lowStockThreshold || 5;
        const stockStatus = stock === 0 ? "out" : stock <= threshold ? "low" : "good";
        
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span style={{
              color: stockStatus === "good" ? appTheme.colors.success : 
                     stockStatus === "low" ? appTheme.colors.warning : 
                     appTheme.colors.error,
              fontWeight: "600",
              fontSize: "0.9rem",
            }}>
              {stock} units
            </span>
            {stockStatus === "low" && (
              <span style={{
                fontSize: "0.65rem",
                color: appTheme.colors.warning,
                fontWeight: "500"
              }}>
                Below threshold
              </span>
            )}
          </div>
        );
      }
    },
    { 
      header: "GST", 
      accessor: "gstRate",
      cell: (value) => {
        const gst = safeNumber(value);
        return (
          <span style={{
            backgroundColor: appTheme.colors.info + "15",
            color: appTheme.colors.info,
            padding: "4px 8px",
            borderRadius: "8px",
            fontSize: "0.7rem",
            fontWeight: "600",
            border: `1px solid ${appTheme.colors.info}20`,
            whiteSpace: "nowrap"
          }}>
            {gst}%
          </span>
        );
      }
    },
    { 
      header: "Flags", 
      accessor: "isFeatured",
      cell: (value, row) => (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {row.isFeatured && (
            <span style={{
              backgroundColor: appTheme.colors.warning + "20",
              color: appTheme.colors.warning,
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.65rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "2px"
            }}>
              <FaStar size={8} /> Featured
            </span>
          )}
          {row.isOnSale && (
            <span style={{
              backgroundColor: appTheme.colors.success + "20",
              color: appTheme.colors.success,
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.65rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "2px"
            }}>
              <FaFire size={8} /> Sale
            </span>
          )}
          {row.isNewArrival && (
            <span style={{
              backgroundColor: appTheme.colors.info + "20",
              color: appTheme.colors.info,
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.65rem",
              fontWeight: "600"
            }}>
              New
            </span>
          )}
          {row.isBestSeller && (
            <span style={{
              backgroundColor: appTheme.colors.secondary + "20",
              color: appTheme.colors.secondary,
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.65rem",
              fontWeight: "600"
            }}>
              Bestseller
            </span>
          )}
        </div>
      )
    },
    { 
      header: "Rating", 
      accessor: "averageRating",
      cell: (value, row) => {
        const rating = safeNumber(value);
        const reviews = row.totalReviews || 0;
        
        return rating > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontWeight: "600", fontSize: "0.8rem" }}>{safeToFixed(rating, 1)}</span>
            <div style={{ display: "flex", gap: "1px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={8}
                  color={star <= rating ? appTheme.colors.warning : appTheme.colors.border}
                />
              ))}
            </div>
            <span style={{ fontSize: "0.65rem", color: appTheme.colors.textSecondary }}>
              ({reviews})
            </span>
          </div>
        ) : (
          <span style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>No ratings</span>
        );
      }
    },
    { 
      header: "Status", 
      accessor: "isActive",
      cell: (value) => (
        <span style={{
          padding: "6px 12px",
          borderRadius: "12px",
          fontSize: "0.7rem",
          fontWeight: "600",
          backgroundColor: value ? appTheme.colors.success + "20" : appTheme.colors.textSecondary + "20",
          color: value ? appTheme.colors.success : appTheme.colors.textSecondary,
          border: `1px solid ${value ? appTheme.colors.success + "40" : appTheme.colors.textSecondary + "40"}`,
          whiteSpace: "nowrap",
          display: "inline-block"
        }}>
          {value ? "🟢 Active" : "⚫ Inactive"}
        </span>
      )
    },
  ];

  return (
    <div
      style={{
        backgroundColor: appTheme.colors.background,
        minHeight: "100vh",
        padding: isMobile ? "12px" : "24px",
        fontFamily: appTheme.fonts.primary,
        color: appTheme.colors.textPrimary,
        maxWidth: "100%",
        overflowX: "hidden",
        boxSizing: "border-box"
      }}
    >
      {/* Company Context Header - NEW */}
      <div style={{
        backgroundColor: appTheme.colors.surface,
        padding: isMobile ? "12px" : "16px",
        borderRadius: "10px",
        marginBottom: "20px",
        border: `1px solid ${appTheme.colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            backgroundColor: appTheme.colors.primary + "20",
            width: "40px",
            height: "40px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <FaBuilding size={20} color={appTheme.colors.primary} />
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", color: appTheme.colors.textSecondary }}>Company</div>
            <div style={{ fontSize: "1rem", fontWeight: "600", color: appTheme.colors.textPrimary }}>
              {user?.companyName || 'Your Company'}
            </div>
          </div>
        </div>
        {isSuperAdmin && (
          <div style={{
            backgroundColor: appTheme.colors.warning + "20",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: "600",
            color: appTheme.colors.warning,
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <FaExclamationTriangle size={12} />
            Super Admin View (all companies)
          </div>
        )}
      </div>

      {/* Header Section */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          marginBottom: isMobile ? "16px" : "24px",
          gap: isMobile ? "12px" : "16px",
          width: "100%"
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              color: appTheme.colors.primary,
              fontSize: isMobile ? "1.3rem" : "1.8rem",
              fontWeight: "700",
              marginBottom: "4px",
              lineHeight: 1.2
            }}
          >
            Products Management
          </h1>
          <p style={{
            color: appTheme.colors.textSecondary,
            fontSize: isMobile ? "0.8rem" : "0.875rem",
            margin: 0
          }}>
            Manage your product catalog, inventory, and pricing
          </p>
        </div>
        
        <div style={{
          display: "flex",
          gap: "8px",
          flexWrap: isMobile ? "wrap" : "nowrap",
        }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: showFilters ? appTheme.colors.primary + "30" : appTheme.colors.surface,
              color: showFilters ? appTheme.colors.primary : appTheme.colors.textSecondary,
              border: `1px solid ${appTheme.colors.border}`,
              padding: isMobile ? "10px 16px" : "12px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: isMobile ? "0.85rem" : "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              minHeight: "44px"
            }}
          >
            <FaSearch size={isMobile ? 14 : 16} />
            {isMobile ? "Filters" : "Advanced Filters"}
          </button>
          
          <Link 
            href="/admin/products/productForm" 
            style={{ 
              textDecoration: "none",
              display: "block"
            }}
          >
            <button
              style={{
                backgroundColor: appTheme.colors.primary,
                color: "#fff",
                padding: isMobile ? "10px 16px" : "12px 20px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: isMobile ? "0.85rem" : "0.875rem",
                boxShadow: `0 4px 12px ${appTheme.colors.primary}30`,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                minHeight: "44px",
                whiteSpace: "nowrap"
              }}
            >
              <FaPlus size={isMobile ? 14 : 16} />
              {isMobile ? "Add" : "Add New Product"}
            </button>
          </Link>
        </div>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div style={{
          backgroundColor: appTheme.colors.error + "10",
          border: `1px solid ${appTheme.colors.error}`,
          color: appTheme.colors.error,
          padding: "12px 16px",
          borderRadius: "8px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <FaExclamationTriangle />
          <span>{apiError}</span>
        </div>
      )}

      {/* Advanced Filters Section */}
      {showFilters && (
        <div style={{
          backgroundColor: appTheme.colors.surface,
          padding: isMobile ? "16px" : "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: `1px solid ${appTheme.colors.border}`,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px"
          }}>
            <h3 style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: appTheme.colors.textPrimary,
              margin: 0
            }}>
              Filter Products
            </h3>
            <button
              onClick={resetFilters}
              style={{
                background: "none",
                border: "none",
                color: appTheme.colors.primary,
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "500",
                padding: "4px 8px"
              }}
            >
              Reset All
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(6, 1fr)",
            gap: "12px"
          }}>
            {/* Category Filter with Hierarchy */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "10px",
                border: `1px solid ${appTheme.colors.border}`,
                borderRadius: "8px",
                fontSize: "0.85rem",
                backgroundColor: appTheme.colors.background,
                color: appTheme.colors.textPrimary,
                cursor: "pointer",
                minHeight: "44px"
              }}
              disabled={loadingCategories}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <optgroup key={cat._id} label={cat.name}>
                  <option value={cat._id}>{cat.name}</option>
                  {cat.subcategories?.map(sub => (
                    <option key={sub._id} value={sub._id}>
                      &nbsp;&nbsp;↳ {sub.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* SubCategory Filter */}
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              style={{
                padding: "10px",
                border: `1px solid ${appTheme.colors.border}`,
                borderRadius: "8px",
                fontSize: "0.85rem",
                backgroundColor: appTheme.colors.background,
                color: appTheme.colors.textPrimary,
                cursor: "pointer",
                minHeight: "44px"
              }}
              disabled={!selectedCategory || selectedCategory === 'all' || subCategories.length === 0}
            >
              <option value="all">All SubCategories</option>
              {subCategories.map(sub => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              style={{
                padding: "10px",
                border: `1px solid ${appTheme.colors.border}`,
                borderRadius: "8px",
                fontSize: "0.85rem",
                backgroundColor: appTheme.colors.background,
                color: appTheme.colors.textPrimary,
                cursor: "pointer",
                minHeight: "44px"
              }}
            >
              <option value="all">All Brands</option>
              {brands.filter(b => b !== "all").map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            {/* Price Range */}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                style={{
                  width: "50%",
                  padding: "10px",
                  border: `1px solid ${appTheme.colors.border}`,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  backgroundColor: appTheme.colors.background,
                  color: appTheme.colors.textPrimary,
                  minHeight: "44px"
                }}
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                style={{
                  width: "50%",
                  padding: "10px",
                  border: `1px solid ${appTheme.colors.border}`,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  backgroundColor: appTheme.colors.background,
                  color: appTheme.colors.textPrimary,
                  minHeight: "44px"
                }}
              />
            </div>

            {/* Custom ID Filter */}
            <input
              type="text"
              placeholder="Product ID (00123)"
              value={customIdFilter}
              onChange={(e) => setCustomIdFilter(e.target.value)}
              style={{
                padding: "10px",
                border: `1px solid ${appTheme.colors.border}`,
                borderRadius: "8px",
                fontSize: "0.85rem",
                backgroundColor: appTheme.colors.background,
                color: appTheme.colors.textPrimary,
                minHeight: "44px"
              }}
            />

            <div style={{
              fontSize: "0.8rem",
              color: appTheme.colors.textSecondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: appTheme.colors.background,
              padding: "10px",
              borderRadius: "8px",
              border: `1px solid ${appTheme.colors.border}`
            }}>
              {filteredProducts.length} products found
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ 
        marginBottom: isMobile ? "16px" : "24px",
        position: "relative",
        width: "100%"
      }}>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder={isMobile ? "Search products..." : "Search by name, ID, SKU, HSN, category, brand, or description..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: isMobile ? "10px 14px 10px 40px" : "12px 16px 12px 44px",
              border: `1px solid ${appTheme.colors.border}`,
              borderRadius: "10px",
              fontSize: isMobile ? "0.9rem" : "0.95rem",
              backgroundColor: appTheme.colors.surface,
              color: appTheme.colors.textPrimary,
              outline: "none",
              minHeight: "44px",
              boxSizing: "border-box"
            }}
          />
          <FaSearch 
            size={16}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: appTheme.colors.textSecondary
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: appTheme.colors.textSecondary,
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? "10px" : "16px",
          marginBottom: isMobile ? "16px" : "24px",
          width: "100%"
        }}
      >
        <StatCard
          label="All Products"
          value={statistics.total}
          filter="all"
          active={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
          color={appTheme.colors.primary}
          icon="📦"
          isMobile={isMobile}
        />
        <StatCard
          label="Active"
          value={statistics.active}
          filter="active"
          active={activeFilter === "active"}
          onClick={() => setActiveFilter("active")}
          color={appTheme.colors.success}
          icon="✅"
          isMobile={isMobile}
        />
        <StatCard
          label="Low Stock"
          value={statistics.lowStock}
          filter="low"
          active={activeFilter === "low"}
          onClick={() => setActiveFilter("low")}
          color={appTheme.colors.warning}
          icon="⚠️"
          isMobile={isMobile}
        />
        <StatCard
          label="Out of Stock"
          value={statistics.outOfStock}
          filter="out"
          active={activeFilter === "out"}
          onClick={() => setActiveFilter("out")}
          color={appTheme.colors.error}
          icon="🚫"
          isMobile={isMobile}
        />
      </div>

      {/* Secondary Statistics */}
      {!isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "16px",
            marginBottom: "24px"
          }}
        >
          <MetricCard
            label="Inventory Value"
            value={`₹${safeToFixed(statistics.totalValue)}`}
            icon={<FaChartLine />}
            color={appTheme.colors.info}
          />
          <MetricCard
            label="Featured Products"
            value={statistics.featured}
            icon={<FaStar />}
            color={appTheme.colors.warning}
          />
          <MetricCard
            label="On Sale"
            value={statistics.onSale}
            icon={<FaFire />}
            color={appTheme.colors.success}
          />
          <MetricCard
            label="Avg Rating"
            value={safeToFixed(statistics.avgRating, 1)}
            icon="⭐"
            color={appTheme.colors.secondary}
          />
          <MetricCard
            label="ID Range"
            value={`${statistics.minCustomId} - ${statistics.maxCustomId}`}
            icon={<FaHashtag />}
            color={appTheme.colors.primary}
          />
        </div>
      )}

      {/* Active Filter Info */}
      {activeFilter !== "all" && (
        <div style={{ 
          backgroundColor: appTheme.colors.surface, 
          padding: "12px 16px", 
          borderRadius: "10px", 
          marginBottom: "16px", 
          border: `1px solid ${appTheme.colors.border}`, 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", 
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? "10px" : "0",
          width: "100%"
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: isMobile ? "6px" : "8px",
            flexWrap: "wrap" 
          }}>
            <span style={{ 
              fontSize: isMobile ? "0.9rem" : "1rem", 
              fontWeight: "600", 
              color: appTheme.colors.textPrimary 
            }}>
              {activeFilter === "active" ? "Active Products" :
               activeFilter === "low" ? "Low Stock Products" :
               activeFilter === "out" ? "Out of Stock Products" :
               activeFilter === "featured" ? "Featured Products" :
               "Inactive Products"}
            </span>
            <span style={{ 
              fontSize: "0.75rem", 
              color: appTheme.colors.textSecondary,
              backgroundColor: appTheme.colors.background,
              padding: "4px 8px",
              borderRadius: "6px",
              fontWeight: "500",
              whiteSpace: "nowrap"
            }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setActiveFilter("all")}
            style={{
              backgroundColor: "transparent",
              color: appTheme.colors.primary,
              border: `1px solid ${appTheme.colors.primary}`,
              padding: "6px 12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: "500",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              minHeight: "36px",
              width: isMobile ? "100%" : "auto"
            }}
          >
            {isMobile ? "Show All" : "Show All Products"}
          </button>
        </div>
      )}

      {/* Products Content */}
      <div style={{ 
        backgroundColor: appTheme.colors.surface, 
        padding: isMobile ? "8px" : "24px", 
        borderRadius: "12px", 
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        border: `1px solid ${appTheme.colors.border}`,
        width: "100%",
        boxSizing: "border-box"
      }}>
        {loading ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center", 
            padding: "60px 20px",
            textAlign: "center"
          }}>
            <div style={{ 
              width: "50px", 
              height: "50px", 
              border: `3px solid ${appTheme.colors.border}`,
              borderTop: `3px solid ${appTheme.colors.primary}`,
              borderRadius: "50%",
              marginBottom: "16px",
              animation: "spin 1s linear infinite"
            }} />
            <div style={{ 
              fontWeight: "600",
              fontSize: isMobile ? "0.9rem" : "1rem",
              color: appTheme.colors.textPrimary,
              marginBottom: "4px"
            }}>
              Loading products...
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            justifyContent: "center", 
            alignItems: "center", 
            padding: "60px 20px",
            textAlign: "center"
          }}>
            <div style={{ 
              fontSize: isMobile ? "3rem" : "4rem", 
              marginBottom: isMobile ? "16px" : "20px",
              color: appTheme.colors.border
            }}>📦</div>
            <div style={{ 
              fontWeight: "600", 
              fontSize: isMobile ? "1rem" : "1.1rem", 
              marginBottom: "8px",
              color: appTheme.colors.textPrimary
            }}>
              {searchTerm || activeFilter !== "all" || selectedCategory !== "all" || selectedSubCategory !== "all" || selectedBrand !== "all" || priceRange.min || priceRange.max || customIdFilter
                ? "No products match your filters"
                : "No products available"}
            </div>
            <div style={{ 
              fontSize: isMobile ? "0.85rem" : "0.9rem", 
              marginBottom: isMobile ? "16px" : "20px",
              maxWidth: "400px",
              lineHeight: 1.5,
              color: appTheme.colors.textSecondary
            }}>
              {searchTerm || activeFilter !== "all" || selectedCategory !== "all" || selectedSubCategory !== "all" || selectedBrand !== "all" || priceRange.min || priceRange.max || customIdFilter
                ? "Try adjusting your filters or search term"
                : "Get started by adding your first product"}
            </div>
            <button
              onClick={resetFilters}
              style={{
                backgroundColor: appTheme.colors.primary,
                color: "#fff",
                padding: isMobile ? "10px 20px" : "12px 24px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: isMobile ? "0.85rem" : "0.875rem",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FaTimes size={14} />
              Clear All Filters
            </button>
          </div>
        ) : isMobile ? (
          // Mobile Card View
          <div>
            <h3 style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: appTheme.colors.textPrimary,
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: `1px solid ${appTheme.colors.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>Products ({filteredProducts.length})</span>
              <span style={{
                fontSize: "0.7rem",
                color: appTheme.colors.textSecondary,
                backgroundColor: appTheme.colors.background,
                padding: "4px 8px",
                borderRadius: "6px"
              }}>
                {activeFilter !== "all" ? activeFilter : "all"}
              </span>
            </h3>
            <div>
              {filteredProducts.map((product) => (
                <MobileProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  appTheme={appTheme}
                  user={user}
                />
              ))}
            </div>
          </div>
        ) : (
          // Desktop Table View
          <div style={{ width: "100%", overflowX: "auto" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "8px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h3 style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: appTheme.colors.textPrimary,
                  margin: 0
                }}>
                  Product Inventory
                </h3>
                {activeFilter !== "all" && (
                  <span style={{
                    backgroundColor: appTheme.colors.primary + "15",
                    color: appTheme.colors.primary,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                    fontWeight: "600"
                  }}>
                    {activeFilter === "active" ? "Active" :
                     activeFilter === "low" ? "Low Stock" :
                     activeFilter === "out" ? "Out of Stock" :
                     activeFilter === "featured" ? "Featured" :
                     activeFilter === "sale" ? "On Sale" :
                     "Inactive"}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: "0.8rem",
                color: appTheme.colors.textSecondary,
                backgroundColor: appTheme.colors.background,
                padding: "4px 12px",
                borderRadius: "8px",
                fontWeight: "500"
              }}>
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>
            <DataTable
              title=""
              columns={columns}
              data={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              loading={loading}
              searchable={false}
              pagination={true}
              exportable={true}
              itemsPerPage={10}
              isMobile={false}
            />
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 767px) {
          body {
            overflow-x: hidden;
          }
          
          * {
            box-sizing: border-box;
          }
          
          input, select, button {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Stat Card Component
const StatCard = ({ label, value, filter, active, onClick, color, icon, isMobile }) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: active ? color + "15" : appTheme.colors.surface,
      padding: isMobile ? "14px 8px" : "16px",
      borderRadius: "10px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      border: `2px solid ${active ? color : appTheme.colors.border}`,
      textAlign: "center",
      cursor: "pointer",
      minHeight: isMobile ? "60px" : "70px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.2s ease"
    }}
  >
    <div style={{ 
      fontSize: isMobile ? "1.2rem" : "1.4rem", 
      fontWeight: "700", 
      color: active ? color : appTheme.colors.textPrimary, 
      marginBottom: "2px",
      lineHeight: 1,
      display: "flex",
      alignItems: "center",
      gap: "4px"
    }}>
      <span>{value}</span>
      <span style={{ fontSize: isMobile ? "0.8rem" : "1rem" }}>{icon}</span>
    </div>
    <div style={{ 
      fontSize: isMobile ? "0.65rem" : "0.75rem", 
      color: active ? color : appTheme.colors.textSecondary, 
      fontWeight: "600",
      lineHeight: 1.2,
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    }}>
      {label}
    </div>
  </div>
);

// Metric Card Component for additional stats
const MetricCard = ({ label, value, icon, color }) => (
  <div style={{
    backgroundColor: appTheme.colors.surface,
    padding: "16px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    border: `1px solid ${appTheme.colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }}>
    <div>
      <div style={{
        fontSize: "0.7rem",
        color: appTheme.colors.textSecondary,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "4px"
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "1.2rem",
        fontWeight: "700",
        color: appTheme.colors.textPrimary
      }}>
        {value}
      </div>
    </div>
    <div style={{
      backgroundColor: color + "20",
      color: color,
      width: "40px",
      height: "40px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.2rem"
    }}>
      {icon}
    </div>
  </div>
);
