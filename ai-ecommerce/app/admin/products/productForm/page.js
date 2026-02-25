// app/admin/products/productForm/page.js

"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { appTheme } from "../../../../src/constants/theme";
import { useAuth } from '../../../../context/AuthContext'; // ✅ ADD THIS IMPORT

export default function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  
  // ✅ GET THE USER FROM AUTH CONTEXT
  const { user } = useAuth();

  // ✅ State for custom ID display
  const [customId, setCustomId] = useState(null);
  const [formattedId, setFormattedId] = useState(null);

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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

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
    } else {
      // Generate a temporary SKU for new products
      generateSKU();
    }
  }, [productId]);

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

        setFormData({
          productName: product.productName || "",
          slug: product.slug || "",
          sku: product.sku || "",
          hsnCode: product.hsnCode || "",
          category: product.category || "",
          subCategory: product.subCategory || "",
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

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (!formData.hsnCode.trim()) {
      newErrors.hsnCode = "HSN code is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
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
    }
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
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

    // Limit to 8 images maximum
    const remainingSlots = 8 - imagePreviews.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);
    
    if (filesToAdd.length === 0) {
      alert("Maximum 8 images allowed per product");
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

      // Prepare product data
      const productData = {
        productName: formData.productName.trim(),
        slug: formData.slug || generateSlug(formData.productName),
        sku: formData.sku.toUpperCase(),
        hsnCode: formData.hsnCode,
        category: formData.category.trim(),
        subCategory: formData.subCategory.trim() || undefined,
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
        // ✅ Add createdBy from auth context
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

  // Tabs configuration
  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "pricing", label: "Pricing & Stock", icon: "💰" },
    { id: "media", label: "Media", icon: "🖼️" },
    { id: "specs", label: "Specifications", icon: "⚙️" },
    { id: "seo", label: "SEO", icon: "🔍" },
    { id: "shipping", label: "Shipping", icon: "📦" }
  ];

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
        minHeight: 0,
      }}>
        {/* Desktop Header */}
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

        {/* Tabs Navigation */}
        {!isMobile && (
          <div style={{
            display: "flex",
            gap: "4px",
            marginBottom: "24px",
            borderBottom: `1px solid ${appTheme.colors.border}`,
            paddingBottom: "12px",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  background: activeTab === tab.id ? appTheme.colors.primary : "transparent",
                  color: activeTab === tab.id ? "white" : appTheme.colors.textSecondary,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
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
              {/* ✅ Custom ID Display - NEW SECTION */}
              {isEditing && customId && (
                <div style={{
                  marginBottom: "24px",
                  padding: "16px",
                  background: `linear-gradient(135deg, ${appTheme.colors.primary}10, ${appTheme.colors.secondary}10)`,
                  borderRadius: "12px",
                  border: `1px solid ${appTheme.colors.primary}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: appTheme.colors.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.2rem"
                    }}>
                      #
                    </div>
                    <div>
                      <div style={{ fontSize: "0.8rem", color: appTheme.colors.textSecondary, marginBottom: "2px" }}>
                        Product ID
                      </div>
                      <div style={{ 
                        fontSize: "1.5rem", 
                        fontWeight: "700", 
                        color: appTheme.colors.primary,
                        fontFamily: "monospace",
                        letterSpacing: "1px"
                      }}>
                        {formattedId}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: appTheme.colors.background,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: `1px solid ${appTheme.colors.border}`,
                    fontSize: "0.8rem",
                    color: appTheme.colors.textSecondary
                  }}>
                    <span style={{ fontWeight: "600", color: appTheme.colors.textPrimary }}>MongoDB ID:</span> {productId?.slice(-8)}
                  </div>
                </div>
              )}

              {/* Basic Info Tab */}
              {(activeTab === "basic" || isMobile) && (
                <div className="tab-content">
                  <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: appTheme.colors.textPrimary,
                    marginBottom: "20px",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${appTheme.colors.border}`
                  }}>
                    Basic Information
                  </h3>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
                    gap: isMobile ? "16px" : "20px", 
                    marginBottom: "20px" 
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
                        style={inputStyle(errors.productName, isMobile)}
                        placeholder="Enter product name"
                      />
                      {errors.productName && <ErrorMessage message={errors.productName} />}
                    </div>

                    {/* Slug */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="slug"
                      >
                        Slug (URL)
                      </label>
                      <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="product-url-slug"
                      />
                      <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
                        Auto-generated from product name
                      </small>
                    </div>

                    {/* SKU */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="sku"
                      >
                        SKU (Stock Keeping Unit) *
                      </label>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          id="sku"
                          name="sku"
                          value={formData.sku}
                          onChange={handleInputChange}
                          required
                          style={{ ...inputStyle(errors.sku, isMobile), flex: 1 }}
                          placeholder="PRD-123456-ABC"
                        />
                        <button
                          type="button"
                          onClick={generateSKU}
                          style={{
                            padding: isMobile ? "14px 16px" : "10px 12px",
                            border: `1px solid ${appTheme.colors.border}`,
                            borderRadius: "6px",
                            background: appTheme.colors.background,
                            cursor: "pointer",
                            minHeight: isMobile ? "48px" : "38px",
                            fontSize: "0.8rem"
                          }}
                        >
                          🔄
                        </button>
                      </div>
                      {errors.sku && <ErrorMessage message={errors.sku} />}
                    </div>

                    {/* HSN Code */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="hsnCode"
                      >
                        HSN Code *
                      </label>
                      <input
                        type="text"
                        id="hsnCode"
                        name="hsnCode"
                        value={formData.hsnCode}
                        onChange={handleInputChange}
                        required
                        style={inputStyle(errors.hsnCode, isMobile)}
                        placeholder="e.g., 4901, 6307"
                      />
                      {errors.hsnCode && <ErrorMessage message={errors.hsnCode} />}
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
                        style={inputStyle(errors.category, isMobile)}
                        placeholder="e.g., Posters, Stickers, Art"
                      />
                      {errors.category && <ErrorMessage message={errors.category} />}
                    </div>

                    {/* Sub Category */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="subCategory"
                      >
                        Sub Category
                      </label>
                      <input
                        type="text"
                        id="subCategory"
                        name="subCategory"
                        value={formData.subCategory}
                        onChange={handleInputChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="e.g., Wall Posters, Vinyl Stickers"
                      />
                    </div>

                    {/* Brand */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="brand"
                      >
                        Brand
                      </label>
                      <input
                        type="text"
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="Brand name"
                      />
                    </div>
                  </div>

                  {/* Short Description */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        fontSize: isMobile ? "0.9rem" : "0.875rem",
                        color: appTheme.colors.textPrimary
                      }}
                      htmlFor="shortDescription"
                    >
                      Short Description
                    </label>
                    <textarea
                      id="shortDescription"
                      name="shortDescription"
                      value={formData.shortDescription}
                      onChange={handleInputChange}
                      rows="2"
                      style={textareaStyle(null, isMobile)}
                      placeholder="Brief summary of the product (max 500 characters)"
                      maxLength="500"
                    />
                  </div>

                  {/* Full Description */}
                  <div style={{ marginBottom: "20px" }}>
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
                      rows={isMobile ? "5" : "4"}
                      style={textareaStyle(errors.description, isMobile)}
                      placeholder="Detailed description of your product..."
                    />
                    {errors.description && <ErrorMessage message={errors.description} />}
                  </div>

                  {/* Options */}
                  <div style={{ marginBottom: "20px" }}>
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
                      style={inputStyle(null, isMobile)}
                      placeholder="e.g., Color: Red, Size: Large, Material: Premium Paper"
                    />
                    <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
                      Separate options with commas for better display
                    </small>
                  </div>
                </div>
              )}

              {/* Pricing & Stock Tab */}
              {(activeTab === "pricing" || isMobile) && (
                <div className="tab-content">
                  <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: appTheme.colors.textPrimary,
                    marginBottom: "20px",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${appTheme.colors.border}`
                  }}>
                    Pricing & Stock
                  </h3>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", 
                    gap: isMobile ? "16px" : "20px", 
                    marginBottom: "20px" 
                  }}>
                    {/* MRP */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="mrp"
                      >
                        MRP (₹) *
                      </label>
                      <input
                        type="number"
                        id="mrp"
                        step="0.01"
                        min="0.01"
                        name="mrp"
                        value={formData.mrp}
                        onChange={handleInputChange}
                        required
                        style={inputStyle(errors.mrp, isMobile)}
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                      {errors.mrp && <ErrorMessage message={errors.mrp} />}
                    </div>

                    {/* Discount Price */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="discountPrice"
                      >
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        id="discountPrice"
                        step="0.01"
                        min="0"
                        name="discountPrice"
                        value={formData.discountPrice}
                        onChange={handleInputChange}
                        required
                        style={inputStyle(errors.discountPrice, isMobile)}
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                      {errors.discountPrice && <ErrorMessage message={errors.discountPrice} />}
                    </div>

                    {/* Cost Price */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="costPrice"
                      >
                        Cost Price (₹)
                      </label>
                      <input
                        type="number"
                        id="costPrice"
                        step="0.01"
                        min="0"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleInputChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                      <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
                        For margin calculation
                      </small>
                    </div>
                  </div>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
                    gap: isMobile ? "16px" : "20px", 
                    marginBottom: "20px" 
                  }}>
                    {/* GST Rate */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="gstRate"
                      >
                        GST Rate (%) *
                      </label>
                      <select
                        id="gstRate"
                        name="gstRate"
                        value={formData.gstRate}
                        onChange={handleInputChange}
                        required
                        style={selectStyle(errors.gstRate, isMobile)}
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                      {errors.gstRate && <ErrorMessage message={errors.gstRate} />}
                    </div>

                    {/* GST Included */}
                    <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          name="gstIncluded"
                          checked={formData.gstIncluded}
                          onChange={handleInputChange}
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: isMobile ? "0.9rem" : "0.875rem" }}>
                          Price includes GST
                        </span>
                      </label>
                    </div>
                  </div>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", 
                    gap: isMobile ? "16px" : "20px", 
                    marginBottom: "20px" 
                  }}>
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
                        style={inputStyle(errors.stock, isMobile)}
                        placeholder="0"
                        inputMode="numeric"
                      />
                      {errors.stock && <ErrorMessage message={errors.stock} />}
                    </div>

                    {/* Low Stock Threshold */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="lowStockThreshold"
                      >
                        Low Stock Alert At
                      </label>
                      <input
                        type="number"
                        id="lowStockThreshold"
                        name="lowStockThreshold"
                        min="1"
                        value={formData.lowStockThreshold}
                        onChange={handleInputChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="5"
                      />
                    </div>

                    {/* Max Order Quantity */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="maxOrderQuantity"
                      >
                        Max Order Quantity
                      </label>
                      <input
                        type="number"
                        id="maxOrderQuantity"
                        name="maxOrderQuantity"
                        min="1"
                        value={formData.maxOrderQuantity}
                        onChange={handleInputChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
                    gap: isMobile ? "16px" : "20px", 
                    marginBottom: "20px" 
                  }}>
                    {/* Track Inventory */}
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          name="trackInventory"
                          checked={formData.trackInventory}
                          onChange={handleInputChange}
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: isMobile ? "0.9rem" : "0.875rem" }}>
                          Track Inventory
                        </span>
                      </label>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          name="allowBackorder"
                          checked={formData.allowBackorder}
                          onChange={handleInputChange}
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <span style={{ fontSize: isMobile ? "0.9rem" : "0.875rem" }}>
                          Allow Backorder
                        </span>
                      </label>
                    </div>

                    {/* Tax Class */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="taxClass"
                      >
                        Tax Class
                      </label>
                      <select
                        id="taxClass"
                        name="taxClass"
                        value={formData.taxClass}
                        onChange={handleInputChange}
                        style={selectStyle(null, isMobile)}
                      >
                        <option value="standard">Standard</option>
                        <option value="reduced">Reduced</option>
                        <option value="zero">Zero Rated</option>
                        <option value="exempt">Exempt</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {(activeTab === "media" || isMobile) && (
                <div className="tab-content">
                  <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: appTheme.colors.textPrimary,
                    marginBottom: "20px",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${appTheme.colors.border}`
                  }}>
                    Product Media
                  </h3>

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
                        {imagePreviews.length}/8
                      </span>
                    </div>
                    
                    {errors.images && <ErrorMessage message={errors.images} />}
                    
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
                              style={removeImageButtonStyle(isMobile)}
                              aria-label="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Area */}
                    {imagePreviews.length < 8 && (
                      <UploadArea
                        errors={errors}
                        isMobile={isMobile}
                        onImageChange={handleImageChange}
                        appTheme={appTheme}
                      />
                    )}
                  </div>

                  {/* Video URL */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        fontSize: isMobile ? "0.9rem" : "0.875rem",
                        color: appTheme.colors.textPrimary
                      }}
                      htmlFor="videoUrl"
                    >
                      Product Video URL
                    </label>
                    <input
                      type="url"
                      id="videoUrl"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleInputChange}
                      style={inputStyle(null, isMobile)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
                      YouTube or Vimeo link
                    </small>
                  </div>
                </div>
              )}

              {/* Specifications Tab */}
              {(activeTab === "specs" || isMobile) && (
                <div className="tab-content">
                  <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: appTheme.colors.textPrimary,
                    marginBottom: "20px",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${appTheme.colors.border}`
                  }}>
                    Specifications
                  </h3>

                  {/* Add Specification */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "2fr 2fr auto", 
                    gap: "10px",
                    marginBottom: "20px" 
                  }}>
                    <input
                      type="text"
                      placeholder="Specification name"
                      value={specKey}
                      onChange={(e) => setSpecKey(e.target.value)}
                      style={inputStyle(null, isMobile)}
                    />
                    <input
                      type="text"
                      placeholder="Specification value"
                      value={specValue}
                      onChange={(e) => setSpecValue(e.target.value)}
                      style={inputStyle(null, isMobile)}
                    />
                    <button
                      type="button"
                      onClick={addSpecification}
                      style={{
                        padding: isMobile ? "14px" : "10px",
                        backgroundColor: appTheme.colors.primary,
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        minHeight: isMobile ? "48px" : "38px"
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {/* Specifications List */}
                  {Object.keys(formData.specifications).length > 0 ? (
                    <div style={{
                      border: `1px solid ${appTheme.colors.border}`,
                      borderRadius: "6px",
                      overflow: "hidden"
                    }}>
                      {Object.entries(formData.specifications).map(([key, value], index) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: isMobile ? "12px" : "10px",
                            borderBottom: index < Object.keys(formData.specifications).length - 1 ? `1px solid ${appTheme.colors.border}` : "none",
                            backgroundColor: index % 2 === 0 ? "transparent" : appTheme.colors.background
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: "600", fontSize: "0.875rem" }}>{key}:</span>{' '}
                            <span style={{ fontSize: "0.875rem" }}>{value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSpecification(key)}
                            style={{
                              background: "none",
                              border: "none",
                              color: appTheme.colors.error,
                              cursor: "pointer",
                              fontSize: "1.2rem",
                              padding: "4px 8px",
                              minHeight: "32px"
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: "center",
                      padding: "30px",
                      color: appTheme.colors.textSecondary,
                      border: `1px dashed ${appTheme.colors.border}`,
                      borderRadius: "6px"
                    }}>
                      No specifications added yet
                    </div>
                  )}
                </div>
              )}

              {/* SEO Tab */}
              {(activeTab === "seo" || isMobile) && (
                <div className="tab-content">
                  <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: appTheme.colors.textPrimary,
                    marginBottom: "20px",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${appTheme.colors.border}`
                  }}>
                    SEO Settings
                  </h3>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
                    gap: isMobile ? "16px" : "20px", 
                    marginBottom: "20px" 
                  }}>
                    {/* Meta Title */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="metaTitle"
                      >
                        Meta Title
                      </label>
                      <input
                        type="text"
                        id="metaTitle"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleInputChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="SEO title (60-70 characters)"
                        maxLength="70"
                      />
                    </div>

                    {/* Meta Keywords */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="metaKeywords"
                      >
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        id="metaKeywords"
                        name="metaKeywords"
                        value={formData.metaKeywords.join(', ')}
                        onChange={handleMetaKeywordsChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                      <small style={{ fontSize: "0.7rem", color: appTheme.colors.textSecondary }}>
                        Separate with commas
                      </small>
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        fontSize: isMobile ? "0.9rem" : "0.875rem",
                        color: appTheme.colors.textPrimary
                      }}
                      htmlFor="metaDescription"
                    >
                      Meta Description
                    </label>
                    <textarea
                      id="metaDescription"
                      name="metaDescription"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                      rows="3"
                      style={textareaStyle(null, isMobile)}
                      placeholder="SEO description (150-160 characters)"
                      maxLength="160"
                    />
                  </div>

                  {/* Product Flags */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", 
                    gap: "16px", 
                    marginTop: "20px" 
                  }}>
                    <FlagCheckbox
                      label="Featured"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      color={appTheme.colors.warning}
                      isMobile={isMobile}
                    />
                    <FlagCheckbox
                      label="On Sale"
                      name="isOnSale"
                      checked={formData.isOnSale}
                      onChange={handleInputChange}
                      color={appTheme.colors.success}
                      isMobile={isMobile}
                    />
                    <FlagCheckbox
                      label="New Arrival"
                      name="isNewArrival"
                      checked={formData.isNewArrival}
                      onChange={handleInputChange}
                      color={appTheme.colors.info}
                      isMobile={isMobile}
                    />
                    <FlagCheckbox
                      label="Best Seller"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleInputChange}
                      color={appTheme.colors.secondary}
                      isMobile={isMobile}
                    />
                  </div>
                </div>
              )}

              {/* Shipping Tab */}
              {(activeTab === "shipping" || isMobile) && (
                <div className="tab-content">
                  <h3 style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    color: appTheme.colors.textPrimary,
                    marginBottom: "20px",
                    paddingBottom: "10px",
                    borderBottom: `1px solid ${appTheme.colors.border}`
                  }}>
                    Shipping Information
                  </h3>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", 
                    gap: isMobile ? "16px" : "20px", 
                    marginBottom: "20px" 
                  }}>
                    {/* Weight */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="weight"
                      >
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        step="0.01"
                        min="0"
                        value={formData.weight}
                        onChange={handleInputChange}
                        style={inputStyle(errors.weight, isMobile)}
                        placeholder="0.00"
                      />
                      {errors.weight && <ErrorMessage message={errors.weight} />}
                    </div>

                    {/* Shipping Class */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "6px",
                          fontWeight: "500",
                          fontSize: isMobile ? "0.9rem" : "0.875rem",
                          color: appTheme.colors.textPrimary
                        }}
                        htmlFor="shippingClass"
                      >
                        Shipping Class
                      </label>
                      <input
                        type="text"
                        id="shippingClass"
                        name="shippingClass"
                        value={formData.shippingClass}
                        onChange={handleInputChange}
                        style={inputStyle(null, isMobile)}
                        placeholder="e.g., Standard, Express, Fragile"
                      />
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "10px",
                        fontWeight: "500",
                        fontSize: isMobile ? "0.9rem" : "0.875rem",
                        color: appTheme.colors.textPrimary
                      }}
                    >
                      Package Dimensions
                    </label>
                    
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr auto", 
                      gap: "10px",
                      alignItems: "center"
                    }}>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        name="dimensions.length"
                        value={formData.dimensions.length}
                        onChange={handleInputChange}
                        style={inputStyle(errors.dimensions, isMobile)}
                        placeholder="Length"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        name="dimensions.width"
                        value={formData.dimensions.width}
                        onChange={handleInputChange}
                        style={inputStyle(errors.dimensions, isMobile)}
                        placeholder="Width"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        name="dimensions.height"
                        value={formData.dimensions.height}
                        onChange={handleInputChange}
                        style={inputStyle(errors.dimensions, isMobile)}
                        placeholder="Height"
                      />
                      <select
                        name="dimensions.unit"
                        value={formData.dimensions.unit}
                        onChange={handleInputChange}
                        style={selectStyle(null, isMobile)}
                      >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                    {errors.dimensions && <ErrorMessage message={errors.dimensions} />}
                  </div>
                </div>
              )}

              {/* Desktop Submit Buttons */}
              {!isMobile && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "12px",
                    justifyContent: "flex-end",
                    marginTop: "32px",
                    paddingTop: "20px",
                    borderTop: `1px solid ${appTheme.colors.border}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    disabled={loading}
                    style={cancelButtonStyle(loading)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    style={submitButtonStyle(loading || isSubmitting, isEditing, appTheme)}
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

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <div style={mobileFabStyle(appTheme)}>
          <div style={mobileFabContainerStyle}>
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              style={mobileCancelButtonStyle(loading, appTheme)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              style={mobileSubmitButtonStyle(loading || isSubmitting, isEditing, appTheme)}
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

// Helper Components
const ErrorMessage = ({ message }) => (
  <div style={{
    color: "#ef4444",
    fontSize: "0.75rem",
    marginTop: "4px",
    lineHeight: 1.4
  }}>
    {message}
  </div>
);

const FlagCheckbox = ({ label, name, checked, onChange, color, isMobile }) => (
  <label style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px",
    border: `1px solid ${color}30`,
    borderRadius: "6px",
    backgroundColor: checked ? `${color}10` : "transparent",
    cursor: "pointer"
  }}>
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      style={{ width: "18px", height: "18px", cursor: "pointer" }}
    />
    <span style={{
      fontSize: isMobile ? "0.9rem" : "0.875rem",
      color: checked ? color : appTheme.colors.textPrimary,
      fontWeight: checked ? "600" : "400"
    }}>
      {label}
    </span>
  </label>
);

const UploadArea = ({ errors, isMobile, onImageChange, appTheme }) => (
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
        onImageChange({ target: { files } });
      }
    }}
  >
    <input
      type="file"
      accept="image/*"
      onChange={onImageChange}
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
);

// Style helpers
const inputStyle = (error, isMobile) => ({
  width: "100%",
  padding: isMobile ? "14px 16px" : "10px 12px",
  border: `1px solid ${error ? "#ef4444" : appTheme.colors.border}`,
  borderRadius: "6px",
  fontSize: isMobile ? "16px" : "0.875rem",
  backgroundColor: appTheme.colors.background,
  color: appTheme.colors.textPrimary,
  outline: "none",
  transition: "border-color 0.2s",
  minHeight: isMobile ? "48px" : "38px",
  WebkitAppearance: "none",
  boxSizing: "border-box"
});

const textareaStyle = (error, isMobile) => ({
  width: "100%",
  padding: isMobile ? "14px 16px" : "10px 12px",
  border: `1px solid ${error ? "#ef4444" : appTheme.colors.border}`,
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
});

const selectStyle = (error, isMobile) => ({
  width: "100%",
  padding: isMobile ? "14px 16px" : "10px 12px",
  border: `1px solid ${error ? "#ef4444" : appTheme.colors.border}`,
  borderRadius: "6px",
  fontSize: isMobile ? "16px" : "0.875rem",
  backgroundColor: appTheme.colors.background,
  color: appTheme.colors.textPrimary,
  outline: "none",
  transition: "border-color 0.2s",
  minHeight: isMobile ? "48px" : "38px",
  cursor: "pointer"
});

const removeImageButtonStyle = (isMobile) => ({
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
});

const cancelButtonStyle = (loading) => ({
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
});

const submitButtonStyle = (disabled, isEditing, appTheme) => ({
  padding: "8px 24px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: disabled ? appTheme.colors.textSecondary : appTheme.colors.primary,
  color: "#fff",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: "500",
  fontSize: "0.875rem",
  opacity: disabled ? 0.7 : 1,
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  minHeight: "36px",
  minWidth: "140px"
});

const mobileFabStyle = (appTheme) => ({
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
});

const mobileFabContainerStyle = {
  display: "flex",
  gap: "12px",
  maxWidth: "800px",
  margin: "0 auto"
};

const mobileCancelButtonStyle = (loading, appTheme) => ({
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
});

const mobileSubmitButtonStyle = (disabled, isEditing, appTheme) => ({
  flex: 2,
  padding: "16px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: disabled ? appTheme.colors.textSecondary : appTheme.colors.primary,
  color: "#fff",
  cursor: disabled ? "not-allowed" : "pointer",
  fontWeight: "600",
  fontSize: "1rem",
  opacity: disabled ? 0.7 : 1,
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  minHeight: "56px",
  touchAction: "manipulation",
  WebkitTapHighlightColor: "transparent"
});