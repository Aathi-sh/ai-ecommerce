
// "use client";
// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { appTheme } from "../../../../src/constants/theme";

// export default function ProductForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const productId = searchParams.get("id");

//   const [formData, setFormData] = useState({
//     productName: "",
//     category: "",
//     price: "",
//     description: "",
//     stock: "",
//     options: "",
//     imageUrls: []
//   });
  
//   const [imageFiles, setImageFiles] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isEditing, setIsEditing] = useState(false);

//   // Fetch product data if editing
//   useEffect(() => {
//     if (productId) {
//       setIsEditing(true);
//       fetchProduct();
//     }
//   }, [productId]);

//   const fetchProduct = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/products?id=${productId}`);
//       const data = await res.json();
      
//       if (data.success) {
//         const product = data.data;
//         setFormData({
//           productName: product.productName || "",
//           category: product.category || "",
//           price: product.price?.toString() || "",
//           description: product.description || "",
//           stock: product.stock?.toString() || "",
//           options: product.options || "",
//           imageUrls: product.imageUrls || []
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

//     if (!formData.category.trim()) {
//       newErrors.category = "Category is required";
//     }

//     if (!formData.price || parseFloat(formData.price) <= 0) {
//       newErrors.price = "Valid price is required (greater than 0)";
//     }

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

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ""
//       }));
//     }
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

//     // Limit to 4 images maximum
//     const remainingSlots = 4 - imagePreviews.length;
//     const filesToAdd = validFiles.slice(0, remainingSlots);
    
//     if (filesToAdd.length === 0) {
//       alert("Maximum 4 images allowed per product");
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

//     setLoading(true);

//     try {
//       let imageUrls = [...formData.imageUrls]; // Start with existing URLs

//       // Upload new images if selected
//       if (imageFiles.length > 0) {
//         const uploadedUrls = await uploadImages();
//         imageUrls = [...imageUrls, ...uploadedUrls];
//       }

//       // Prepare product data
//       const productData = {
//         ...formData,
//         imageUrls,
//         price: parseFloat(formData.price),
//         stock: parseInt(formData.stock),
//         isActive: true // Ensure product is active when created/updated
//       };

//       // Add _id for updates
//       if (isEditing) {
//         productData._id = productId;
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
//     }
//   };

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
//         }}
//       >
//         <div style={{ textAlign: "center" }}>
//           <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⏳</div>
//           <div style={{ 
//             fontSize: "1.125rem", 
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
//         backgroundColor: appTheme.colors.background,
//         minHeight: "100vh",
//         padding: "32px",
//         fontFamily: appTheme.fonts.primary,
//         color: appTheme.colors.textPrimary,
//       }}
//     >
//       <div
//         style={{
//           maxWidth: "800px",
//           margin: "0 auto",
//         }}
//       >
//         {/* Header */}
//         <div style={{ marginBottom: "32px" }}>
//           <button
//             onClick={() => router.push("/admin/products")}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "8px",
//               background: "none",
//               border: "none",
//               color: appTheme.colors.primary,
//               cursor: "pointer",
//               fontSize: "0.875rem",
//               fontWeight: "500",
//               marginBottom: "16px",
//               padding: "8px 0"
//             }}
//           >
//             ← Back to Products
//           </button>
          
//           <h1
//             style={{
//               color: appTheme.colors.primary,
//               fontSize: "2rem",
//               fontWeight: "700",
//               marginBottom: "8px",
//             }}
//           >
//             {isEditing ? "Edit Product" : "Add New Product"}
//           </h1>
//           <p style={{
//             color: appTheme.colors.textSecondary,
//             fontSize: "0.875rem"
//           }}>
//             {isEditing ? "Update your product information" : "Fill in the details to create a new product"}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div
//             style={{
//               backgroundColor: appTheme.colors.surface,
//               padding: "32px",
//               borderRadius: "16px",
//               boxShadow: appTheme.shadows.md,
//               border: `1px solid ${appTheme.colors.border}`,
//             }}
//           >
//             {/* Image Upload Section */}
//             <div style={{ marginBottom: "32px" }}>
//               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
//                 <label
//                   style={{
//                     display: "block",
//                     fontWeight: "600",
//                     fontSize: "0.875rem",
//                   }}
//                 >
//                   Product Images {!isEditing && "*"}
//                 </label>
//                 <span style={{
//                   fontSize: "0.75rem",
//                   color: appTheme.colors.textSecondary,
//                   fontWeight: "500"
//                 }}>
//                   {imagePreviews.length}/4 images
//                 </span>
//               </div>
              
