// // app/admin/products/productForm/page.js

// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { appTheme } from "../../../../src/constants/theme";
// import { useAuth } from '../../../../context/AuthContext'; // ✅ ADD THIS IMPORT

// export default function ProductForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const productId = searchParams.get("id");
  
//   // ✅ GET THE USER FROM AUTH CONTEXT
//   const { user } = useAuth();

//   // ✅ State for custom ID display
//   const [customId, setCustomId] = useState(null);
//   const [formattedId, setFormattedId] = useState(null);

//   const [formData, setFormData] = useState({
//     productName: "",
//     slug: "",
//     sku: "",
//     hsnCode: "",
//     category: "",
//     subCategory: "",
//     brand: "",
//     mrp: "",
//     discountPrice: "",
//     costPrice: "",
//     price: "",
//     gstRate: "18",
//     gstIncluded: true,
//     description: "",
//     shortDescription: "",
//     stock: "",
//     lowStockThreshold: "5",
//     trackInventory: true,
//     allowBackorder: false,
//     imageUrls: [],
//     videoUrl: "",
//     options: "",
//     variants: [],
//     specifications: {},
//     metaTitle: "",
//     metaDescription: "",
//     metaKeywords: [],
//     isFeatured: false,
//     isOnSale: false,
//     isNewArrival: false,
//     isBestSeller: false,
//     weight: "",
//     dimensions: {
//       length: "",
//       width: "",
//       height: "",
//       unit: "cm"
//     },
//     maxOrderQuantity: "10",
//     taxClass: "standard",
//     shippingClass: ""
//   });
  
//   const [imageFiles, setImageFiles] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [activeTab, setActiveTab] = useState("basic");
//   const [specKey, setSpecKey] = useState("");
//   const [specValue, setSpecValue] = useState("");

//   // Mobile detection with debounce
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
    
//     let resizeTimeout;
//     const handleResize = () => {
//       clearTimeout(resizeTimeout);
//       resizeTimeout = setTimeout(checkMobile, 150);
//     };
    
//     window.addEventListener('resize', handleResize);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//       clearTimeout(resizeTimeout);
//     };
//   }, []);

//   // Fetch product data if editing
//   useEffect(() => {
//     if (productId) {
//       setIsEditing(true);
//       fetchProduct();
//     } else {
//       // Generate a temporary SKU for new products
//       generateSKU();
//     }
//   }, [productId]);

//   const generateSKU = () => {
//     const timestamp = Date.now().toString().slice(-6);
//     const random = Math.random().toString(36).substring(2, 5).toUpperCase();
//     setFormData(prev => ({
//       ...prev,
//       sku: `PRD-${timestamp}-${random}`
//     }));
//   };

//   const generateSlug = (name) => {
//     return name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, '-')
//       .replace(/^-|-$/g, '');
//   };

//   // Format custom ID to 5-digit format (00123)
//   const formatCustomId = (id) => {
//     if (!id && id !== 0) return null;
//     return String(id).padStart(5, '0');
//   };

//   const fetchProduct = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/products?id=${productId}`);
//       const data = await res.json();
      
//       if (data.success) {
//         const product = data.data;
        
//         // Set custom ID if available
//         if (product.customId) {
//           setCustomId(product.customId);
//           setFormattedId(formatCustomId(product.customId));
//         }

//         setFormData({
//           productName: product.productName || "",
//           slug: product.slug || "",
//           sku: product.sku || "",
//           hsnCode: product.hsnCode || "",
//           category: product.category || "",
//           subCategory: product.subCategory || "",
//           brand: product.brand || "",
//           mrp: product.mrp?.toString() || "",
//           discountPrice: product.discountPrice?.toString() || "",
//           costPrice: product.costPrice?.toString() || "",
//           price: product.discountPrice?.toString() || "",
//           gstRate: product.gstRate?.toString() || "18",
//           gstIncluded: product.gstIncluded !== false,
//           description: product.description || "",
//           shortDescription: product.shortDescription || "",
//           stock: product.stock?.toString() || "",
//           lowStockThreshold: product.lowStockThreshold?.toString() || "5",
//           trackInventory: product.trackInventory !== false,
//           allowBackorder: product.allowBackorder || false,
//           imageUrls: product.imageUrls || [],
//           videoUrl: product.videoUrl || "",
//           options: product.options || "",
//           variants: product.variants || [],
//           specifications: product.specifications || {},
//           metaTitle: product.metaTitle || "",
//           metaDescription: product.metaDescription || "",
//           metaKeywords: product.metaKeywords || [],
//           isFeatured: product.isFeatured || false,
//           isOnSale: product.isOnSale || false,
//           isNewArrival: product.isNewArrival || false,
//           isBestSeller: product.isBestSeller || false,
//           weight: product.weight?.toString() || "",
//           dimensions: product.dimensions || {
//             length: "",
//             width: "",
//             height: "",
//             unit: "cm"
//           },
//           maxOrderQuantity: product.maxOrderQuantity?.toString() || "10",
//           taxClass: product.taxClass || "standard",
//           shippingClass: product.shippingClass || ""
//         });
        
//         // Set existing images as previews
//         if (product.imageUrls && product.imageUrls.length > 0) {
//           setImagePreviews(product.imageUrls);
//         }
//       } else {
//         alert("Failed to fetch product: " + data.message);
//         router.push("/admin/products");
//       }
//     } catch (err) {
//       console.error("Error fetching product:", err);
//       alert("Failed to load product data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Required fields validation
//     if (!formData.productName.trim()) {
//       newErrors.productName = "Product name is required";
//     }

//     if (!formData.sku.trim()) {
//       newErrors.sku = "SKU is required";
//     }

//     if (!formData.hsnCode.trim()) {
//       newErrors.hsnCode = "HSN code is required";
//     }

//     if (!formData.category.trim()) {
//       newErrors.category = "Category is required";
//     }

//     // MRP validation
//     if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
//       newErrors.mrp = "Valid MRP is required (greater than 0)";
//     }

//     // Discount price validation
//     if (!formData.discountPrice || parseFloat(formData.discountPrice) < 0) {
//       newErrors.discountPrice = "Valid discount price is required";
//     } else if (parseFloat(formData.discountPrice) > parseFloat(formData.mrp)) {
//       newErrors.discountPrice = "Discount price cannot be greater than MRP";
//     }

//     // GST validation
//     const gstRate = parseFloat(formData.gstRate);
//     if (isNaN(gstRate) || gstRate < 0 || gstRate > 28) {
//       newErrors.gstRate = "GST rate must be between 0 and 28";
//     }

//     // Stock validation
//     if (!formData.stock || parseInt(formData.stock) < 0) {
//       newErrors.stock = "Valid stock quantity is required (0 or more)";
//     }

//     if (!formData.description.trim()) {
//       newErrors.description = "Description is required";
//     }

//     // Image validation
//     if (imagePreviews.length === 0 && (!formData.imageUrls || formData.imageUrls.length === 0)) {
//       newErrors.images = "At least one product image is required";
//     }

//     // Weight validation if provided
//     if (formData.weight && parseFloat(formData.weight) < 0) {
//       newErrors.weight = "Weight cannot be negative";
//     }