//               {errors.images && (
//                 <div style={{
//                   color: "#ef4444",
//                   fontSize: "0.875rem",
//                   marginBottom: "12px",
//                   padding: "8px 12px",
//                   backgroundColor: "#ef444410",
//                   borderRadius: "8px",
//                   border: "1px solid #ef444420"
//                 }}>
//                   ⚠️ {errors.images}
//                 </div>
//               )}
              
//               {/* Image Previews Grid */}
//               {imagePreviews.length > 0 && (
//                 <div
//                   style={{
//                     display: "grid",
//                     gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
//                     gap: "16px",
//                     marginBottom: "20px",
//                   }}
//                 >
//                   {imagePreviews.map((preview, index) => (
//                     <div
//                       key={index}
//                       style={{
//                         position: "relative",
//                         width: "120px",
//                         height: "120px",
//                         border: `2px solid ${appTheme.colors.border}`,
//                         borderRadius: "12px",
//                         overflow: "hidden",
//                         transition: "all 0.2s ease"
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.borderColor = appTheme.colors.primary;
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.borderColor = appTheme.colors.border;
//                       }}
//                     >
//                       <img
//                         src={preview}
//                         alt={`Preview ${index + 1}`}
//                         style={{
//                           width: "100%",
//                           height: "100%",
//                           objectFit: "cover",
//                         }}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index)}
//                         style={{
//                           position: "absolute",
//                           top: "6px",
//                           right: "6px",
//                           background: "rgba(239, 68, 68, 0.9)",
//                           color: "white",
//                           border: "none",
//                           borderRadius: "50%",
//                           width: "24px",
//                           height: "24px",
//                           cursor: "pointer",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           fontSize: "14px",
//                           fontWeight: "bold",
//                           transition: "all 0.2s ease"
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.transform = "scale(1.1)";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.transform = "scale(1)";
//                         }}
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Upload Area */}
//               {imagePreviews.length < 4 && (
//                 <div
//                   style={{
//                     border: `2px dashed ${errors.images ? "#ef4444" : appTheme.colors.border}`,
//                     borderRadius: "12px",
//                     padding: "32px",
//                     textAlign: "center",
//                     cursor: "pointer",
//                     transition: "all 0.2s ease",
//                     backgroundColor: errors.images ? "#ef444405" : "transparent"
//                   }}
//                   onDragOver={(e) => {
//                     e.preventDefault();
//                     e.currentTarget.style.borderColor = appTheme.colors.primary;
//                     e.currentTarget.style.backgroundColor = appTheme.colors.background;
//                   }}
//                   onDragLeave={(e) => {
//                     e.currentTarget.style.borderColor = errors.images ? "#ef4444" : appTheme.colors.border;
//                     e.currentTarget.style.backgroundColor = errors.images ? "#ef444405" : "transparent";
//                   }}
//                   onDrop={(e) => {
//                     e.preventDefault();
//                     e.currentTarget.style.borderColor = errors.images ? "#ef4444" : appTheme.colors.border;
//                     e.currentTarget.style.backgroundColor = errors.images ? "#ef444405" : "transparent";
                    
//                     const files = Array.from(e.dataTransfer.files);
//                     if (files.length > 0) {
//                       handleImageChange({ target: { files } });
//                     }
//                   }}
//                 >
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                     style={{ display: "none" }}
//                     id="image-upload"
//                     multiple
//                   />
//                   <label
//                     htmlFor="image-upload"
//                     style={{
//                       cursor: "pointer",
//                       display: "block",
//                     }}
//                   >
//                     <div
//                       style={{
//                         fontSize: "48px",
//                         color: appTheme.colors.primary,
//                         marginBottom: "12px",
//                         opacity: 0.7
//                       }}
//                     >
//                       📁
//                     </div>
//                     <p style={{ 
//                       marginBottom: "8px", 
//                       fontWeight: "600",
//                       color: appTheme.colors.textPrimary
//                     }}>
//                       Click to upload or drag and drop
//                     </p>
//                     <p
//                       style={{
//                         fontSize: "0.875rem",
//                         color: appTheme.colors.textSecondary,
//                         marginBottom: "4px"
//                       }}
//                     >
//                       Supports: JPEG, PNG, WebP, GIF
//                     </p>
//                     <p
//                       style={{
//                         fontSize: "0.75rem",
//                         color: appTheme.colors.textSecondary,
//                       }}
//                     >
//                       Max 5MB per image • {4 - imagePreviews.length} slots remaining
//                     </p>
//                   </label>
//                 </div>
//               )}
//             </div>

//             {/* Product Details Grid */}
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
//               {/* Product Name */}
//               <div>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "8px",
//                     fontWeight: "600",
//                     fontSize: "0.875rem",
//                   }}
//                 >
//                   Product Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="productName"
//                   value={formData.productName}
//                   onChange={handleInputChange}
//                   required
//                   style={{
//                     width: "100%",
//                     padding: "12px 16px",
//                     border: `1px solid ${errors.productName ? "#ef4444" : appTheme.colors.border}`,
//                     borderRadius: "8px",
//                     fontSize: "0.875rem",
//                     backgroundColor: appTheme.colors.background,
//                     color: appTheme.colors.textPrimary,
//                     outline: "none",
//                     transition: "all 0.2s ease"
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = appTheme.colors.primary;
//                     e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = errors.productName ? "#ef4444" : appTheme.colors.border;
//                     e.target.style.boxShadow = "none";
//                   }}
//                   placeholder="Enter product name"
//                 />
//                 {errors.productName && (
//                   <div style={{
//                     color: "#ef4444",
//                     fontSize: "0.75rem",
//                     marginTop: "4px"
//                   }}>
//                     {errors.productName}
//                   </div>
//                 )}
//               </div>

//               {/* Category */}
//               <div>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "8px",
//                     fontWeight: "600",
//                     fontSize: "0.875rem",
//                   }}
//                 >
//                   Category *
//                 </label>
//                 <input
//                   type="text"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleInputChange}
//                   required
//                   style={{
//                     width: "100%",
//                     padding: "12px 16px",
//                     border: `1px solid ${errors.category ? "#ef4444" : appTheme.colors.border}`,
//                     borderRadius: "8px",
//                     fontSize: "0.875rem",
//                     backgroundColor: appTheme.colors.background,
//                     color: appTheme.colors.textPrimary,
//                     outline: "none",
//                     transition: "all 0.2s ease"
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = appTheme.colors.primary;
//                     e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = errors.category ? "#ef4444" : appTheme.colors.border;
//                     e.target.style.boxShadow = "none";
//                   }}
//                   placeholder="e.g., Posters, Stickers, Art"
//                 />
//                 {errors.category && (
//                   <div style={{
//                     color: "#ef4444",
//                     fontSize: "0.75rem",
//                     marginTop: "4px"
//                   }}>
//                     {errors.category}
//                   </div>
//                 )}
//               </div>

//               {/* Price */}
//               <div>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "8px",
//                     fontWeight: "600",
//                     fontSize: "0.875rem",
//                   }}
//                 >
//                   Price (₹) *
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0.01"
//                   name="price"
//                   value={formData.price}
//                   onChange={handleInputChange}
//                   required
//                   style={{
//                     width: "100%",
//                     padding: "12px 16px",
//                     border: `1px solid ${errors.price ? "#ef4444" : appTheme.colors.border}`,
//                     borderRadius: "8px",
//                     fontSize: "0.875rem",
//                     backgroundColor: appTheme.colors.background,
//                     color: appTheme.colors.textPrimary,
//                     outline: "none",
//                     transition: "all 0.2s ease"
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = appTheme.colors.primary;
//                     e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = errors.price ? "#ef4444" : appTheme.colors.border;
//                     e.target.style.boxShadow = "none";
//                   }}
//                   placeholder="0.00"
//                 />
//                 {errors.price && (
//                   <div style={{
//                     color: "#ef4444",
//                     fontSize: "0.75rem",
//                     marginTop: "4px"
//                   }}>
//                     {errors.price}
//                   </div>
//                 )}
//               </div>