//     // Dimensions validation if any dimension is provided
//     if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
//       if (!formData.dimensions.length || parseFloat(formData.dimensions.length) <= 0) {
//         newErrors.dimensions = "Valid length is required";
//       }
//       if (!formData.dimensions.width || parseFloat(formData.dimensions.width) <= 0) {
//         newErrors.dimensions = "Valid width is required";
//       }
//       if (!formData.dimensions.height || parseFloat(formData.dimensions.height) <= 0) {
//         newErrors.dimensions = "Valid height is required";
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     if (type === 'checkbox') {
//       setFormData(prev => ({
//         ...prev,
//         [name]: checked
//       }));
//     } else if (name.startsWith('dimensions.')) {
//       const dimension = name.split('.')[1];
//       setFormData(prev => ({
//         ...prev,
//         dimensions: {
//           ...prev.dimensions,
//           [dimension]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));

//       // Auto-generate slug from product name
//       if (name === 'productName' && !isEditing) {
//         setFormData(prev => ({
//           ...prev,
//           slug: generateSlug(value)
//         }));
//       }

//       // Update price based on discount price
//       if (name === 'discountPrice') {
//         setFormData(prev => ({
//           ...prev,
//           price: value
//         }));
//       }

//       // Check if product is on sale
//       if (name === 'mrp' || name === 'discountPrice') {
//         const mrp = parseFloat(name === 'mrp' ? value : formData.mrp);
//         const discount = parseFloat(name === 'discountPrice' ? value : formData.discountPrice);
//         if (!isNaN(mrp) && !isNaN(discount)) {
//           setFormData(prev => ({
//             ...prev,
//             isOnSale: discount < mrp
//           }));
//         }
//       }
//     }
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ""
//       }));
//     }
//   };

//   const handleMetaKeywordsChange = (e) => {
//     const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
//     setFormData(prev => ({
//       ...prev,
//       metaKeywords: keywords
//     }));
//   };

//   const addSpecification = () => {
//     if (specKey.trim() && specValue.trim()) {
//       setFormData(prev => ({
//         ...prev,
//         specifications: {
//           ...prev.specifications,
//           [specKey.trim()]: specValue.trim()
//         }
//       }));
//       setSpecKey("");
//       setSpecValue("");
//     }
//   };

//   const removeSpecification = (key) => {
//     const newSpecs = { ...formData.specifications };
//     delete newSpecs[key];
//     setFormData(prev => ({
//       ...prev,
//       specifications: newSpecs
//     }));
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
    
//     // Clear image error
//     if (errors.images) {
//       setErrors(prev => ({ ...prev, images: "" }));
//     }

//     // Validate file types and sizes
//     const validFiles = files.filter(file => {
//       const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
//       const maxSize = 5 * 1024 * 1024; // 5MB
      
//       if (!validTypes.includes(file.type)) {
//         alert(`Invalid file type: ${file.name}. Please upload JPEG, PNG, WebP, or GIF images.`);
//         return false;
//       }
      
//       if (file.size > maxSize) {
//         alert(`File too large: ${file.name}. Maximum size is 5MB.`);
//         return false;
//       }
      
//       return true;
//     });

//     if (validFiles.length === 0) return;

//     // Limit to 8 images maximum
//     const remainingSlots = 8 - imagePreviews.length;
//     const filesToAdd = validFiles.slice(0, remainingSlots);
    
//     if (filesToAdd.length === 0) {
//       alert("Maximum 8 images allowed per product");
//       return;
//     }

//     // Create previews for new files
//     const newPreviews = [];
//     const newFiles = [];

//     filesToAdd.forEach(file => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         newPreviews.push(e.target.result);
        
//         // When all previews are ready, update state
//         if (newPreviews.length === filesToAdd.length) {
//           setImagePreviews(prev => [...prev, ...newPreviews]);
//           setImageFiles(prev => [...prev, ...filesToAdd]);
//         }
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeImage = (index) => {
//     setImagePreviews(prev => prev.filter((_, i) => i !== index));
//     setImageFiles(prev => prev.filter((_, i) => i !== index));
    
//     // If removing existing image URL, update formData
//     if (index < formData.imageUrls.length) {
//       const updatedImageUrls = [...formData.imageUrls];
//       updatedImageUrls.splice(index, 1);
//       setFormData(prev => ({
//         ...prev,
//         imageUrls: updatedImageUrls
//       }));
//     }
//   };

//   const uploadImages = async () => {
//     if (imageFiles.length === 0) return [];

//     const uploadedUrls = [];
    
//     for (const file of imageFiles) {
//       const uploadFormData = new FormData();
//       uploadFormData.append("file", file);

//       try {
//         const res = await fetch("/api/upload", {
//           method: "POST",
//           body: uploadFormData,
//         });
        
//         if (!res.ok) {
//           throw new Error(`Upload failed with status: ${res.status}`);
//         }
        
//         const data = await res.json();
        
//         if (data.success) {
//           uploadedUrls.push(data.imageUrl);
//         } else {
//           throw new Error(data.message || "Upload failed");
//         }
//       } catch (error) {
//         console.error("Upload error:", error);
//         throw new Error(`Failed to upload ${file.name}: ${error.message}`);
//       }
//     }
    
//     return uploadedUrls;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       alert("Please fix the errors before submitting.");
//       return;
//     }

//     if (isSubmitting) return;
    
//     setIsSubmitting(true);
//     setLoading(true);

//     try {
//       let imageUrls = [...formData.imageUrls];

//       // Upload new images if selected
//       if (imageFiles.length > 0) {
//         const uploadedUrls = await uploadImages();
//         imageUrls = [...imageUrls, ...uploadedUrls];
//       }

//       // Calculate margin if cost price is provided
//       let margin = null;
//       if (formData.costPrice && parseFloat(formData.costPrice) > 0) {
//         margin = ((parseFloat(formData.discountPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.costPrice)) * 100;
//       }

//       // Prepare product data
//       const productData = {
//         productName: formData.productName.trim(),
//         slug: formData.slug || generateSlug(formData.productName),
//         sku: formData.sku.toUpperCase(),
//         hsnCode: formData.hsnCode,
//         category: formData.category.trim(),
//         subCategory: formData.subCategory.trim() || undefined,
//         brand: formData.brand.trim() || undefined,
//         mrp: parseFloat(formData.mrp),
//         discountPrice: parseFloat(formData.discountPrice),
//         costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
//         margin,
//         gstRate: parseFloat(formData.gstRate),
//         gstIncluded: formData.gstIncluded,
//         description: formData.description.trim(),
//         shortDescription: formData.shortDescription.trim() || undefined,
//         stock: parseInt(formData.stock),
//         lowStockThreshold: parseInt(formData.lowStockThreshold),
//         trackInventory: formData.trackInventory,
//         allowBackorder: formData.allowBackorder,
//         imageUrls,
//         videoUrl: formData.videoUrl || undefined,
//         options: formData.options || undefined,
//         variants: formData.variants,
//         specifications: formData.specifications,
//         metaTitle: formData.metaTitle || undefined,
//         metaDescription: formData.metaDescription || undefined,
//         metaKeywords: formData.metaKeywords,
//         isFeatured: formData.isFeatured,
//         isOnSale: formData.isOnSale,
//         isNewArrival: formData.isNewArrival,
//         isBestSeller: formData.isBestSeller,
//         weight: formData.weight ? parseFloat(formData.weight) : undefined,
//         dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) ? {
//           length: parseFloat(formData.dimensions.length) || 0,
//           width: parseFloat(formData.dimensions.width) || 0,
//           height: parseFloat(formData.dimensions.height) || 0,
//           unit: formData.dimensions.unit
//         } : undefined,
//         maxOrderQuantity: parseInt(formData.maxOrderQuantity),
//         taxClass: formData.taxClass,
//         shippingClass: formData.shippingClass || undefined,
//         isActive: true,
//         // ✅ Add createdBy from auth context
//         createdBy: user?.id || user?.email || 'admin',
//       };

//       // Add _id for updates
//       if (isEditing) {
//         productData._id = productId;
//         productData.updatedBy = user?.id || user?.email || 'admin';
//       }

//       const url = "/api/products";
//       const method = isEditing ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(productData),
//       });

//       const data = await res.json();

//       if (data.success) {
//         alert(isEditing ? "✅ Product updated successfully!" : "🎉 Product created successfully!");
//         router.push("/admin/products");
//       } else {
//         throw new Error(data.message || "Failed to save product");
//       }
//     } catch (error) {
//       console.error("Error saving product:", error);
//       alert(`❌ Failed to save product: ${error.message}`);
//     } finally {
//       setLoading(false);
//       setIsSubmitting(false);
//     }
//   };

//   const handleBack = useCallback(() => {
//     if (window.history.length > 1) {
//       router.back();
//     } else {
//       router.push("/admin/products");
//     }
//   }, [router]);

//   // Tabs configuration
//   const tabs = [
//     { id: "basic", label: "Basic Info", icon: "📝" },
//     { id: "pricing", label: "Pricing & Stock", icon: "💰" },
//     { id: "media", label: "Media", icon: "🖼️" },
//     { id: "specs", label: "Specifications", icon: "⚙️" },
//     { id: "seo", label: "SEO", icon: "🔍" },
//     { id: "shipping", label: "Shipping", icon: "📦" }
//   ];

//   if (loading && isEditing) {
//     return (
//       <div
//         style={{
//           backgroundColor: appTheme.colors.background,
//           minHeight: "100vh",
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           fontFamily: appTheme.fonts.primary,
//           padding: isMobile ? "20px" : "40px",
//         }}
//       >
//         <div style={{ textAlign: "center" }}>
//           <div style={{ 
//             width: isMobile ? "50px" : "60px", 
//             height: isMobile ? "50px" : "60px", 
//             border: `3px solid ${appTheme.colors.border}`,
//             borderTop: `3px solid ${appTheme.colors.primary}`,
//             borderRadius: "50%",
//             margin: "0 auto 20px",
//             animation: "spin 1s linear infinite"
//           }} />
//           <style>{`
//             @keyframes spin {
//               0% { transform: rotate(0deg); }
//               100% { transform: rotate(360deg); }
//             }
//           `}</style>
//           <div style={{ 
//             fontSize: isMobile ? "1rem" : "1.125rem", 
//             color: appTheme.colors.textPrimary,
//             fontWeight: "600"
//           }}>
//             Loading product data...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       style={{
//         backgroundColor: "transparent",
//         minHeight: "100%",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//         fontFamily: appTheme.fonts.primary,
//         color: appTheme.colors.textPrimary,
//         WebkitTapHighlightColor: "transparent",
//       }}
//     >
//       {/* Mobile Header */}
//       {isMobile && (
//         <div style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 100,
//           backgroundColor: appTheme.colors.background,
//           borderBottom: `1px solid ${appTheme.colors.border}`,
//           padding: "12px 16px",
//           margin: "0 -16px 16px -16px",
//           display: "flex",
//           alignItems: "center",
//           gap: "12px",
//           flexShrink: 0,
//         }}>
//           <button
//             onClick={handleBack}
//             style={{
//               background: "none",
//               border: "none",
//               color: appTheme.colors.primary,
//               cursor: "pointer",
//               fontSize: "24px",
//               padding: "8px",
//               margin: "-8px",
//               minHeight: "44px",
//               minWidth: "44px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center"
//             }}
//             aria-label="Go back"
//           >
//             ←
//           </button>
//           <h1 style={{
//             color: appTheme.colors.primary,
//             fontSize: "1.25rem",
//             fontWeight: "700",
//             margin: 0,
//             flex: 1
//           }}>
//             {isEditing ? "Edit Product" : "New Product"}
//           </h1>
//         </div>
//       )}

//       {/* Scrollable Content Area */}
//       <div style={{
//         flex: 1,
//         overflowY: "auto",
//         overflowX: "hidden",
//         padding: isMobile ? "0 16px 80px 16px" : "24px",
//         height: "100%",
//         minHeight: 0,
//       }}>
//         {/* Desktop Header */}
//         {!isMobile && (
//           <div style={{ 
//             marginBottom: "24px",
//             flexShrink: 0,
//           }}>
//             <button
//               onClick={handleBack}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "6px",
//                 background: "none",
//                 border: "none",
//                 color: appTheme.colors.primary,
//                 cursor: "pointer",
//                 fontSize: "0.875rem",
//                 fontWeight: "500",
//                 padding: "4px 0",
//                 marginBottom: "8px",
//                 minHeight: "32px",
//                 transition: "opacity 0.2s"
//               }}
//               onMouseEnter={(e) => e.target.style.opacity = "0.7"}
//               onMouseLeave={(e) => e.target.style.opacity = "1"}
//             >
//               <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>←</span>
//               <span>Back to Products</span>
//             </button>
            
//             <h1
//               style={{
//                 color: appTheme.colors.textPrimary,
//                 fontSize: "1.75rem",
//                 fontWeight: "600",
//                 margin: "0 0 4px 0",
//                 lineHeight: 1.2,
//                 letterSpacing: "-0.01em"
//               }}
//             >
//               {isEditing ? "Edit Product" : "Add New Product"}
//             </h1>
//             <p style={{
//               color: appTheme.colors.textSecondary,
//               fontSize: "0.875rem",
//               lineHeight: 1.5,
//               margin: 0
//             }}>
//               {isEditing ? "Update your product information" : "Fill in the details to create a new product"}
//             </p>
//           </div>
//         )}

//         {/* Tabs Navigation */}
//         {!isMobile && (
//           <div style={{
//             display: "flex",
//             gap: "4px",
//             marginBottom: "24px",
//             borderBottom: `1px solid ${appTheme.colors.border}`,
//             paddingBottom: "12px",
//             overflowX: "auto",
//             scrollbarWidth: "none",
//             msOverflowStyle: "none",
//           }}>
//             {tabs.map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 style={{
//                   padding: "10px 20px",
//                   border: "none",
//                   background: activeTab === tab.id ? appTheme.colors.primary : "transparent",
//                   color: activeTab === tab.id ? "white" : appTheme.colors.textSecondary,
//                   borderRadius: "8px",
//                   cursor: "pointer",
//                   fontSize: "0.9rem",
//                   fontWeight: "500",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px",
//                   transition: "all 0.2s ease",
//                   whiteSpace: "nowrap"
//                 }}
//               >
//                 <span>{tab.icon}</span>
//                 {tab.label}
//               </button>
//             ))}
//           </div>
//         )}

//         {/* Form Section */}
//         <div style={{
//           width: "100%",
//         }}>
//           <form onSubmit={handleSubmit}>
//             <div
//               style={{
//                 backgroundColor: appTheme.colors.surface,
//                 padding: isMobile ? "20px" : "24px",
//                 borderRadius: isMobile ? "12px" : "8px",
//                 border: !isMobile ? `1px solid ${appTheme.colors.border}` : "none",
//               }}
//             >
//               {/* ✅ Custom ID Display - NEW SECTION */}
//               {isEditing && customId && (
//                 <div style={{
//                   marginBottom: "24px",
//                   padding: "16px",
//                   background: `linear-gradient(135deg, ${appTheme.colors.primary}10, ${appTheme.colors.secondary}10)`,
//                   borderRadius: "12px",
//                   border: `1px solid ${appTheme.colors.primary}30`,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   flexWrap: "wrap",
//                   gap: "12px"
//                 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
//                     <div style={{
//                       width: "40px",
//                       height: "40px",
//                       borderRadius: "8px",
//                       background: appTheme.colors.primary,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       color: "white",
//                       fontSize: "1.2rem"
//                     }}>
//                       #
//                     </div>
//                     <div>
//                       <div style={{ fontSize: "0.8rem", color: appTheme.colors.textSecondary, marginBottom: "2px" }}>
//                         Product ID
//                       </div>
//                       <div style={{ 
//                         fontSize: "1.5rem", 
//                         fontWeight: "700", 
//                         color: appTheme.colors.primary,
//                         fontFamily: "monospace",
//                         letterSpacing: "1px"
//                       }}>
//                         {formattedId}
//                       </div>
//                     </div>
//                   </div>
//                   <div style={{
//                     background: appTheme.colors.background,
//                     padding: "8px 12px",
//                     borderRadius: "8px",
//                     border: `1px solid ${appTheme.colors.border}`,
//                     fontSize: "0.8rem",
//                     color: appTheme.colors.textSecondary
//                   }}>
//                     <span style={{ fontWeight: "600", color: appTheme.colors.textPrimary }}>MongoDB ID:</span> {productId?.slice(-8)}
//                   </div>
//                 </div>
//               )}

//               {/* Basic Info Tab */}
//               {(activeTab === "basic" || isMobile) && (
//                 <div className="tab-content">
//                   <h3 style={{
//                     fontSize: "1.1rem",
//                     fontWeight: "600",
//                     color: appTheme.colors.textPrimary,
//                     marginBottom: "20px",
//                     paddingBottom: "10px",
//                     borderBottom: `1px solid ${appTheme.colors.border}`
//                   }}>
//                     Basic Information
//                   </h3>

//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
//                     gap: isMobile ? "16px" : "20px", 
//                     marginBottom: "20px" 
//                   }}>
//                     {/* Product Name */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="productName"
//                       >
//                         Product Name *
//                       </label>
//                       <input
//                         type="text"
//                         id="productName"
//                         name="productName"
//                         value={formData.productName}
//                         onChange={handleInputChange}
//                         required
//                         style={inputStyle(errors.productName, isMobile)}
//                         placeholder="Enter product name"
//                       />
//                       {errors.productName && <ErrorMessage message={errors.productName} />}
//                     </div>

//                     {/* Slug */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="slug"
//                       >
//                         Slug (URL)
//                       </label>
//                       <input
//                         type="text"
//                         id="slug"
//                         name="slug"
//                         value={formData.slug}
//                         onChange={handleInputChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="product-url-slug"
//                       />
//                       <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
//                         Auto-generated from product name
//                       </small>
//                     </div>

//                     {/* SKU */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="sku"
//                       >
//                         SKU (Stock Keeping Unit) *
//                       </label>
//                       <div style={{ display: "flex", gap: "8px" }}>
//                         <input
//                           type="text"
//                           id="sku"
//                           name="sku"
//                           value={formData.sku}
//                           onChange={handleInputChange}
//                           required
//                           style={{ ...inputStyle(errors.sku, isMobile), flex: 1 }}
//                           placeholder="PRD-123456-ABC"
//                         />
//                         <button
//                           type="button"
//                           onClick={generateSKU}
//                           style={{
//                             padding: isMobile ? "14px 16px" : "10px 12px",
//                             border: `1px solid ${appTheme.colors.border}`,
//                             borderRadius: "6px",
//                             background: appTheme.colors.background,
//                             cursor: "pointer",
//                             minHeight: isMobile ? "48px" : "38px",
//                             fontSize: "0.8rem"
//                           }}
//                         >
//                           🔄
//                         </button>
//                       </div>
//                       {errors.sku && <ErrorMessage message={errors.sku} />}
//                     </div>

//                     {/* HSN Code */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="hsnCode"
//                       >
//                         HSN Code *
//                       </label>
//                       <input
//                         type="text"
//                         id="hsnCode"
//                         name="hsnCode"
//                         value={formData.hsnCode}
//                         onChange={handleInputChange}
//                         required
//                         style={inputStyle(errors.hsnCode, isMobile)}
//                         placeholder="e.g., 4901, 6307"
//                       />
//                       {errors.hsnCode && <ErrorMessage message={errors.hsnCode} />}
//                     </div>

//                     {/* Category */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="category"
//                       >
//                         Category *
//                       </label>
//                       <input
//                         type="text"
//                         id="category"
//                         name="category"
//                         value={formData.category}
//                         onChange={handleInputChange}
//                         required
//                         style={inputStyle(errors.category, isMobile)}
//                         placeholder="e.g., Posters, Stickers, Art"
//                       />
//                       {errors.category && <ErrorMessage message={errors.category} />}
//                     </div>

//                     {/* Sub Category */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="subCategory"
//                       >
//                         Sub Category
//                       </label>
//                       <input
//                         type="text"
//                         id="subCategory"
//                         name="subCategory"
//                         value={formData.subCategory}
//                         onChange={handleInputChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="e.g., Wall Posters, Vinyl Stickers"
//                       />
//                     </div>

//                     {/* Brand */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="brand"
//                       >
//                         Brand
//                       </label>
//                       <input
//                         type="text"
//                         id="brand"
//                         name="brand"
//                         value={formData.brand}
//                         onChange={handleInputChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="Brand name"
//                       />
//                     </div>
//                   </div>

//                   {/* Short Description */}
//                   <div style={{ marginBottom: "20px" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "6px",
//                         fontWeight: "500",
//                         fontSize: isMobile ? "0.9rem" : "0.875rem",
//                         color: appTheme.colors.textPrimary
//                       }}
//                       htmlFor="shortDescription"
//                     >
//                       Short Description
//                     </label>
//                     <textarea
//                       id="shortDescription"
//                       name="shortDescription"
//                       value={formData.shortDescription}
//                       onChange={handleInputChange}
//                       rows="2"
//                       style={textareaStyle(null, isMobile)}
//                       placeholder="Brief summary of the product (max 500 characters)"
//                       maxLength="500"
//                     />
//                   </div>

//                   {/* Full Description */}
//                   <div style={{ marginBottom: "20px" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "6px",
//                         fontWeight: "500",
//                         fontSize: isMobile ? "0.9rem" : "0.875rem",
//                         color: appTheme.colors.textPrimary
//                       }}
//                       htmlFor="description"
//                     >
//                       Description *
//                     </label>
//                     <textarea
//                       id="description"
//                       name="description"
//                       value={formData.description}
//                       onChange={handleInputChange}
//                       required
//                       rows={isMobile ? "5" : "4"}
//                       style={textareaStyle(errors.description, isMobile)}
//                       placeholder="Detailed description of your product..."
//                     />
//                     {errors.description && <ErrorMessage message={errors.description} />}
//                   </div>

//                   {/* Options */}
//                   <div style={{ marginBottom: "20px" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "6px",
//                         fontWeight: "500",
//                         fontSize: isMobile ? "0.9rem" : "0.875rem",
//                         color: appTheme.colors.textPrimary
//                       }}
//                       htmlFor="options"
//                     >
//                       Options & Customization
//                     </label>
//                     <input
//                       type="text"
//                       id="options"
//                       name="options"
//                       value={formData.options}
//                       onChange={handleInputChange}
//                       style={inputStyle(null, isMobile)}
//                       placeholder="e.g., Color: Red, Size: Large, Material: Premium Paper"
//                     />
//                     <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
//                       Separate options with commas for better display
//                     </small>
//                   </div>
//                 </div>
//               )}

//               {/* Pricing & Stock Tab */}
//               {(activeTab === "pricing" || isMobile) && (
//                 <div className="tab-content">
//                   <h3 style={{
//                     fontSize: "1.1rem",
//                     fontWeight: "600",
//                     color: appTheme.colors.textPrimary,
//                     marginBottom: "20px",
//                     paddingBottom: "10px",
//                     borderBottom: `1px solid ${appTheme.colors.border}`
//                   }}>
//                     Pricing & Stock
//                   </h3>

//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", 
//                     gap: isMobile ? "16px" : "20px", 
//                     marginBottom: "20px" 
//                   }}>
//                     {/* MRP */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="mrp"
//                       >
//                         MRP (₹) *
//                       </label>
//                       <input
//                         type="number"
//                         id="mrp"
//                         step="0.01"
//                         min="0.01"
//                         name="mrp"
//                         value={formData.mrp}
//                         onChange={handleInputChange}
//                         required
//                         style={inputStyle(errors.mrp, isMobile)}
//                         placeholder="0.00"
//                         inputMode="decimal"
//                       />
//                       {errors.mrp && <ErrorMessage message={errors.mrp} />}
//                     </div>

//                     {/* Discount Price */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="discountPrice"
//                       >
//                         Selling Price (₹) *
//                       </label>
//                       <input
//                         type="number"
//                         id="discountPrice"
//                         step="0.01"
//                         min="0"
//                         name="discountPrice"
//                         value={formData.discountPrice}
//                         onChange={handleInputChange}
//                         required
//                         style={inputStyle(errors.discountPrice, isMobile)}
//                         placeholder="0.00"
//                         inputMode="decimal"
//                       />
//                       {errors.discountPrice && <ErrorMessage message={errors.discountPrice} />}
//                     </div>

//                     {/* Cost Price */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="costPrice"
//                       >
//                         Cost Price (₹)
//                       </label>
//                       <input
//                         type="number"
//                         id="costPrice"
//                         step="0.01"
//                         min="0"
//                         name="costPrice"
//                         value={formData.costPrice}
//                         onChange={handleInputChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="0.00"
//                         inputMode="decimal"
//                       />
//                       <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
//                         For margin calculation
//                       </small>
//                     </div>
//                   </div>

//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
//                     gap: isMobile ? "16px" : "20px", 
//                     marginBottom: "20px" 
//                   }}>
//                     {/* GST Rate */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="gstRate"
//                       >
//                         GST Rate (%) *
//                       </label>
//                       <select
//                         id="gstRate"
//                         name="gstRate"
//                         value={formData.gstRate}
//                         onChange={handleInputChange}
//                         required
//                         style={selectStyle(errors.gstRate, isMobile)}
//                       >
//                         <option value="0">0%</option>
//                         <option value="5">5%</option>
//                         <option value="12">12%</option>
//                         <option value="18">18%</option>
//                         <option value="28">28%</option>
//                       </select>
//                       {errors.gstRate && <ErrorMessage message={errors.gstRate} />}
//                     </div>

//                     {/* GST Included */}
//                     <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
//                       <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
//                         <input
//                           type="checkbox"
//                           name="gstIncluded"
//                           checked={formData.gstIncluded}
//                           onChange={handleInputChange}
//                           style={{ width: "18px", height: "18px", cursor: "pointer" }}
//                         />
//                         <span style={{ fontSize: isMobile ? "0.9rem" : "0.875rem" }}>
//                           Price includes GST
//                         </span>
//                       </label>
//                     </div>
//                   </div>

//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", 
//                     gap: isMobile ? "16px" : "20px", 
//                     marginBottom: "20px" 
//                   }}>
//                     {/* Stock */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="stock"
//                       >
//                         Stock Quantity *
//                       </label>
//                       <input
//                         type="number"
//                         id="stock"
//                         name="stock"
//                         min="0"
//                         value={formData.stock}
//                         onChange={handleInputChange}
//                         required
//                         style={inputStyle(errors.stock, isMobile)}
//                         placeholder="0"
//                         inputMode="numeric"
//                       />
//                       {errors.stock && <ErrorMessage message={errors.stock} />}
//                     </div>

//                     {/* Low Stock Threshold */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="lowStockThreshold"
//                       >
//                         Low Stock Alert At
//                       </label>
//                       <input
//                         type="number"
//                         id="lowStockThreshold"
//                         name="lowStockThreshold"
//                         min="1"
//                         value={formData.lowStockThreshold}
//                         onChange={handleInputChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="5"
//                       />
//                     </div>

//                     {/* Max Order Quantity */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="maxOrderQuantity"
//                       >
//                         Max Order Quantity
//                       </label>
//                       <input
//                         type="number"
//                         id="maxOrderQuantity"
//                         name="maxOrderQuantity"
//                         min="1"
//                         value={formData.maxOrderQuantity}
//                         onChange={handleInputChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="10"
//                       />
//                     </div>
//                   </div>

//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
//                     gap: isMobile ? "16px" : "20px", 
//                     marginBottom: "20px" 
//                   }}>
//                     {/* Track Inventory */}
//                     <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
//                       <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
//                         <input
//                           type="checkbox"
//                           name="trackInventory"
//                           checked={formData.trackInventory}
//                           onChange={handleInputChange}
//                           style={{ width: "18px", height: "18px", cursor: "pointer" }}
//                         />
//                         <span style={{ fontSize: isMobile ? "0.9rem" : "0.875rem" }}>
//                           Track Inventory
//                         </span>
//                       </label>

//                       <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
//                         <input
//                           type="checkbox"
//                           name="allowBackorder"
//                           checked={formData.allowBackorder}
//                           onChange={handleInputChange}
//                           style={{ width: "18px", height: "18px", cursor: "pointer" }}
//                         />
//                         <span style={{ fontSize: isMobile ? "0.9rem" : "0.875rem" }}>
//                           Allow Backorder
//                         </span>
//                       </label>
//                     </div>

//                     {/* Tax Class */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="taxClass"
//                       >
//                         Tax Class
//                       </label>
//                       <select
//                         id="taxClass"
//                         name="taxClass"
//                         value={formData.taxClass}
//                         onChange={handleInputChange}
//                         style={selectStyle(null, isMobile)}
//                       >
//                         <option value="standard">Standard</option>
//                         <option value="reduced">Reduced</option>
//                         <option value="zero">Zero Rated</option>
//                         <option value="exempt">Exempt</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Media Tab */}
//               {(activeTab === "media" || isMobile) && (
//                 <div className="tab-content">
//                   <h3 style={{
//                     fontSize: "1.1rem",
//                     fontWeight: "600",
//                     color: appTheme.colors.textPrimary,
//                     marginBottom: "20px",
//                     paddingBottom: "10px",
//                     borderBottom: `1px solid ${appTheme.colors.border}`
//                   }}>
//                     Product Media
//                   </h3>

//                   {/* Image Upload Section */}
//                   <div style={{ marginBottom: isMobile ? "24px" : "28px" }}>
//                     <div style={{ 
//                       display: "flex", 
//                       alignItems: "center", 
//                       justifyContent: "space-between", 
//                       marginBottom: "8px" 
//                     }}>
//                       <label
//                         style={{
//                           display: "block",
//                           fontWeight: "600",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                       >
//                         Product Images {!isEditing && "*"}
//                       </label>
//                       <span style={{
//                         fontSize: "0.75rem",
//                         color: appTheme.colors.textSecondary,
//                         fontWeight: "500"
//                       }}>
//                         {imagePreviews.length}/8
//                       </span>
//                     </div>
                    
//                     {errors.images && <ErrorMessage message={errors.images} />}
                    
//                     {/* Image Previews Grid */}
//                     {imagePreviews.length > 0 && (
//                       <div
//                         style={{
//                           display: "grid",
//                           gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
//                           gap: isMobile ? "10px" : "12px",
//                           marginBottom: "16px",
//                         }}
//                       >
//                         {imagePreviews.map((preview, index) => (
//                           <div
//                             key={index}
//                             style={{
//                               position: "relative",
//                               width: "100%",
//                               aspectRatio: "1/1",
//                               border: `1px solid ${appTheme.colors.border}`,
//                               borderRadius: "6px",
//                               overflow: "hidden",
//                               backgroundColor: appTheme.colors.background
//                             }}
//                           >
//                             <img
//                               src={preview}
//                               alt={`Preview ${index + 1}`}
//                               style={{
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                               }}
//                               loading="lazy"
//                             />
//                             <button
//                               type="button"
//                               onClick={() => removeImage(index)}
//                               style={removeImageButtonStyle(isMobile)}
//                               aria-label="Remove image"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     )}

//                     {/* Upload Area */}
//                     {imagePreviews.length < 8 && (
//                       <UploadArea
//                         errors={errors}
//                         isMobile={isMobile}
//                         onImageChange={handleImageChange}
//                         appTheme={appTheme}
//                       />
//                     )}
//                   </div>

//                   {/* Video URL */}
//                   <div style={{ marginBottom: "20px" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "6px",
//                         fontWeight: "500",
//                         fontSize: isMobile ? "0.9rem" : "0.875rem",
//                         color: appTheme.colors.textPrimary
//                       }}
//                       htmlFor="videoUrl"
//                     >
//                       Product Video URL
//                     </label>
//                     <input
//                       type="url"
//                       id="videoUrl"
//                       name="videoUrl"
//                       value={formData.videoUrl}
//                       onChange={handleInputChange}
//                       style={inputStyle(null, isMobile)}
//                       placeholder="https://youtube.com/watch?v=..."
//                     />
//                     <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
//                       YouTube or Vimeo link
//                     </small>
//                   </div>
//                 </div>
//               )}

//               {/* Specifications Tab */}
//               {(activeTab === "specs" || isMobile) && (
//                 <div className="tab-content">
//                   <h3 style={{
//                     fontSize: "1.1rem",
//                     fontWeight: "600",
//                     color: appTheme.colors.textPrimary,
//                     marginBottom: "20px",
//                     paddingBottom: "10px",
//                     borderBottom: `1px solid ${appTheme.colors.border}`
//                   }}>
//                     Specifications
//                   </h3>

//                   {/* Add Specification */}
//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr" : "2fr 2fr auto", 
//                     gap: "10px",
//                     marginBottom: "20px" 
//                   }}>
//                     <input
//                       type="text"
//                       placeholder="Specification name"
//                       value={specKey}
//                       onChange={(e) => setSpecKey(e.target.value)}
//                       style={inputStyle(null, isMobile)}
//                     />
//                     <input
//                       type="text"
//                       placeholder="Specification value"
//                       value={specValue}
//                       onChange={(e) => setSpecValue(e.target.value)}
//                       style={inputStyle(null, isMobile)}
//                     />
//                     <button
//                       type="button"
//                       onClick={addSpecification}
//                       style={{
//                         padding: isMobile ? "14px" : "10px",
//                         backgroundColor: appTheme.colors.primary,
//                         color: "white",
//                         border: "none",
//                         borderRadius: "6px",
//                         cursor: "pointer",
//                         fontSize: "0.875rem",
//                         fontWeight: "500",
//                         minHeight: isMobile ? "48px" : "38px"
//                       }}
//                     >
//                       Add
//                     </button>
//                   </div>