//               {/* Stock */}
//               <div>
//                 <label
//                   style={{
//                     display: "block",
//                     marginBottom: "8px",
//                     fontWeight: "600",
//                     fontSize: "0.875rem",
//                   }}
//                 >
//                   Stock Quantity *
//                 </label>
//                 <input
//                   type="number"
//                   name="stock"
//                   min="0"
//                   value={formData.stock}
//                   onChange={handleInputChange}
//                   required
//                   style={{
//                     width: "100%",
//                     padding: "12px 16px",
//                     border: `1px solid ${errors.stock ? "#ef4444" : appTheme.colors.border}`,
//                     borderRadius: "8px",
//                     fontSize: "0.875rem",
//                     backgroundColor: appTheme.colors.background,
//                     color: appTheme.colors.textPrimary,
//                     outline: "none",
//                     transition: "all 0.2s ease"
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.borderColor = appTheme.colors.primary;
//                     e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = errors.stock ? "#ef4444" : appTheme.colors.border;
//                     e.target.style.boxShadow = "none";
//                   }}
//                   placeholder="0"
//                 />
//                 {errors.stock && (
//                   <div style={{
//                     color: "#ef4444",
//                     fontSize: "0.75rem",
//                     marginTop: "4px"
//                   }}>
//                     {errors.stock}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Description */}
//             <div style={{ marginBottom: "24px" }}>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "8px",
//                   fontWeight: "600",
//                   fontSize: "0.875rem",
//                 }}
//               >
//                 Description *
//               </label>
//               <textarea
//                 name="description"
//                 value={formData.description}
//                 onChange={handleInputChange}
//                 required
//                 rows="4"
//                 style={{
//                   width: "100%",
//                   padding: "12px 16px",
//                   border: `1px solid ${errors.description ? "#ef4444" : appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   fontSize: "0.875rem",
//                   backgroundColor: appTheme.colors.background,
//                   color: appTheme.colors.textPrimary,
//                   resize: "vertical",
//                   outline: "none",
//                   transition: "all 0.2s ease",
//                   fontFamily: "inherit"
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = appTheme.colors.primary;
//                   e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = errors.description ? "#ef4444" : appTheme.colors.border;
//                   e.target.style.boxShadow = "none";
//                 }}
//                 placeholder="Describe your product in detail..."
//               />
//               {errors.description && (
//                 <div style={{
//                   color: "#ef4444",
//                   fontSize: "0.75rem",
//                   marginTop: "4px"
//                 }}>
//                   {errors.description}
//                 </div>
//               )}
//             </div>

//             {/* Options */}
//             <div style={{ marginBottom: "32px" }}>
//               <label
//                 style={{
//                   display: "block",
//                   marginBottom: "8px",
//                   fontWeight: "600",
//                   fontSize: "0.875rem",
//                 }}
//               >
//                 Options & Customization
//               </label>
//               <input
//                 type="text"
//                 name="options"
//                 value={formData.options}
//                 onChange={handleInputChange}
//                 style={{
//                   width: "100%",
//                   padding: "12px 16px",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   fontSize: "0.875rem",
//                   backgroundColor: appTheme.colors.background,
//                   color: appTheme.colors.textPrimary,
//                   outline: "none",
//                   transition: "all 0.2s ease"
//                 }}
//                 onFocus={(e) => {
//                   e.target.style.borderColor = appTheme.colors.primary;
//                   e.target.style.boxShadow = `0 0 0 3px ${appTheme.colors.primary}20`;
//                 }}
//                 onBlur={(e) => {
//                   e.target.style.borderColor = appTheme.colors.border;
//                   e.target.style.boxShadow = "none";
//                 }}
//                 placeholder="e.g., Color: Red, Size: Large, Material: Premium Paper"
//               />
//               <div style={{
//                 fontSize: "0.75rem",
//                 color: appTheme.colors.textSecondary,
//                 marginTop: "4px"
//               }}>
//                 Separate options with commas for better display
//               </div>
//             </div>

//             {/* Submit Buttons */}
//             <div
//               style={{
//                 display: "flex",
//                 gap: "16px",
//                 justifyContent: "flex-end",
//                 paddingTop: "24px",
//                 borderTop: `1px solid ${appTheme.colors.border}`,
//               }}
//             >
//               <button
//                 type="button"
//                 onClick={() => router.push("/admin/products")}
//                 disabled={loading}
//                 style={{
//                   padding: "12px 24px",
//                   border: `1px solid ${appTheme.colors.border}`,
//                   borderRadius: "8px",
//                   backgroundColor: "transparent",
//                   color: appTheme.colors.textPrimary,
//                   cursor: loading ? "not-allowed" : "pointer",
//                   fontWeight: "600",
//                   fontSize: "0.875rem",
//                   opacity: loading ? 0.6 : 1,
//                   transition: "all 0.2s ease"
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!loading) {
//                     e.target.style.backgroundColor = appTheme.colors.background;
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.backgroundColor = "transparent";
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 style={{
//                   padding: "12px 32px",
//                   border: "none",
//                   borderRadius: "8px",
//                   backgroundColor: loading ? appTheme.colors.textSecondary : appTheme.colors.primary,
//                   color: "#fff",
//                   cursor: loading ? "not-allowed" : "pointer",
//                   fontWeight: "600",
//                   fontSize: "0.875rem",
//                   opacity: loading ? 0.7 : 1,
//                   transition: "all 0.2s ease",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "8px"
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!loading) {
//                     e.target.style.transform = "translateY(-1px)";
//                     e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   e.target.style.transform = "translateY(0)";
//                   e.target.style.boxShadow = "none";
//                 }}
//               >
//                 {loading ? (
//                   <>
//                     <span>⏳</span>
//                     {isEditing ? "Updating..." : "Creating..."}
//                   </>
//                 ) : (
//                   <>
//                     <span>{isEditing ? "✏️" : "➕"}</span>
//                     {isEditing ? "Update Product" : "Create Product"}
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appTheme } from "../../../../src/constants/theme";

export default function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    price: "",
    description: "",
    stock: "",
    options: "",
    imageUrls: []
  });
  
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile detection with debounce
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

  // Fetch product data if editing
  useEffect(() => {
    if (productId) {
      setIsEditing(true);
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products?id=${productId}`);
      const data = await res.json();
      
      if (data.success) {
        const product = data.data;
        setFormData({
          productName: product.productName || "",
          category: product.category || "",
          price: product.price?.toString() || "",
          description: product.description || "",
          stock: product.stock?.toString() || "",
          options: product.options || "",
          imageUrls: product.imageUrls || []
        });
        
        // Set existing images as previews
        if (product.imageUrls && product.imageUrls.length > 0) {
          setImagePreviews(product.imageUrls);
        }
      } else {
        alert("Failed to fetch product: " + data.message);
        router.push("/admin/products");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      alert("Failed to load product data");
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

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required (greater than 0)";
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
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
        alert(`Invalid file type: ${file.name}. Please upload JPEG, PNG, WebP, or GIF images.`);
        return false;
      }
      
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Limit to 4 images maximum
    const remainingSlots = 4 - imagePreviews.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);
    
    if (filesToAdd.length === 0) {
      alert("Maximum 4 images allowed per product");
      return;
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
      alert("Please fix the errors before submitting.");
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setLoading(true);

    try {
      let imageUrls = [...formData.imageUrls]; // Start with existing URLs

      // Upload new images if selected
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      // Prepare product data
      const productData = {
        ...formData,
        imageUrls,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        isActive: true // Ensure product is active when created/updated
      };

      // Add _id for updates
      if (isEditing) {
        productData._id = productId;
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
        alert(isEditing ? "✅ Product updated successfully!" : "🎉 Product created successfully!");
        router.push("/admin/products");
      } else {
        throw new Error(data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`❌ Failed to save product: ${error.message}`);
    } finally {
      setLoading(false);
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

  if (loading && isEditing) {
    return (
      <div
        style={{
          backgroundColor: appTheme.colors.background,
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: appTheme.fonts.primary,
          padding: isMobile ? "20px" : "40px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: isMobile ? "50px" : "60px", 
            height: isMobile ? "50px" : "60px", 
            border: `3px solid ${appTheme.colors.border}`,
            borderTop: `3px solid ${appTheme.colors.primary}`,
            borderRadius: "50%",
            margin: "0 auto 20px",
            animation: "spin 1s linear infinite"
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ 
            fontSize: isMobile ? "1rem" : "1.125rem", 
            color: appTheme.colors.textPrimary,
            fontWeight: "600"
          }}>
            Loading product data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "transparent",
        minHeight: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: appTheme.fonts.primary,
        color: appTheme.colors.textPrimary,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: appTheme.colors.background,
          borderBottom: `1px solid ${appTheme.colors.border}`,
          padding: "12px 16px",
          margin: "0 -16px 16px -16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}>
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              color: appTheme.colors.primary,
              cursor: "pointer",
              fontSize: "24px",
              padding: "8px",
              margin: "-8px",
              minHeight: "44px",
              minWidth: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-label="Go back"
          >
            ←
          </button>
          <h1 style={{
            color: appTheme.colors.primary,
            fontSize: "1.25rem",
            fontWeight: "700",
            margin: 0,
            flex: 1
          }}>
            {isEditing ? "Edit Product" : "New Product"}
          </h1>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: isMobile ? "0 16px 80px 16px" : "24px",
        height: "100%",
        minHeight: 0, // Important for flex child scrolling
      }}>
        {/* Desktop Header - NON-SCROLLABLE PART OF CONTENT */}
        {!isMobile && (
          <div style={{ 
            marginBottom: "24px",
            flexShrink: 0,
          }}>
            <button
              onClick={handleBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                color: appTheme.colors.primary,
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500",
                padding: "4px 0",
                marginBottom: "8px",
                minHeight: "32px",
                transition: "opacity 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.opacity = "0.7"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>←</span>
              <span>Back to Products</span>
            </button>
            
            <h1
              style={{
                color: appTheme.colors.textPrimary,
                fontSize: "1.75rem",
                fontWeight: "600",
                margin: "0 0 4px 0",
                lineHeight: 1.2,
                letterSpacing: "-0.01em"
              }}
            >
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
            <p style={{
              color: appTheme.colors.textSecondary,
              fontSize: "0.875rem",
              lineHeight: 1.5,
              margin: 0
            }}>
              {isEditing ? "Update your product information" : "Fill in the details to create a new product"}
            </p>
          </div>
        )}

        {/* Form Section */}
        <div style={{
          width: "100%",
        }}>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                backgroundColor: appTheme.colors.surface,
                padding: isMobile ? "20px" : "24px",
                borderRadius: isMobile ? "12px" : "8px",
                border: !isMobile ? `1px solid ${appTheme.colors.border}` : "none",
              }}
            >
              {/* Image Upload Section */}
              <div style={{ marginBottom: isMobile ? "24px" : "28px" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  marginBottom: "8px" 
                }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "600",
                      fontSize: isMobile ? "0.9rem" : "0.875rem",
                      color: appTheme.colors.textPrimary
                    }}
                  >
                    Product Images {!isEditing && "*"}
                  </label>
                  <span style={{
                    fontSize: "0.75rem",
                    color: appTheme.colors.textSecondary,
                    fontWeight: "500"
                  }}>
                    {imagePreviews.length}/4
                  </span>
                </div>
                
                {errors.images && (
                  <div style={{
                    color: "#ef4444",
                    fontSize: isMobile ? "0.8rem" : "0.875rem",
                    marginBottom: "12px",
                    padding: "8px 12px",
                    backgroundColor: "#ef444410",
                    borderRadius: "6px",
                    border: "1px solid #ef444420",
                    lineHeight: 1.4
                  }}>
                    ⚠️ {errors.images}
                  </div>
                )}
                
                {/* Image Previews Grid */}
                {imagePreviews.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                      gap: isMobile ? "10px" : "12px",
                      marginBottom: "16px",
                    }}
                  >
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "1/1",
                          border: `1px solid ${appTheme.colors.border}`,
                          borderRadius: "6px",
                          overflow: "hidden",
                          backgroundColor: appTheme.colors.background
                        }}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "rgba(239, 68, 68, 0.95)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: isMobile ? "32px" : "28px",
                            height: isMobile ? "32px" : "28px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            fontWeight: "bold",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            minHeight: isMobile ? "44px" : "28px",
                            minWidth: isMobile ? "44px" : "28px",
                            WebkitTapHighlightColor: "transparent"
                          }}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                {imagePreviews.length < 4 && (
                  <div
                    style={{
                      border: `2px dashed ${errors.images ? "#ef4444" : appTheme.colors.border}`,
                      borderRadius: "6px",
                      padding: isMobile ? "20px 16px" : "24px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      backgroundColor: errors.images ? "#ef444405" : appTheme.colors.background,
                      minHeight: isMobile ? "120px" : "140px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      touchAction: "manipulation"
                    }}
                    onClick={() => document.getElementById("image-upload").click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = appTheme.colors.primary;
                      e.currentTarget.style.backgroundColor = `${appTheme.colors.primary}05`;
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.style.borderColor = errors.images ? "#ef4444" : appTheme.colors.border;
                      e.currentTarget.style.backgroundColor = errors.images ? "#ef444405" : appTheme.colors.background;
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = errors.images ? "#ef4444" : appTheme.colors.border;
                      e.currentTarget.style.backgroundColor = errors.images ? "#ef444405" : appTheme.colors.background;
                      
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
                      style={{ display: "none" }}
                      id="image-upload"
                      multiple
                      capture="environment"
                    />
                    <div style={{ pointerEvents: "none" }}>
                      <div
                        style={{
                          fontSize: isMobile ? "32px" : "36px",
                          color: appTheme.colors.primary,
                          marginBottom: isMobile ? "8px" : "4px",
                          opacity: 0.8
                        }}
                      >
                        📁
                      </div>
                      <p style={{ 
                        marginBottom: "4px", 
                        fontWeight: "500",
                        color: appTheme.colors.textPrimary,
                        fontSize: isMobile ? "0.9rem" : "0.875rem"
                      }}>
                        {isMobile ? "Tap to upload images" : "Click or drag to upload images"}
                      </p>
                      <div style={{
                        fontSize: isMobile ? "0.7rem" : "0.75rem",
                        color: appTheme.colors.textSecondary,
                        lineHeight: 1.4
                      }}>
                        <div>JPEG, PNG, WebP, GIF</div>
                        <div>Max 5MB per image</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details Grid */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
                gap: isMobile ? "16px" : "20px", 
                marginBottom: isMobile ? "20px" : "24px" 
              }}>
                {/* Product Name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      fontSize: isMobile ? "0.9rem" : "0.875rem",
                      color: appTheme.colors.textPrimary
                    }}
                    htmlFor="productName"
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: isMobile ? "14px 16px" : "10px 12px",
                      border: `1px solid ${errors.productName ? "#ef4444" : appTheme.colors.border}`,
                      borderRadius: "6px",
                      fontSize: isMobile ? "16px" : "0.875rem",
                      backgroundColor: appTheme.colors.background,
                      color: appTheme.colors.textPrimary,
                      outline: "none",
                      transition: "border-color 0.2s",
                      minHeight: isMobile ? "48px" : "38px",
                      WebkitAppearance: "none",
                      boxSizing: "border-box"
                    }}
                    placeholder="Enter product name"
                  />
                  {errors.productName && (
                    <div style={{
                      color: "#ef4444",
                      fontSize: "0.75rem",
                      marginTop: "4px",
                      lineHeight: 1.4
                    }}>
                      {errors.productName}
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      fontSize: isMobile ? "0.9rem" : "0.875rem",
                      color: appTheme.colors.textPrimary
                    }}
                    htmlFor="category"
                  >
                    Category *
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: isMobile ? "14px 16px" : "10px 12px",
                      border: `1px solid ${errors.category ? "#ef4444" : appTheme.colors.border}`,
                      borderRadius: "6px",
                      fontSize: isMobile ? "16px" : "0.875rem",
                      backgroundColor: appTheme.colors.background,
                      color: appTheme.colors.textPrimary,
                      outline: "none",
                      transition: "border-color 0.2s",
                      minHeight: isMobile ? "48px" : "38px",
                      WebkitAppearance: "none",
                      boxSizing: "border-box"
                    }}
                    placeholder="e.g., Posters, Stickers, Art"
                  />
                  {errors.category && (
                    <div style={{
                      color: "#ef4444",
                      fontSize: "0.75rem",
                      marginTop: "4px",
                      lineHeight: 1.4
                    }}>
                      {errors.category}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      fontSize: isMobile ? "0.9rem" : "0.875rem",
                      color: appTheme.colors.textPrimary
                    }}
                    htmlFor="price"
                  >
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: isMobile ? "14px 16px" : "10px 12px",
                      border: `1px solid ${errors.price ? "#ef4444" : appTheme.colors.border}`,
                      borderRadius: "6px",
                      fontSize: isMobile ? "16px" : "0.875rem",
                      backgroundColor: appTheme.colors.background,
                      color: appTheme.colors.textPrimary,
                      outline: "none",
                      transition: "border-color 0.2s",
                      minHeight: isMobile ? "48px" : "38px",
                      WebkitAppearance: "none",
                      boxSizing: "border-box"
                    }}
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                  {errors.price && (
                    <div style={{
                      color: "#ef4444",
                      fontSize: "0.75rem",
                      marginTop: "4px",
                      lineHeight: 1.4
                    }}>
                      {errors.price}
                    </div>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      fontSize: isMobile ? "0.9rem" : "0.875rem",
                      color: appTheme.colors.textPrimary
                    }}
                    htmlFor="stock"
                  >
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: isMobile ? "14px 16px" : "10px 12px",
                      border: `1px solid ${errors.stock ? "#ef4444" : appTheme.colors.border}`,
                      borderRadius: "6px",
                      fontSize: isMobile ? "16px" : "0.875rem",
                      backgroundColor: appTheme.colors.background,
                      color: appTheme.colors.textPrimary,
                      outline: "none",
                      transition: "border-color 0.2s",
                      minHeight: isMobile ? "48px" : "38px",
                      WebkitAppearance: "none",
                      boxSizing: "border-box"
                    }}
                    placeholder="0"
                    inputMode="numeric"
                  />
                  {errors.stock && (
                    <div style={{
                      color: "#ef4444",
                      fontSize: "0.75rem",
                      marginTop: "4px",
                      lineHeight: 1.4
                    }}>
                      {errors.stock}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: isMobile ? "24px" : "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    fontSize: isMobile ? "0.9rem" : "0.875rem",
                    color: appTheme.colors.textPrimary
                  }}
                  htmlFor="description"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={isMobile ? "4" : "4"}
                  style={{
                    width: "100%",
                    padding: isMobile ? "14px 16px" : "10px 12px",
                    border: `1px solid ${errors.description ? "#ef4444" : appTheme.colors.border}`,
                    borderRadius: "6px",
                    fontSize: isMobile ? "16px" : "0.875rem",
                    backgroundColor: appTheme.colors.background,
                    color: appTheme.colors.textPrimary,
                    resize: "vertical",
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "inherit",
                    minHeight: isMobile ? "120px" : "80px",
                    WebkitAppearance: "none",
                    boxSizing: "border-box",
                    lineHeight: 1.5
                  }}
                  placeholder="Describe your product in detail..."
                />
                {errors.description && (
                  <div style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: "4px",
                    lineHeight: 1.4
                  }}>
                    {errors.description}
                  </div>
                )}
              </div>

              {/* Options */}
              <div style={{ marginBottom: isMobile ? "28px" : "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    fontSize: isMobile ? "0.9rem" : "0.875rem",
                    color: appTheme.colors.textPrimary
                  }}
                  htmlFor="options"
                >
                  Options & Customization
                </label>
                <input
                  type="text"
                  id="options"
                  name="options"
                  value={formData.options}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: isMobile ? "14px 16px" : "10px 12px",
                    border: `1px solid ${appTheme.colors.border}`,
                    borderRadius: "6px",
                    fontSize: isMobile ? "16px" : "0.875rem",
                    backgroundColor: appTheme.colors.background,
                    color: appTheme.colors.textPrimary,
                    outline: "none",
                    transition: "border-color 0.2s",
                    minHeight: isMobile ? "48px" : "38px",
                    WebkitAppearance: "none",
                    boxSizing: "border-box"
                  }}
                  placeholder="e.g., Color: Red, Size: Large, Material: Premium Paper"
                />
                <div style={{
                  fontSize: "0.75rem",
                  color: appTheme.colors.textSecondary,
                  marginTop: "4px",
                  lineHeight: 1.4
                }}>
                  Separate options with commas for better display
                </div>
              </div>

              {/* Desktop Submit Buttons */}
              {!isMobile && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "12px",
                    justifyContent: "flex-end",
                    marginTop: "8px",
                    paddingTop: "20px",
                    borderTop: `1px solid ${appTheme.colors.border}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    disabled={loading}
                    style={{
                      padding: "8px 20px",
                      border: `1px solid ${appTheme.colors.border}`,
                      borderRadius: "6px",
                      backgroundColor: "transparent",
                      color: appTheme.colors.textPrimary,
                      cursor: loading ? "not-allowed" : "pointer",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      opacity: loading ? 0.6 : 1,
                      transition: "all 0.2s ease",
                      minHeight: "36px",
                      minWidth: "100px"
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.backgroundColor = appTheme.colors.background;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    style={{
                      padding: "8px 24px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor: (loading || isSubmitting) ? appTheme.colors.textSecondary : appTheme.colors.primary,
                      color: "#fff",
                      cursor: (loading || isSubmitting) ? "not-allowed" : "pointer",
                      fontWeight: "500",
                      fontSize: "0.875rem",
                      opacity: (loading || isSubmitting) ? 0.7 : 1,
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      minHeight: "36px",
                      minWidth: "140px"
                    }}
                    onMouseEnter={(e) => {
                      if (!loading && !isSubmitting) {
                        e.target.style.backgroundColor = `${appTheme.colors.primary}dd`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading && !isSubmitting) {
                        e.target.style.backgroundColor = appTheme.colors.primary;
                      }
                    }}
                  >
                    {loading || isSubmitting ? (
                      <>
                        <span style={{ fontSize: "1rem" }}>⏳</span>
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: "1rem" }}>
                          {isEditing ? "✏️" : "➕"}
                        </span>
                        {isEditing ? "Update Product" : "Create Product"}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Floating Action Button - Fixed at bottom */}
      {isMobile && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          backgroundColor: appTheme.colors.background,
          borderTop: `1px solid ${appTheme.colors.border}`,
          zIndex: 1000,
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex",
            gap: "12px",
            maxWidth: "800px",
            margin: "0 auto"
          }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              style={{
                flex: 1,
                padding: "16px",
                border: `1px solid ${appTheme.colors.border}`,
                borderRadius: "8px",
                backgroundColor: "transparent",
                color: appTheme.colors.textPrimary,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s ease",
                minHeight: "56px",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              style={{
                flex: 2,
                padding: "16px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: loading ? appTheme.colors.textSecondary : appTheme.colors.primary,
                color: "#fff",
                cursor: (loading || isSubmitting) ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "1rem",
                opacity: (loading || isSubmitting) ? 0.7 : 1,
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                minHeight: "56px",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent"
              }}
            >
              {loading || isSubmitting ? (
                <>
                  <span style={{ fontSize: "1rem" }}>⏳</span>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <span style={{ fontSize: "1rem" }}>
                    {isEditing ? "✏️" : "➕"}
                  </span>
                  {isEditing ? "Update" : "Create"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}