//                   {/* Specifications List */}
//                   {Object.keys(formData.specifications).length > 0 ? (
//                     <div style={{
//                       border: `1px solid ${appTheme.colors.border}`,
//                       borderRadius: "6px",
//                       overflow: "hidden"
//                     }}>
//                       {Object.entries(formData.specifications).map(([key, value], index) => (
//                         <div
//                           key={key}
//                           style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                             padding: isMobile ? "12px" : "10px",
//                             borderBottom: index < Object.keys(formData.specifications).length - 1 ? `1px solid ${appTheme.colors.border}` : "none",
//                             backgroundColor: index % 2 === 0 ? "transparent" : appTheme.colors.background
//                           }}
//                         >
//                           <div style={{ flex: 1 }}>
//                             <span style={{ fontWeight: "600", fontSize: "0.875rem" }}>{key}:</span>{' '}
//                             <span style={{ fontSize: "0.875rem" }}>{value}</span>
//                           </div>
//                           <button
//                             type="button"
//                             onClick={() => removeSpecification(key)}
//                             style={{
//                               background: "none",
//                               border: "none",
//                               color: appTheme.colors.error,
//                               cursor: "pointer",
//                               fontSize: "1.2rem",
//                               padding: "4px 8px",
//                               minHeight: "32px"
//                             }}
//                           >
//                             ×
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <div style={{
//                       textAlign: "center",
//                       padding: "30px",
//                       color: appTheme.colors.textSecondary,
//                       border: `1px dashed ${appTheme.colors.border}`,
//                       borderRadius: "6px"
//                     }}>
//                       No specifications added yet
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* SEO Tab */}
//               {(activeTab === "seo" || isMobile) && (
//                 <div className="tab-content">
//                   <h3 style={{
//                     fontSize: "1.1rem",
//                     fontWeight: "600",
//                     color: appTheme.colors.textPrimary,
//                     marginBottom: "20px",
//                     paddingBottom: "10px",
//                     borderBottom: `1px solid ${appTheme.colors.border}`
//                   }}>
//                     SEO Settings
//                   </h3>

//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
//                     gap: isMobile ? "16px" : "20px", 
//                     marginBottom: "20px" 
//                   }}>
//                     {/* Meta Title */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="metaTitle"
//                       >
//                         Meta Title
//                       </label>
//                       <input
//                         type="text"
//                         id="metaTitle"
//                         name="metaTitle"
//                         value={formData.metaTitle}
//                         onChange={handleInputChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="SEO title (60-70 characters)"
//                         maxLength="70"
//                       />
//                     </div>

//                     {/* Meta Keywords */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="metaKeywords"
//                       >
//                         Meta Keywords
//                       </label>
//                       <input
//                         type="text"
//                         id="metaKeywords"
//                         name="metaKeywords"
//                         value={formData.metaKeywords.join(', ')}
//                         onChange={handleMetaKeywordsChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="keyword1, keyword2, keyword3"
//                       />
//                       <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
//                         Separate with commas
//                       </small>
//                     </div>
//                   </div>

//                   {/* Meta Description */}
//                   <div style={{ marginBottom: "20px" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "6px",
//                         fontWeight: "500",
//                         fontSize: isMobile ? "0.9rem" : "0.875rem",
//                         color: appTheme.colors.textPrimary
//                       }}
//                       htmlFor="metaDescription"
//                     >
//                       Meta Description
//                     </label>
//                     <textarea
//                       id="metaDescription"
//                       name="metaDescription"
//                       value={formData.metaDescription}
//                       onChange={handleInputChange}
//                       rows="3"
//                       style={textareaStyle(null, isMobile)}
//                       placeholder="SEO description (150-160 characters)"
//                       maxLength="160"
//                     />
//                   </div>

//                   {/* Product Flags */}
//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", 
//                     gap: "16px", 
//                     marginTop: "20px" 
//                   }}>
//                     <FlagCheckbox
//                       label="Featured"
//                       name="isFeatured"
//                       checked={formData.isFeatured}
//                       onChange={handleInputChange}
//                       color={appTheme.colors.warning}
//                       isMobile={isMobile}
//                     />
//                     <FlagCheckbox
//                       label="On Sale"
//                       name="isOnSale"
//                       checked={formData.isOnSale}
//                       onChange={handleInputChange}
//                       color={appTheme.colors.success}
//                       isMobile={isMobile}
//                     />
//                     <FlagCheckbox
//                       label="New Arrival"
//                       name="isNewArrival"
//                       checked={formData.isNewArrival}
//                       onChange={handleInputChange}
//                       color={appTheme.colors.info}
//                       isMobile={isMobile}
//                     />
//                     <FlagCheckbox
//                       label="Best Seller"
//                       name="isBestSeller"
//                       checked={formData.isBestSeller}
//                       onChange={handleInputChange}
//                       color={appTheme.colors.secondary}
//                       isMobile={isMobile}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* Shipping Tab */}
//               {(activeTab === "shipping" || isMobile) && (
//                 <div className="tab-content">
//                   <h3 style={{
//                     fontSize: "1.1rem",
//                     fontWeight: "600",
//                     color: appTheme.colors.textPrimary,
//                     marginBottom: "20px",
//                     paddingBottom: "10px",
//                     borderBottom: `1px solid ${appTheme.colors.border}`
//                   }}>
//                     Shipping Information
//                   </h3>

//                   <div style={{ 
//                     display: "grid", 
//                     gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
//                     gap: isMobile ? "16px" : "20px", 
//                     marginBottom: "20px" 
//                   }}>
//                     {/* Weight */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="weight"
//                       >
//                         Weight (kg)
//                       </label>
//                       <input
//                         type="number"
//                         id="weight"
//                         name="weight"
//                         step="0.01"
//                         min="0"
//                         value={formData.weight}
//                         onChange={handleInputChange}
//                         style={inputStyle(errors.weight, isMobile)}
//                         placeholder="0.00"
//                       />
//                       {errors.weight && <ErrorMessage message={errors.weight} />}
//                     </div>

//                     {/* Shipping Class */}
//                     <div>
//                       <label
//                         style={{
//                           display: "block",
//                           marginBottom: "6px",
//                           fontWeight: "500",
//                           fontSize: isMobile ? "0.9rem" : "0.875rem",
//                           color: appTheme.colors.textPrimary
//                         }}
//                         htmlFor="shippingClass"
//                       >
//                         Shipping Class
//                       </label>
//                       <input
//                         type="text"
//                         id="shippingClass"
//                         name="shippingClass"
//                         value={formData.shippingClass}
//                         onChange={handleInputChange}
//                         style={inputStyle(null, isMobile)}
//                         placeholder="e.g., Standard, Express, Fragile"
//                       />
//                     </div>
//                   </div>

//                   {/* Dimensions */}
//                   <div style={{ marginBottom: "20px" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "10px",
//                         fontWeight: "500",
//                         fontSize: isMobile ? "0.9rem" : "0.875rem",
//                         color: appTheme.colors.textPrimary
//                       }}
//                     >
//                       Package Dimensions
//                     </label>
                    
//                     <div style={{ 
//                       display: "grid", 
//                       gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr auto", 
//                       gap: "10px",
//                       alignItems: "center"
//                     }}>
//                       <input
//                         type="number"
//                         step="0.1"
//                         min="0"
//                         name="dimensions.length"
//                         value={formData.dimensions.length}
//                         onChange={handleInputChange}
//                         style={inputStyle(errors.dimensions, isMobile)}
//                         placeholder="Length"
//                       />
//                       <input
//                         type="number"
//                         step="0.1"
//                         min="0"
//                         name="dimensions.width"
//                         value={formData.dimensions.width}
//                         onChange={handleInputChange}
//                         style={inputStyle(errors.dimensions, isMobile)}
//                         placeholder="Width"
//                       />
//                       <input
//                         type="number"
//                         step="0.1"
//                         min="0"
//                         name="dimensions.height"
//                         value={formData.dimensions.height}
//                         onChange={handleInputChange}
//                         style={inputStyle(errors.dimensions, isMobile)}
//                         placeholder="Height"
//                       />
//                       <select
//                         name="dimensions.unit"
//                         value={formData.dimensions.unit}
//                         onChange={handleInputChange}
//                         style={selectStyle(null, isMobile)}
//                       >
//                         <option value="cm">cm</option>
//                         <option value="in">in</option>
//                       </select>
//                     </div>
//                     {errors.dimensions && <ErrorMessage message={errors.dimensions} />}
//                   </div>
//                 </div>
//               )}

//               {/* Desktop Submit Buttons */}
//               {!isMobile && (
//                 <div
//                   style={{
//                     display: "flex",
//                     flexDirection: "row",
//                     gap: "12px",
//                     justifyContent: "flex-end",
//                     marginTop: "32px",
//                     paddingTop: "20px",
//                     borderTop: `1px solid ${appTheme.colors.border}`,
//                   }}
//                 >
//                   <button
//                     type="button"
//                     onClick={() => router.push("/admin/products")}
//                     disabled={loading}
//                     style={cancelButtonStyle(loading)}
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading || isSubmitting}
//                     style={submitButtonStyle(loading || isSubmitting, isEditing, appTheme)}
//                   >
//                     {loading || isSubmitting ? (
//                       <>
//                         <span style={{ fontSize: "1rem" }}>⏳</span>
//                         {isEditing ? "Updating..." : "Creating..."}
//                       </>
//                     ) : (
//                       <>
//                         <span style={{ fontSize: "1rem" }}>
//                           {isEditing ? "✏️" : "➕"}
//                         </span>
//                         {isEditing ? "Update Product" : "Create Product"}
//                       </>
//                     )}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Mobile Floating Action Button */}
//       {isMobile && (
//         <div style={mobileFabStyle(appTheme)}>
//           <div style={mobileFabContainerStyle}>
//             <button
//               type="button"
//               onClick={handleBack}
//               disabled={loading}
//               style={mobileCancelButtonStyle(loading, appTheme)}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading || isSubmitting}
//               style={mobileSubmitButtonStyle(loading || isSubmitting, isEditing, appTheme)}
//             >
//               {loading || isSubmitting ? (
//                 <>
//                   <span style={{ fontSize: "1rem" }}>⏳</span>
//                   {isEditing ? "Updating..." : "Creating..."}
//                 </>
//               ) : (
//                 <>
//                   <span style={{ fontSize: "1rem" }}>
//                     {isEditing ? "✏️" : "➕"}
//                   </span>
//                   {isEditing ? "Update" : "Create"}
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Helper Components
// const ErrorMessage = ({ message }) => (
//   <div style={{
//     color: "#ef4444",
//     fontSize: "0.75rem",
//     marginTop: "4px",
//     lineHeight: 1.4
//   }}>
//     {message}
//   </div>
// );

// const FlagCheckbox = ({ label, name, checked, onChange, color, isMobile }) => (
//   <label style={{
//     display: "flex",
//     alignItems: "center",
//     gap: "8px",
//     padding: "10px",
//     border: `1px solid ${color}30`,
//     borderRadius: "6px",
//     backgroundColor: checked ? `${color}10` : "transparent",
//     cursor: "pointer"
//   }}>
//     <input
//       type="checkbox"
//       name={name}
//       checked={checked}
//       onChange={onChange}
//       style={{ width: "18px", height: "18px", cursor: "pointer" }}
//     />
//     <span style={{
//       fontSize: isMobile ? "0.9rem" : "0.875rem",
//       color: checked ? color : appTheme.colors.textPrimary,
//       fontWeight: checked ? "600" : "400"
//     }}>
//       {label}
//     </span>
//   </label>
// );

// const UploadArea = ({ errors, isMobile, onImageChange, appTheme }) => (
//   <div
//     style={{
//       border: `2px dashed ${errors.images ? "#ef4444" : appTheme.colors.border}`,
//       borderRadius: "6px",
//       padding: isMobile ? "20px 16px" : "24px",
//       textAlign: "center",
//       cursor: "pointer",
//       transition: "all 0.2s ease",
//       backgroundColor: errors.images ? "#ef444405" : appTheme.colors.background,
//       minHeight: isMobile ? "120px" : "140px",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       touchAction: "manipulation"
//     }}
//     onClick={() => document.getElementById("image-upload").click()}
//     onDragOver={(e) => {
//       e.preventDefault();
//       e.currentTarget.style.borderColor = appTheme.colors.primary;
//       e.currentTarget.style.backgroundColor = `${appTheme.colors.primary}05`;
//     }}
//     onDragLeave={(e) => {
//       e.currentTarget.style.borderColor = errors.images ? "#ef4444" : appTheme.colors.border;
//       e.currentTarget.style.backgroundColor = errors.images ? "#ef444405" : appTheme.colors.background;
//     }}
//     onDrop={(e) => {
//       e.preventDefault();
//       e.currentTarget.style.borderColor = errors.images ? "#ef4444" : appTheme.colors.border;
//       e.currentTarget.style.backgroundColor = errors.images ? "#ef444405" : appTheme.colors.background;
      
//       const files = Array.from(e.dataTransfer.files);
//       if (files.length > 0) {
//         onImageChange({ target: { files } });
//       }
//     }}
//   >
//     <input
//       type="file"
//       accept="image/*"
//       onChange={onImageChange}
//       style={{ display: "none" }}
//       id="image-upload"
//       multiple
//       capture="environment"
//     />
//     <div style={{ pointerEvents: "none" }}>
//       <div
//         style={{
//           fontSize: isMobile ? "32px" : "36px",
//           color: appTheme.colors.primary,
//           marginBottom: isMobile ? "8px" : "4px",
//           opacity: 0.8
//         }}
//       >
//         📁
//       </div>
//       <p style={{ 
//         marginBottom: "4px", 
//         fontWeight: "500",
//         color: appTheme.colors.textPrimary,
//         fontSize: isMobile ? "0.9rem" : "0.875rem"
//       }}>
//         {isMobile ? "Tap to upload images" : "Click or drag to upload images"}
//       </p>
//       <div style={{
//         fontSize: isMobile ? "0.7rem" : "0.75rem",
//         color: appTheme.colors.textSecondary,
//         lineHeight: 1.4
//       }}>
//         <div>JPEG, PNG, WebP, GIF</div>
//         <div>Max 5MB per image</div>
//       </div>
//     </div>
//   </div>
// );

// // Style helpers
// const inputStyle = (error, isMobile) => ({
//   width: "100%",
//   padding: isMobile ? "14px 16px" : "10px 12px",
//   border: `1px solid ${error ? "#ef4444" : appTheme.colors.border}`,
//   borderRadius: "6px",
//   fontSize: isMobile ? "16px" : "0.875rem",
//   backgroundColor: appTheme.colors.background,
//   color: appTheme.colors.textPrimary,
//   outline: "none",
//   transition: "border-color 0.2s",
//   minHeight: isMobile ? "48px" : "38px",
//   WebkitAppearance: "none",
//   boxSizing: "border-box"
// });

// const textareaStyle = (error, isMobile) => ({
//   width: "100%",
//   padding: isMobile ? "14px 16px" : "10px 12px",
//   border: `1px solid ${error ? "#ef4444" : appTheme.colors.border}`,
//   borderRadius: "6px",
//   fontSize: isMobile ? "16px" : "0.875rem",
//   backgroundColor: appTheme.colors.background,
//   color: appTheme.colors.textPrimary,
//   resize: "vertical",
//   outline: "none",
//   transition: "border-color 0.2s",
//   fontFamily: "inherit",
//   minHeight: isMobile ? "120px" : "80px",
//   WebkitAppearance: "none",
//   boxSizing: "border-box",
//   lineHeight: 1.5
// });

// const selectStyle = (error, isMobile) => ({
//   width: "100%",
//   padding: isMobile ? "14px 16px" : "10px 12px",
//   border: `1px solid ${error ? "#ef4444" : appTheme.colors.border}`,
//   borderRadius: "6px",
//   fontSize: isMobile ? "16px" : "0.875rem",
//   backgroundColor: appTheme.colors.background,
//   color: appTheme.colors.textPrimary,
//   outline: "none",
//   transition: "border-color 0.2s",
//   minHeight: isMobile ? "48px" : "38px",
//   cursor: "pointer"
// });

// const removeImageButtonStyle = (isMobile) => ({
//   position: "absolute",
//   top: "4px",
//   right: "4px",
//   background: "rgba(239, 68, 68, 0.95)",
//   color: "white",
//   border: "none",
//   borderRadius: "50%",
//   width: isMobile ? "32px" : "28px",
//   height: isMobile ? "32px" : "28px",
//   cursor: "pointer",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   fontSize: "18px",
//   fontWeight: "bold",
//   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//   minHeight: isMobile ? "44px" : "28px",
//   minWidth: isMobile ? "44px" : "28px",
//   WebkitTapHighlightColor: "transparent"
// });

// const cancelButtonStyle = (loading) => ({
//   padding: "8px 20px",
//   border: `1px solid ${appTheme.colors.border}`,
//   borderRadius: "6px",
//   backgroundColor: "transparent",
//   color: appTheme.colors.textPrimary,
//   cursor: loading ? "not-allowed" : "pointer",
//   fontWeight: "500",
//   fontSize: "0.875rem",
//   opacity: loading ? 0.6 : 1,
//   transition: "all 0.2s ease",
//   minHeight: "36px",
//   minWidth: "100px"
// });

// const submitButtonStyle = (disabled, isEditing, appTheme) => ({
//   padding: "8px 24px",
//   border: "none",
//   borderRadius: "6px",
//   backgroundColor: disabled ? appTheme.colors.textSecondary : appTheme.colors.primary,
//   color: "#fff",
//   cursor: disabled ? "not-allowed" : "pointer",
//   fontWeight: "500",
//   fontSize: "0.875rem",
//   opacity: disabled ? 0.7 : 1,
//   transition: "all 0.2s ease",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   gap: "6px",
//   minHeight: "36px",
//   minWidth: "140px"
// });

// const mobileFabStyle = (appTheme) => ({
//   position: "fixed",
//   bottom: 0,
//   left: 0,
//   right: 0,
//   padding: "16px",
//   backgroundColor: appTheme.colors.background,
//   borderTop: `1px solid ${appTheme.colors.border}`,
//   zIndex: 1000,
//   boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
//   flexShrink: 0,
// });

// const mobileFabContainerStyle = {
//   display: "flex",
//   gap: "12px",
//   maxWidth: "800px",
//   margin: "0 auto"
// };

// const mobileCancelButtonStyle = (loading, appTheme) => ({
//   flex: 1,
//   padding: "16px",
//   border: `1px solid ${appTheme.colors.border}`,
//   borderRadius: "8px",
//   backgroundColor: "transparent",
//   color: appTheme.colors.textPrimary,
//   cursor: loading ? "not-allowed" : "pointer",
//   fontWeight: "600",
//   fontSize: "1rem",
//   opacity: loading ? 0.6 : 1,
//   transition: "all 0.2s ease",
//   minHeight: "56px",
//   touchAction: "manipulation",
//   WebkitTapHighlightColor: "transparent"
// });

// const mobileSubmitButtonStyle = (disabled, isEditing, appTheme) => ({
//   flex: 2,
//   padding: "16px",
//   border: "none",
//   borderRadius: "8px",
//   backgroundColor: disabled ? appTheme.colors.textSecondary : appTheme.colors.primary,
//   color: "#fff",
//   cursor: disabled ? "not-allowed" : "pointer",
//   fontWeight: "600",
//   fontSize: "1rem",
//   opacity: disabled ? 0.7 : 1,
//   transition: "all 0.2s ease",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   gap: "8px",
//   minHeight: "56px",
//   touchAction: "manipulation",
//   WebkitTapHighlightColor: "transparent"
// });

// app/admin/products/productForm/page.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from 'next/head';
import { appTheme } from "../../../../src/constants/theme";
import { useAuth } from '../../../../context/AuthContext';
import {
    Save, X, ChevronRight, Layers, Layout, Info,
    CheckCircle, AlertCircle, AlertTriangle, XCircle,
    Upload, Image as ImageIcon, Package, DollarSign,
    Percent, Calendar, Tag, Box, Truck, Globe,
    Settings, Shield, Zap, Star, Heart, Award,
    ShoppingCart, Clock, MapPin, Phone, Mail,
    FileText, Edit2, Trash2, Plus, Minus, Copy,
    Check, Loader2, Camera, Video, Link2, Hash,
    AtSign, FileSignature, Palette, Brush, Sparkles,
    Crown, Gem, Diamond, Gift, ThumbsUp, ThumbsDown,
    MessageSquare, Send, Paperclip, Smile, Home,
    ArrowLeft, ArrowRight, Grid, List, RefreshCw,
    Filter, Search, MoreVertical, Download, Printer,
    Share2, Bookmark, Eye, EyeOff, Lock, Unlock,
    Key, Wifi, WifiOff, Battery, BatteryCharging,
    Cpu, HardDrive, Server, Cloud, CloudOff, Repeat,
    Shuffle, Play, Pause, Square, Circle, Triangle,
    Hexagon, Octagon, Building2, CreditCard, Landmark,
    Receipt, HeadphonesIcon, PhoneCall, MailOpen,
    MapPinHouse, Building, Store, Globe2, Facebook,
    Instagram, Twitter, Youtube, Linkedin, TwitterIcon,
    Linkedin as LinkedinIcon, ShieldCheck, ShieldAlert,
    Activity, TrendingUp, Users, Briefcase, Calendar as CalendarIcon,
    ChevronDown
} from 'lucide-react';

// ==================== CONSTANTS ====================
const SECTIONS = [
    { 
        id: 'basic', 
        title: 'Basic Information', 
        icon: Package, 
        color: appTheme.colors.primary,
        description: 'Product name, category, and description'
    },
    { 
        id: 'pricing', 
        title: 'Pricing & Stock', 
        icon: DollarSign, 
        color: appTheme.colors.secondary,
        description: 'Pricing, GST, and inventory management'
    },
    { 
        id: 'media', 
        title: 'Media', 
        icon: Camera, 
        color: appTheme.colors.warning,
        description: 'Product images and videos'
    },
    { 
        id: 'specs', 
        title: 'Specifications', 
        icon: Settings, 
        color: appTheme.colors.info,
        description: 'Technical details and attributes'
    },
    { 
        id: 'seo', 
        title: 'SEO', 
        icon: Globe, 
        color: appTheme.colors.accent,
        description: 'Search engine optimization'
    },
    { 
        id: 'shipping', 
        title: 'Shipping', 
        icon: Truck, 
        color: appTheme.colors.success,
        description: 'Weight, dimensions, and shipping class'
    }
];

// ✅ Helper to validate ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export default function ProductForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("id");
    
    const { user } = useAuth();

    // State management
    const [expandedSections, setExpandedSections] = useState(['basic']);
    const [activeTab, setActiveTab] = useState('basic');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    
    // State for custom ID display
    const [customId, setCustomId] = useState(null);
    const [formattedId, setFormattedId] = useState(null);

    // State for categories
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const [formData, setFormData] = useState({
        productName: "",
        slug: "",
        sku: "",
        hsnCode: "",
        category: "",
        subCategory: "",
        brand: "",
        mrp: "",
        discountPrice: "",
        costPrice: "",
        price: "",
        gstRate: "18",
        gstIncluded: true,
        description: "",
        shortDescription: "",
        stock: "",
        lowStockThreshold: "5",
        trackInventory: true,
        allowBackorder: false,
        imageUrls: [],
        videoUrl: "",
        options: "",
        variants: [],
        specifications: {},
        metaTitle: "",
        metaDescription: "",
        metaKeywords: [],
        isFeatured: false,
        isOnSale: false,
        isNewArrival: false,
        isBestSeller: false,
        weight: "",
        dimensions: {
            length: "",
            width: "",
            height: "",
            unit: "cm"
        },
        maxOrderQuantity: "10",
        taxClass: "standard",
        shippingClass: ""
    });
    
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [specKey, setSpecKey] = useState("");
    const [specValue, setSpecValue] = useState("");

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(checkMobile, 150);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
        };
    }, []);

    // Toast auto-hide
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, type: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Fetch categories on mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (formData.category && isValidObjectId(formData.category)) {
            fetchSubCategories(formData.category);
        } else {
            setSubCategories([]);
        }
    }, [formData.category]);

    // Fetch product data if editing
    useEffect(() => {
        if (productId) {
            setIsEditing(true);
            fetchProduct();
        } else {
            generateSKU();
        }
    }, [productId]);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const generateSKU = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        setFormData(prev => ({
            ...prev,
            sku: `PRD-${timestamp}-${random}`
        }));
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    // Format custom ID to 5-digit format (00123)
    const formatCustomId = (id) => {
        if (!id && id !== 0) return null;
        return String(id).padStart(5, '0');
    };

    // Fetch all categories
    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const res = await fetch('/api/masters?type=categories&format=flat');
            const data = await res.json();
            if (data.success) {
                // Filter only main categories (level === 0) for main dropdown
                const mainCategories = data.data.filter(c => c.level === 0);
                setCategories(mainCategories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            showToast('error', 'Failed to load categories');
        } finally {
            setLoadingCategories(false);
        }
    };

    // Fetch subcategories for selected category
    const fetchSubCategories = async (categoryId) => {
        if (!categoryId || !isValidObjectId(categoryId)) return;
        
        try {
            const res = await fetch(`/api/masters?type=categories&parentId=${categoryId}`);
            const data = await res.json();
            if (data.success) {
                setSubCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch subcategories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/products?id=${productId}`);
            const data = await res.json();
            
            if (data.success) {
                const product = data.data;
                
                // Set custom ID if available
                if (product.customId) {
                    setCustomId(product.customId);
                    setFormattedId(formatCustomId(product.customId));
                }

                // Handle category and subCategory (they come as populated objects)
                const categoryId = product.category?._id || product.category || "";
                const subCategoryId = product.subCategory?._id || product.subCategory || "";

                setFormData({
                    productName: product.productName || "",
                    slug: product.slug || "",
                    sku: product.sku || "",
                    hsnCode: product.hsnCode || "",
                    category: categoryId,
                    subCategory: subCategoryId,
                    brand: product.brand || "",
                    mrp: product.mrp?.toString() || "",
                    discountPrice: product.discountPrice?.toString() || "",
                    costPrice: product.costPrice?.toString() || "",
                    price: product.discountPrice?.toString() || "",
                    gstRate: product.gstRate?.toString() || "18",
                    gstIncluded: product.gstIncluded !== false,
                    description: product.description || "",
                    shortDescription: product.shortDescription || "",
                    stock: product.stock?.toString() || "",
                    lowStockThreshold: product.lowStockThreshold?.toString() || "5",
                    trackInventory: product.trackInventory !== false,
                    allowBackorder: product.allowBackorder || false,
                    imageUrls: product.imageUrls || [],
                    videoUrl: product.videoUrl || "",
                    options: product.options || "",
                    variants: product.variants || [],
                    specifications: product.specifications || {},
                    metaTitle: product.metaTitle || "",
                    metaDescription: product.metaDescription || "",
                    metaKeywords: product.metaKeywords || [],
                    isFeatured: product.isFeatured || false,
                    isOnSale: product.isOnSale || false,
                    isNewArrival: product.isNewArrival || false,
                    isBestSeller: product.isBestSeller || false,
                    weight: product.weight?.toString() || "",
                    dimensions: product.dimensions || {
                        length: "",
                        width: "",
                        height: "",
                        unit: "cm"
                    },
                    maxOrderQuantity: product.maxOrderQuantity?.toString() || "10",
                    taxClass: product.taxClass || "standard",
                    shippingClass: product.shippingClass || ""
                });
                
                // Set existing images as previews
                if (product.imageUrls && product.imageUrls.length > 0) {
                    setImagePreviews(product.imageUrls);
                }
                
                showToast('success', 'Product loaded successfully');
            } else {
                showToast('error', 'Failed to fetch product: ' + data.message);
                setTimeout(() => router.push("/admin/products"), 2000);
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            showToast('error', 'Failed to load product data');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.productName.trim()) {
            newErrors.productName = "Product name is required";
        }

        if (!formData.sku.trim()) {
            newErrors.sku = "SKU is required";
        }

        if (!formData.hsnCode.trim()) {
            newErrors.hsnCode = "HSN code is required";
        }

        if (!formData.category) {
            newErrors.category = "Category is required";
        } else if (!isValidObjectId(formData.category)) {
            newErrors.category = "Invalid category selected";
        }

        // MRP validation
        if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
            newErrors.mrp = "Valid MRP is required (greater than 0)";
        }

        // Discount price validation
        if (!formData.discountPrice || parseFloat(formData.discountPrice) < 0) {
            newErrors.discountPrice = "Valid discount price is required";
        } else if (parseFloat(formData.discountPrice) > parseFloat(formData.mrp)) {
            newErrors.discountPrice = "Discount price cannot be greater than MRP";
        }

        // GST validation
        const gstRate = parseFloat(formData.gstRate);
        if (isNaN(gstRate) || gstRate < 0 || gstRate > 28) {
            newErrors.gstRate = "GST rate must be between 0 and 28";
        }

        // Stock validation
        if (!formData.stock || parseInt(formData.stock) < 0) {
            newErrors.stock = "Valid stock quantity is required (0 or more)";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }

        // Image validation
        if (imagePreviews.length === 0 && (!formData.imageUrls || formData.imageUrls.length === 0)) {
            newErrors.images = "At least one product image is required";
        }

        // Weight validation if provided
        if (formData.weight && parseFloat(formData.weight) < 0) {
            newErrors.weight = "Weight cannot be negative";
        }

        // Dimensions validation if any dimension is provided
        if (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) {
            if (!formData.dimensions.length || parseFloat(formData.dimensions.length) <= 0) {
                newErrors.dimensions = "Valid length is required";
            }
            if (!formData.dimensions.width || parseFloat(formData.dimensions.width) <= 0) {
                newErrors.dimensions = "Valid width is required";
            }
            if (!formData.dimensions.height || parseFloat(formData.dimensions.height) <= 0) {
                newErrors.dimensions = "Valid height is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (name.startsWith('dimensions.')) {
            const dimension = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                dimensions: {
                    ...prev.dimensions,
                    [dimension]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));

            // Auto-generate slug from product name
            if (name === 'productName' && !isEditing) {
                setFormData(prev => ({
                    ...prev,
                    slug: generateSlug(value)
                }));
            }

            // Update price based on discount price
            if (name === 'discountPrice') {
                setFormData(prev => ({
                    ...prev,
                    price: value
                }));
            }

            // Check if product is on sale
            if (name === 'mrp' || name === 'discountPrice') {
                const mrp = parseFloat(name === 'mrp' ? value : formData.mrp);
                const discount = parseFloat(name === 'discountPrice' ? value : formData.discountPrice);
                if (!isNaN(mrp) && !isNaN(discount)) {
                    setFormData(prev => ({
                        ...prev,
                        isOnSale: discount < mrp
                    }));
                }
            }
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleMetaKeywordsChange = (e) => {
        const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
        setFormData(prev => ({
            ...prev,
            metaKeywords: keywords
        }));
    };

    const addSpecification = () => {
        if (specKey.trim() && specValue.trim()) {
            setFormData(prev => ({
                ...prev,
                specifications: {
                    ...prev.specifications,
                    [specKey.trim()]: specValue.trim()
                }
            }));
            setSpecKey("");
            setSpecValue("");
            showToast('success', 'Specification added');
        }
    };

    const removeSpecification = (key) => {
        const newSpecs = { ...formData.specifications };
        delete newSpecs[key];
        setFormData(prev => ({
            ...prev,
            specifications: newSpecs
        }));
        showToast('success', 'Specification removed');
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Clear image error
        if (errors.images) {
            setErrors(prev => ({ ...prev, images: "" }));
        }

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            if (!validTypes.includes(file.type)) {
                showToast('error', `Invalid file type: ${file.name}. Please upload JPEG, PNG, WebP, or GIF images.`);
                return false;
            }
            
            if (file.size > maxSize) {
                showToast('error', `File too large: ${file.name}. Maximum size is 5MB.`);
                return false;
            }
            
            return true;
        });

        if (validFiles.length === 0) return;

        // Limit to 8 images maximum
        const remainingSlots = 8 - imagePreviews.length;
        const filesToAdd = validFiles.slice(0, remainingSlots);
        
        if (filesToAdd.length === 0) {
            showToast('error', "Maximum 8 images allowed per product");
            return;
        }

        if (filesToAdd.length < validFiles.length) {
            showToast('warning', `Only ${remainingSlots} image(s) can be added. ${validFiles.length - remainingSlots} skipped.`);
        }

        // Create previews for new files
        const newPreviews = [];
        const newFiles = [];

        filesToAdd.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target.result);
                
                // When all previews are ready, update state
                if (newPreviews.length === filesToAdd.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                    setImageFiles(prev => [...prev, ...filesToAdd]);
                    showToast('success', `${filesToAdd.length} image(s) added`);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        
        // If removing existing image URL, update formData
        if (index < formData.imageUrls.length) {
            const updatedImageUrls = [...formData.imageUrls];
            updatedImageUrls.splice(index, 1);
            setFormData(prev => ({
                ...prev,
                imageUrls: updatedImageUrls
            }));
        }
        showToast('success', 'Image removed');
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return [];

        const uploadedUrls = [];
        
        for (const file of imageFiles) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: uploadFormData,
                });
                
                if (!res.ok) {
                    throw new Error(`Upload failed with status: ${res.status}`);
                }
                
                const data = await res.json();
                
                if (data.success) {
                    uploadedUrls.push(data.imageUrl);
                } else {
                    throw new Error(data.message || "Upload failed");
                }
            } catch (error) {
                console.error("Upload error:", error);
                throw new Error(`Failed to upload ${file.name}: ${error.message}`);
            }
        }
        
        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showToast('error', "Please fix the errors before submitting.");
            return;
        }

        if (isSubmitting) return;
        
        setIsSubmitting(true);
        setSaving(true);

        try {
            let imageUrls = [...formData.imageUrls];

            // Upload new images if selected
            if (imageFiles.length > 0) {
                const uploadedUrls = await uploadImages();
                imageUrls = [...imageUrls, ...uploadedUrls];
            }

            // Calculate margin if cost price is provided
            let margin = null;
            if (formData.costPrice && parseFloat(formData.costPrice) > 0) {
                margin = ((parseFloat(formData.discountPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.costPrice)) * 100;
            }

            // Prepare product data with category IDs
            const productData = {
                productName: formData.productName.trim(),
                slug: formData.slug || generateSlug(formData.productName),
                sku: formData.sku.toUpperCase(),
                hsnCode: formData.hsnCode,
                category: formData.category, // This is now an ObjectId
                subCategory: formData.subCategory || undefined, // This is now an ObjectId
                brand: formData.brand.trim() || undefined,
                mrp: parseFloat(formData.mrp),
                discountPrice: parseFloat(formData.discountPrice),
                costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
                margin,
                gstRate: parseFloat(formData.gstRate),
                gstIncluded: formData.gstIncluded,
                description: formData.description.trim(),
                shortDescription: formData.shortDescription.trim() || undefined,
                stock: parseInt(formData.stock),
                lowStockThreshold: parseInt(formData.lowStockThreshold),
                trackInventory: formData.trackInventory,
                allowBackorder: formData.allowBackorder,
                imageUrls,
                videoUrl: formData.videoUrl || undefined,
                options: formData.options || undefined,
                variants: formData.variants,
                specifications: formData.specifications,
                metaTitle: formData.metaTitle || undefined,
                metaDescription: formData.metaDescription || undefined,
                metaKeywords: formData.metaKeywords,
                isFeatured: formData.isFeatured,
                isOnSale: formData.isOnSale,
                isNewArrival: formData.isNewArrival,
                isBestSeller: formData.isBestSeller,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) ? {
                    length: parseFloat(formData.dimensions.length) || 0,
                    width: parseFloat(formData.dimensions.width) || 0,
                    height: parseFloat(formData.dimensions.height) || 0,
                    unit: formData.dimensions.unit
                } : undefined,
                maxOrderQuantity: parseInt(formData.maxOrderQuantity),
                taxClass: formData.taxClass,
                shippingClass: formData.shippingClass || undefined,
                isActive: true,
                createdBy: user?.id || user?.email || 'admin',
            };

            // Add _id for updates
            if (isEditing) {
                productData._id = productId;
                productData.updatedBy = user?.id || user?.email || 'admin';
            }

            const url = "/api/products";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(productData),
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', isEditing ? "✅ Product updated successfully!" : "🎉 Product created successfully!");
                setTimeout(() => router.push("/admin/products"), 1500);
            } else {
                throw new Error(data.message || "Failed to save product");
            }
        } catch (error) {
            console.error("Error saving product:", error);
            showToast('error', `❌ Failed to save product: ${error.message}`);
        } finally {
            setSaving(false);
            setIsSubmitting(false);
        }
    };

    const handleBack = useCallback(() => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/admin/products");
        }
    }, [router]);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => {
            if (prev.includes(sectionId)) {
                return prev.filter(id => id !== sectionId);
            } else {
                return [...prev, sectionId];
            }
        });
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (!expandedSections.includes(tabId)) {
            setExpandedSections(prev => [...prev, tabId]);
        }
    };

    const expandAll = () => {
        setExpandedSections(SECTIONS.map(s => s.id));
    };

    const collapseAll = () => {
        setExpandedSections([]);
    };

    if (loading && isEditing) {
        return (
            <div className="loading-container">
                <div className="loading-grid">
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                </div>
                <p className="loading-text">Loading product data...</p>
                <style jsx>{`
                    .loading-container {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                    }
                    .loading-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 16px;
                        margin-bottom: 24px;
                    }
                    .loading-card {
                        width: 80px;
                        height: 80px;
                        background: white;
                        border-radius: 8px;
                        animation: pulse 1.5s ease-in-out infinite;
                    }
                    .loading-card:nth-child(2) {
                        animation-delay: 0.2s;
                    }
                    .loading-card:nth-child(3) {
                        animation-delay: 0.4s;
                    }
                    @keyframes pulse {
                        0%, 100% {
                            opacity: 0.6;
                            transform: scale(1);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.05);
                        }
                    }
                    .loading-text {
                        color: #64748b;
                        font-size: 0.875rem;
                        font-weight: 500;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{isEditing ? 'Edit Product' : 'Add Product'} | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Manage your product information" />
            </Head>

            <div className="product-form-page">
                {/* Toast Notification */}
                {toast.show && (
                    <div className={`toast-notification ${toast.type}`}>
                        {toast.type === 'success' ? <CheckCircle size={20} /> : 
                         toast.type === 'error' ? <AlertCircle size={20} /> : 
                         <AlertTriangle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                )}

                {/* Header */}
                <header className="page-header">
                    <div className="header-content">
                        <div className="header-left">
                            <button
                                onClick={handleBack}
                                className="back-button"
                            >
                                <ArrowLeft size={20} />
                                <span>Back</span>
                            </button>
                            <h1 className="page-title">
                                <Package size={28} className="title-icon" />
                                {isEditing ? 'Edit Product' : 'Add New Product'}
                            </h1>
                            <p className="page-description">
                                {isEditing ? 'Update your product information' : 'Fill in the details to create a new product'}
                            </p>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={expandAll}
                                className="header-action-btn"
                                title="Expand all sections"
                            >
                                <Layers size={18} />
                            </button>
                            <button
                                onClick={collapseAll}
                                className="header-action-btn"
                                title="Collapse all sections"
                            >
                                <Layout size={18} />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={saving || isSubmitting}
                                className="save-button"
                            >
                                {saving || isSubmitting ? (
                                    <>
                                        <div className="button-spinner"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Save Product</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Desktop Horizontal Tabs */}
                <div className="desktop-tabs">
                    {SECTIONS.map(section => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                className={`tab-button ${activeTab === section.id ? 'active' : ''}`}
                                onClick={() => handleTabClick(section.id)}
                            >
                                <div className="tab-icon" style={{ 
                                    backgroundColor: activeTab === section.id ? `${section.color}20` : 'transparent',
                                    color: activeTab === section.id ? section.color : '#64748b'
                                }}>
                                    <Icon size={20} />
                                </div>
                                <span className="tab-title" style={{
                                    color: activeTab === section.id ? '#0f172a' : '#64748b',
                                    fontWeight: activeTab === section.id ? '600' : '500'
                                }}>{section.title}</span>
                                {activeTab === section.id && (
                                    <div className="active-indicator" style={{ backgroundColor: section.color }}></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content */}
                <main className="main-content">
                    {/* Custom ID Display */}
                    {isEditing && customId && (
                        <div className="custom-id-card">
                            <div className="custom-id-content">
                                <div className="custom-id-icon">
                                    <Hash size={24} />
                                </div>
                                <div className="custom-id-info">
                                    <span className="custom-id-label">Product ID</span>
                                    <span className="custom-id-value">{formattedId}</span>
                                </div>
                            </div>
                            <div className="custom-id-meta">
                                <span className="meta-label">MongoDB ID:</span>
                                <span className="meta-value">{productId?.slice(-8)}</span>
                            </div>
                        </div>
                    )}

                    {/* Sections */}
                    <div className="sections-container">
                        {SECTIONS.map(section => {
                            const Icon = section.icon;
                            const isExpanded = expandedSections.includes(section.id);
                            
                            return (
                                <div key={section.id} className={`section-card ${activeTab === section.id ? 'active' : ''}`}>
                                    {/* Section Header */}
                                    <div 
                                        className="section-header"
                                        onClick={() => toggleSection(section.id)}
                                    >
                                        <div className="section-header-left">
                                            <div 
                                                className="section-icon"
                                                style={{ background: `${section.color}15`, color: section.color }}
                                            >
                                                <Icon size={20} />
                                            </div>
                                            <div className="section-title">
                                                <h2>{section.title}</h2>
                                                <p>{section.description}</p>
                                            </div>
                                        </div>
                                        <div className="section-header-right">
                                            <ChevronRight 
                                                size={20} 
                                                className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
                                                style={{
                                                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.3s ease'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Section Content */}
                                    {isExpanded && (
                                        <div className="section-content">
                                            {/* Basic Info Section */}
                                            {section.id === 'basic' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Package size={16} />
                                                            Basic Information
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Product Name <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="productName"
                                                                    value={formData.productName}
                                                                    onChange={handleInputChange}
                                                                    className={errors.productName ? 'error' : ''}
                                                                    placeholder="Enter product name"
                                                                />
                                                                {errors.productName && <span className="error-text">{errors.productName}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Slug (URL)</label>
                                                                <input
                                                                    type="text"
                                                                    name="slug"
                                                                    value={formData.slug}
                                                                    onChange={handleInputChange}
                                                                    className="input"
                                                                    placeholder="product-url-slug"
                                                                />
                                                                <span className="hint">Auto-generated from product name</span>
                                                            </div>

                                                            <div className="form-field">
                                                                <label>SKU <span className="required">*</span></label>
                                                                <div className="input-group">
                                                                    <input
                                                                        type="text"
                                                                        name="sku"
                                                                        value={formData.sku}
                                                                        onChange={handleInputChange}
                                                                        className={errors.sku ? 'error' : ''}
                                                                        placeholder="PRD-123456-ABC"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={generateSKU}
                                                                        className="generate-btn"
                                                                    >
                                                                        <RefreshCw size={16} />
                                                                    </button>
                                                                </div>
                                                                {errors.sku && <span className="error-text">{errors.sku}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>HSN Code <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="hsnCode"
                                                                    value={formData.hsnCode}
                                                                    onChange={handleInputChange}
                                                                    className={errors.hsnCode ? 'error' : ''}
                                                                    placeholder="e.g., 4901, 6307"
                                                                />
                                                                {errors.hsnCode && <span className="error-text">{errors.hsnCode}</span>}
                                                            </div>

                                                            {/* Category Dropdown */}
                                                            <div className="form-field">
                                                                <label>Category <span className="required">*</span></label>
                                                                <select
                                                                    name="category"
                                                                    value={formData.category}
                                                                    onChange={handleInputChange}
                                                                    className={errors.category ? 'error' : ''}
                                                                    disabled={loadingCategories}
                                                                >
                                                                    <option value="">Select Category</option>
                                                                    {categories.map(cat => (
                                                                        <option key={cat._id} value={cat._id}>
                                                                            {cat.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.category && <span className="error-text">{errors.category}</span>}
                                                                {loadingCategories && <span className="hint">Loading categories...</span>}
                                                            </div>

                                                            {/* SubCategory Dropdown */}
                                                            <div className="form-field">
                                                                <label>Sub Category</label>
                                                                <select
                                                                    name="subCategory"
                                                                    value={formData.subCategory}
                                                                    onChange={handleInputChange}
                                                                    disabled={!formData.category || !isValidObjectId(formData.category) || subCategories.length === 0}
                                                                >
                                                                    <option value="">Select Sub Category (Optional)</option>
                                                                    {subCategories.map(sub => (
                                                                        <option key={sub._id} value={sub._id}>
                                                                            {sub.name}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {!formData.category && (
                                                                    <span className="hint">Select a category first</span>
                                                                )}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Brand</label>
                                                                <input
                                                                    type="text"
                                                                    name="brand"
                                                                    value={formData.brand}
                                                                    onChange={handleInputChange}
                                                                    className="input"
                                                                    placeholder="Brand name"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <FileText size={16} />
                                                            Description
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Short Description</label>
                                                                <textarea
                                                                    name="shortDescription"
                                                                    value={formData.shortDescription}
                                                                    onChange={handleInputChange}
                                                                    rows="2"
                                                                    placeholder="Brief summary of the product (max 500 characters)"
                                                                    maxLength="500"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Full Description <span className="required">*</span></label>
                                                                <textarea
                                                                    name="description"
                                                                    value={formData.description}
                                                                    onChange={handleInputChange}
                                                                    rows={isMobile ? "5" : "4"}
                                                                    className={errors.description ? 'error' : ''}
                                                                    placeholder="Detailed description of your product..."
                                                                />
                                                                {errors.description && <span className="error-text">{errors.description}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Options & Customization</label>
                                                                <input
                                                                    type="text"
                                                                    name="options"
                                                                    value={formData.options}
                                                                    onChange={handleInputChange}
                                                                    placeholder="e.g., Color: Red, Size: Large, Material: Premium Paper"
                                                                />
                                                                <span className="hint">Separate options with commas for better display</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Pricing & Stock Section */}
                                            {section.id === 'pricing' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <DollarSign size={16} />
                                                            Pricing
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>MRP (₹) <span className="required">*</span></label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    name="mrp"
                                                                    value={formData.mrp}
                                                                    onChange={handleInputChange}
                                                                    className={errors.mrp ? 'error' : ''}
                                                                    placeholder="0.00"
                                                                />
                                                                {errors.mrp && <span className="error-text">{errors.mrp}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Selling Price (₹) <span className="required">*</span></label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    name="discountPrice"
                                                                    value={formData.discountPrice}
                                                                    onChange={handleInputChange}
                                                                    className={errors.discountPrice ? 'error' : ''}
                                                                    placeholder="0.00"
                                                                />
                                                                {errors.discountPrice && <span className="error-text">{errors.discountPrice}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Cost Price (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    name="costPrice"
                                                                    value={formData.costPrice}
                                                                    onChange={handleInputChange}
                                                                    placeholder="0.00"
                                                                />
                                                                <span className="hint">For margin calculation</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Percent size={16} />
                                                            Tax Settings
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>GST Rate (%) <span className="required">*</span></label>
                                                                <select
                                                                    name="gstRate"
                                                                    value={formData.gstRate}
                                                                    onChange={handleInputChange}
                                                                    className={errors.gstRate ? 'error' : ''}
                                                                >
                                                                    <option value="0">0%</option>
                                                                    <option value="5">5%</option>
                                                                    <option value="12">12%</option>
                                                                    <option value="18">18%</option>
                                                                    <option value="28">28%</option>
                                                                </select>
                                                                {errors.gstRate && <span className="error-text">{errors.gstRate}</span>}
                                                            </div>

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="gstIncluded"
                                                                        checked={formData.gstIncluded}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Price includes GST</span>
                                                                </label>
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Tax Class</label>
                                                                <select
                                                                    name="taxClass"
                                                                    value={formData.taxClass}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="standard">Standard</option>
                                                                    <option value="reduced">Reduced</option>
                                                                    <option value="zero">Zero Rated</option>
                                                                    <option value="exempt">Exempt</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Box size={16} />
                                                            Inventory
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Stock Quantity <span className="required">*</span></label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    name="stock"
                                                                    value={formData.stock}
                                                                    onChange={handleInputChange}
                                                                    className={errors.stock ? 'error' : ''}
                                                                    placeholder="0"
                                                                />
                                                                {errors.stock && <span className="error-text">{errors.stock}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Low Stock Alert At</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    name="lowStockThreshold"
                                                                    value={formData.lowStockThreshold}
                                                                    onChange={handleInputChange}
                                                                    placeholder="5"
                                                                />
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Max Order Quantity</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    name="maxOrderQuantity"
                                                                    value={formData.maxOrderQuantity}
                                                                    onChange={handleInputChange}
                                                                    placeholder="10"
                                                                />
                                                            </div>

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="trackInventory"
                                                                        checked={formData.trackInventory}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Track Inventory</span>
                                                                </label>
                                                            </div>

                                                            <div className="form-field checkbox-field">
                                                                <label className="checkbox-label">
                                                                    <input
                                                                        type="checkbox"
                                                                        name="allowBackorder"
                                                                        checked={formData.allowBackorder}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                    <span>Allow Backorder</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Media Section */}
                                            {section.id === 'media' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Camera size={16} />
                                                            Product Images
                                                        </h3>
                                                        <div className="image-section">
                                                            <div className="image-header">
                                                                <label>Product Images {!isEditing && "*"}</label>
                                                                <span className="image-count">{imagePreviews.length}/8</span>
                                                            </div>
                                                            
                                                            {errors.images && <span className="error-text">{errors.images}</span>}
                                                            
                                                            {/* Image Previews Grid */}
                                                            {imagePreviews.length > 0 && (
                                                                <div className="image-grid">
                                                                    {imagePreviews.map((preview, index) => (
                                                                        <div key={index} className="image-preview">
                                                                            <img src={preview} alt={`Preview ${index + 1}`} />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeImage(index)}
                                                                                className="remove-image-btn"
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Upload Area */}
                                                            {imagePreviews.length < 8 && (
                                                                <div 
                                                                    className="upload-area"
                                                                    onClick={() => document.getElementById("image-upload").click()}
                                                                    onDragOver={(e) => e.preventDefault()}
                                                                    onDrop={(e) => {
                                                                        e.preventDefault();
                                                                        const files = Array.from(e.dataTransfer.files);
                                                                        if (files.length > 0) {
                                                                            handleImageChange({ target: { files } });
                                                                        }
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleImageChange}
                                                                        id="image-upload"
                                                                        multiple
                                                                    />
                                                                    <Upload size={32} />
                                                                    <p>{isMobile ? "Tap to upload images" : "Click or drag to upload images"}</p>
                                                                    <span>JPEG, PNG, WebP, GIF (Max 5MB)</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Video size={16} />
                                                            Product Video
                                                        </h3>
                                                        <div className="form-field">
                                                            <label>Video URL</label>
                                                            <input
                                                                type="url"
                                                                name="videoUrl"
                                                                value={formData.videoUrl}
                                                                onChange={handleInputChange}
                                                                placeholder="https://youtube.com/watch?v=..."
                                                            />
                                                            <span className="hint">YouTube or Vimeo link</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Specifications Section */}
                                            {section.id === 'specs' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Settings size={16} />
                                                            Add Specifications
                                                        </h3>
                                                        <div className="spec-input-group">
                                                            <input
                                                                type="text"
                                                                placeholder="Specification name"
                                                                value={specKey}
                                                                onChange={(e) => setSpecKey(e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                placeholder="Specification value"
                                                                value={specValue}
                                                                onChange={(e) => setSpecValue(e.target.value)}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={addSpecification}
                                                                className="add-spec-btn"
                                                            >
                                                                <Plus size={16} />
                                                                <span>Add</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <FileText size={16} />
                                                            Specifications List
                                                        </h3>
                                                        {Object.keys(formData.specifications).length > 0 ? (
                                                            <div className="specs-list">
                                                                {Object.entries(formData.specifications).map(([key, value], index) => (
                                                                    <div key={key} className="spec-item">
                                                                        <div className="spec-content">
                                                                            <span className="spec-key">{key}:</span>
                                                                            <span className="spec-value">{value}</span>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeSpecification(key)}
                                                                            className="remove-spec-btn"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="empty-state small">
                                                                <Settings size={32} />
                                                                <p>No specifications added yet</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {/* SEO Section */}
                                            {section.id === 'seo' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Globe size={16} />
                                                            SEO Settings
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Meta Title</label>
                                                                <input
                                                                    type="text"
                                                                    name="metaTitle"
                                                                    value={formData.metaTitle}
                                                                    onChange={handleInputChange}
                                                                    placeholder="SEO title (60-70 characters)"
                                                                    maxLength="70"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Meta Description</label>
                                                                <textarea
                                                                    name="metaDescription"
                                                                    value={formData.metaDescription}
                                                                    onChange={handleInputChange}
                                                                    rows="3"
                                                                    placeholder="SEO description (150-160 characters)"
                                                                    maxLength="160"
                                                                />
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Meta Keywords</label>
                                                                <input
                                                                    type="text"
                                                                    value={formData.metaKeywords.join(', ')}
                                                                    onChange={handleMetaKeywordsChange}
                                                                    placeholder="keyword1, keyword2, keyword3"
                                                                />
                                                                <span className="hint">Separate with commas</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Award size={16} />
                                                            Product Flags
                                                        </h3>
                                                        <div className="flags-grid">
                                                            <label className={`flag-checkbox ${formData.isFeatured ? 'active' : ''}`} style={{ borderColor: appTheme.colors.warning }}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="isFeatured"
                                                                    checked={formData.isFeatured}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <Star size={16} />
                                                                <span>Featured</span>
                                                            </label>

                                                            <label className={`flag-checkbox ${formData.isOnSale ? 'active' : ''}`} style={{ borderColor: appTheme.colors.success }}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="isOnSale"
                                                                    checked={formData.isOnSale}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <Percent size={16} />
                                                                <span>On Sale</span>
                                                            </label>

                                                            <label className={`flag-checkbox ${formData.isNewArrival ? 'active' : ''}`} style={{ borderColor: appTheme.colors.info }}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="isNewArrival"
                                                                    checked={formData.isNewArrival}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <Calendar size={16} />
                                                                <span>New Arrival</span>
                                                            </label>

                                                            <label className={`flag-checkbox ${formData.isBestSeller ? 'active' : ''}`} style={{ borderColor: appTheme.colors.secondary }}>
                                                                <input
                                                                    type="checkbox"
                                                                    name="isBestSeller"
                                                                    checked={formData.isBestSeller}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <Crown size={16} />
                                                                <span>Best Seller</span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Shipping Section */}
                                            {section.id === 'shipping' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <Truck size={16} />
                                                            Shipping Details
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Weight (kg)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    name="weight"
                                                                    value={formData.weight}
                                                                    onChange={handleInputChange}
                                                                    className={errors.weight ? 'error' : ''}
                                                                    placeholder="0.00"
                                                                />
                                                                {errors.weight && <span className="error-text">{errors.weight}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Shipping Class</label>
                                                                <input
                                                                    type="text"
                                                                    name="shippingClass"
                                                                    value={formData.shippingClass}
                                                                    onChange={handleInputChange}
                                                                    placeholder="e.g., Standard, Express, Fragile"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Box size={16} />
                                                            Package Dimensions
                                                        </h3>
                                                        <div className="dimensions-grid">
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                name="dimensions.length"
                                                                value={formData.dimensions.length}
                                                                onChange={handleInputChange}
                                                                placeholder="Length"
                                                                className={errors.dimensions ? 'error' : ''}
                                                            />
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                name="dimensions.width"
                                                                value={formData.dimensions.width}
                                                                onChange={handleInputChange}
                                                                placeholder="Width"
                                                                className={errors.dimensions ? 'error' : ''}
                                                            />
                                                            <input
                                                                type="number"
                                                                step="0.1"
                                                                min="0"
                                                                name="dimensions.height"
                                                                value={formData.dimensions.height}
                                                                onChange={handleInputChange}
                                                                placeholder="Height"
                                                                className={errors.dimensions ? 'error' : ''}
                                                            />
                                                            <select
                                                                name="dimensions.unit"
                                                                value={formData.dimensions.unit}
                                                                onChange={handleInputChange}
                                                            >
                                                                <option value="cm">cm</option>
                                                                <option value="in">in</option>
                                                            </select>
                                                        </div>
                                                        {errors.dimensions && <span className="error-text">{errors.dimensions}</span>}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </main>

                {/* Mobile Save Button */}
                <div className="mobile-save">
                    <button
                        onClick={handleSubmit}
                        disabled={saving || isSubmitting}
                        className="mobile-save-btn"
                    >
                        {saving || isSubmitting ? (
                            <div className="button-spinner"></div>
                        ) : (
                            <>
                                <Save size={18} />
                                <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .product-form-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                }

                /* ==================== TOAST NOTIFICATION ==================== */
                .toast-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1100;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
                    animation: slideInRight 0.3s ease;
                    font-size: 0.875rem;
                    max-width: 400px;
                }

                .toast-notification.success {
                    border-left: 4px solid ${appTheme.colors.success};
                }

                .toast-notification.error {
                    border-left: 4px solid ${appTheme.colors.error};
                }

                .toast-notification.warning {
                    border-left: 4px solid ${appTheme.colors.warning};
                }

                .toast-notification.success svg {
                    color: ${appTheme.colors.success};
                }

                .toast-notification.error svg {
                    color: ${appTheme.colors.error};
                }

                .toast-notification.warning svg {
                    color: ${appTheme.colors.warning};
                }

                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                /* ==================== HEADER ==================== */
                .page-header {
                    background: white;
                    border-bottom: 1px solid ${appTheme.colors.border};
                    padding: 20px 24px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                }

                .header-content {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .back-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: ${appTheme.colors.primary};
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    padding: 4px 0;
                    transition: opacity 0.2s;
                    width: fit-content;
                }

                .back-button:hover {
                    opacity: 0.7;
                }

                .page-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0;
                }

                .title-icon {
                    color: ${appTheme.colors.primary};
                }

                .page-description {
                    color: #64748b;
                    font-size: 0.875rem;
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .header-action-btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f8fafc;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .header-action-btn:hover {
                    background: #f1f5f9;
                    color: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                .save-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
                }

                .save-button:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px ${appTheme.colors.primary}40;
                }

                .save-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .button-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ==================== DESKTOP TABS ==================== */
                .desktop-tabs {
                    max-width: 1200px;
                    margin: 0 auto 24px auto;
                    padding: 0 24px;
                    display: none;
                    background: white;
                    border-bottom: 2px solid #e2e8f0;
                }

                @media (min-width: 1024px) {
                    .desktop-tabs {
                        display: flex;
                        padding: 0 24px;
                        margin: 0 auto 24px auto;
                    }
                }

                .tab-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 16px 12px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    font-size: 0.875rem;
                    position: relative;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                    flex: 1;
                    min-width: 0;
                }

                .tab-button:hover {
                    background: #f8fafc;
                }

                .tab-button.active {
                    background: #f8fafc;
                    border-bottom: 2px solid;
                }

                .tab-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .tab-title {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .active-indicator {
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 2px;
                }

                /* ==================== MAIN CONTENT ==================== */
                .main-content {
                    max-width: 1200px;
                    margin: 24px auto;
                    padding: 0 24px 100px 24px;
                }

                /* ==================== CUSTOM ID CARD ==================== */
                .custom-id-card {
                    margin-bottom: 24px;
                    padding: 16px;
                    background: linear-gradient(135deg, ${appTheme.colors.primary}10, ${appTheme.colors.secondary}10);
                    border-radius: 8px;
                    border: 1px solid ${appTheme.colors.primary}30;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .custom-id-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .custom-id-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    background: ${appTheme.colors.primary};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .custom-id-info {
                    display: flex;
                    flex-direction: column;
                }

                .custom-id-label {
                    font-size: 0.75rem;
                    color: #64748b;
                }

                .custom-id-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: ${appTheme.colors.primary};
                    font-family: monospace;
                    letter-spacing: 1px;
                }

                .custom-id-meta {
                    background: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: 1px solid ${appTheme.colors.border};
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .meta-label {
                    font-weight: 600;
                    color: #0f172a;
                }

                /* ==================== SECTIONS CONTAINER ==================== */
                .sections-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .section-card {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }

                @media (min-width: 1024px) {
                    .section-card:not(.active) {
                        display: none;
                    }
                }

                .section-header {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .section-header:hover {
                    background: #f8fafc;
                }

                .section-header-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .section-icon {
                    width: 44px;
                    height: 44px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }

                .section-title h2 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .section-title p {
                    font-size: 0.75rem;
                    color: #64748b;
                    margin: 0;
                }

                .chevron-icon {
                    color: #94a3b8;
                    transition: transform 0.3s ease;
                }

                .section-content {
                    padding: 0 24px 24px 24px;
                    border-top: 1px solid ${appTheme.colors.border};
                    animation: slideDown 0.3s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* ==================== FORM BLOCKS ==================== */
                .form-block {
                    margin-bottom: 28px;
                }

                .form-block:last-child {
                    margin-bottom: 0;
                }

                .form-block h3 {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #334155;
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px dashed ${appTheme.colors.border};
                }

                .form-block h3 svg {
                    color: ${appTheme.colors.primary};
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 16px;
                }

                @media (min-width: 640px) {
                    .form-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .span-2 {
                    grid-column: 1 / -1;
                }

                .form-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-field.checkbox-field {
                    flex-direction: row;
                    align-items: center;
                    gap: 10px;
                }

                .form-field label {
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #475569;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: normal;
                    text-transform: none;
                    color: #334155;
                }

                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .form-field input,
                .form-field select,
                .form-field textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    font-size: 0.938rem;
                    transition: all 0.2s ease;
                    background: white;
                    font-family: ${appTheme.fonts.primary};
                }

                .form-field input:focus,
                .form-field select:focus,
                .form-field textarea:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
                }

                .form-field input.error,
                .form-field select.error,
                .form-field textarea.error {
                    border-color: ${appTheme.colors.error};
                }

                .error-text {
                    font-size: 0.688rem;
                    color: ${appTheme.colors.error};
                }

                .required {
                    color: ${appTheme.colors.error};
                }

                .hint {
                    font-size: 0.688rem;
                    color: #94a3b8;
                }

                .input-group {
                    display: flex;
                    gap: 8px;
                }

                .input-group input {
                    flex: 1;
                }

                .generate-btn {
                    padding: 10px 14px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    background: #f8fafc;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-height: 42px;
                    min-width: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .generate-btn:hover {
                    background: #f1f5f9;
                    color: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                /* ==================== IMAGE SECTION ==================== */
                .image-section {
                    margin-bottom: 20px;
                }

                .image-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .image-header label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #0f172a;
                }

                .image-count {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .image-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                @media (max-width: 640px) {
                    .image-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .image-preview {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1/1;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    overflow: hidden;
                    background: #f8fafc;
                }

                .image-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .remove-image-btn {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 28px;
                    height: 28px;
                    background: ${appTheme.colors.error};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .remove-image-btn:hover {
                    background: #dc2626;
                    transform: scale(1.1);
                }

                .upload-area {
                    border: 2px dashed ${appTheme.colors.border};
                    border-radius: 8px;
                    padding: 24px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: #f8fafc;
                }

                .upload-area:hover {
                    border-color: ${appTheme.colors.primary};
                    background: ${appTheme.colors.primary}05;
                }

                .upload-area input {
                    display: none;
                }

                .upload-area svg {
                    color: ${appTheme.colors.primary};
                    margin-bottom: 8px;
                }

                .upload-area p {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #0f172a;
                    margin: 0 0 4px 0;
                }

                .upload-area span {
                    font-size: 0.688rem;
                    color: #64748b;
                }

                /* ==================== SPECIFICATIONS ==================== */
                .spec-input-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr auto;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                @media (max-width: 640px) {
                    .spec-input-group {
                        grid-template-columns: 1fr;
                    }
                }

                .add-spec-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 16px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    min-height: 42px;
                }

                .add-spec-btn:hover {
                    background: #2563eb;
                }

                .specs-list {
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    overflow: hidden;
                }

                .spec-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid ${appTheme.colors.border};
                    background: white;
                }

                .spec-item:last-child {
                    border-bottom: none;
                }

                .spec-item:nth-child(even) {
                    background: #f8fafc;
                }

                .spec-content {
                    flex: 1;
                    font-size: 0.875rem;
                }

                .spec-key {
                    font-weight: 600;
                    color: #0f172a;
                }

                .spec-value {
                    color: #475569;
                    margin-left: 4px;
                }

                .remove-spec-btn {
                    background: none;
                    border: none;
                    color: ${appTheme.colors.error};
                    cursor: pointer;
                    padding: 4px;
                    min-height: 32px;
                    min-width: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }

                .remove-spec-btn:hover {
                    background: ${appTheme.colors.error}10;
                }

                /* ==================== FLAGS GRID ==================== */
                .flags-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }

                @media (max-width: 640px) {
                    .flags-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .flag-checkbox {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: white;
                }

                .flag-checkbox input {
                    display: none;
                }

                .flag-checkbox.active {
                    background: ${appTheme.colors.primary}10;
                    border-color: ${appTheme.colors.primary};
                }

                .flag-checkbox svg {
                    color: ${appTheme.colors.primary};
                }

                .flag-checkbox span {
                    font-size: 0.813rem;
                    font-weight: 500;
                    color: #0f172a;
                }

                /* ==================== DIMENSIONS ==================== */
                .dimensions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr auto;
                    gap: 10px;
                }

                @media (max-width: 640px) {
                    .dimensions-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }

                .dimensions-grid input,
                .dimensions-grid select {
                    padding: 10px 14px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    font-size: 0.938rem;
                    background: white;
                }

                .dimensions-grid input:focus,
                .dimensions-grid select:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
                }

                .dimensions-grid input.error {
                    border-color: ${appTheme.colors.error};
                }

                /* ==================== EMPTY STATE ==================== */
                .empty-state {
                    text-align: center;
                    padding: 48px 24px;
                    background: #f8fafc;
                    border-radius: 8px;
                }

                .empty-state.small {
                    padding: 32px 24px;
                }

                .empty-state svg {
                    color: #94a3b8;
                    margin-bottom: 16px;
                }

                .empty-state p {
                    font-size: 0.875rem;
                    color: #64748b;
                    margin: 0;
                }

                /* ==================== MOBILE SAVE ==================== */
                .mobile-save {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 16px;
                    background: linear-gradient(to top, #f1f5f9, transparent);
                    z-index: 100;
                }

                .mobile-save-btn {
                    width: 100%;
                    padding: 16px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 4px 20px ${appTheme.colors.primary}40;
                }

                .mobile-save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                /* ==================== RESPONSIVE ==================== */
                @media (max-width: 1024px) {
                    .stats-grid {
                        display: none;
                    }
                }

                @media (max-width: 768px) {
                    .page-header {
                        padding: 16px;
                    }

                    .header-content {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }

                    .page-title {
                        font-size: 1.25rem;
                    }

                    .page-description {
                        font-size: 0.813rem;
                    }

                    .header-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }

                    .save-button {
                        display: none;
                    }

                    .mobile-save {
                        display: block;
                    }

                    .desktop-tabs {
                        display: none;
                    }

                    .stats-grid {
                        display: none;
                    }

                    .section-header {
                        padding: 16px;
                    }

                    .section-header-left {
                        gap: 12px;
                    }

                    .section-icon {
                        width: 36px;
                        height: 36px;
                    }

                    .section-icon svg {
                        width: 18px;
                        height: 18px;
                    }

                    .section-title h2 {
                        font-size: 0.938rem;
                    }

                    .section-title p {
                        font-size: 0.688rem;
                    }

                    .section-content {
                        padding: 0 16px 16px 16px;
                    }

                    .form-block h3 {
                        font-size: 0.813rem;
                    }

                    .form-field input,
                    .form-field select,
                    .form-field textarea {
                        font-size: 16px;
                        min-height: 48px;
                    }

                    .custom-id-card {
                        flex-direction: column;
                        align-items: flex-start;
                    }

                    .custom-id-meta {
                        width: 100%;
                    }

                    .spec-input-group {
                        grid-template-columns: 1fr;
                    }

                    .add-spec-btn {
                        min-height: 48px;
                    }

                    .dimensions-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .dimensions-grid select {
                        grid-column: span 2;
                    }
                }

                @media (max-width: 480px) {
                    .main-content {
                        padding: 16px 16px 90px 16px;
                    }

                    .stats-grid {
                        display: none;
                    }

                    .image-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .flags-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .flag-checkbox {
                        padding: 10px;
                    }

                    .flag-checkbox span {
                        font-size: 0.75rem;
                    }
                }
            `}</style>
        </>
    );
}