
// 'use client';

// import { useState, useEffect, useCallback, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Head from 'next/head';
// import { appTheme } from "../../../../src/constants/theme";
// import { useAuth } from '../../../../context/AuthContext';
// import {
//     Save, X, ChevronRight, Layers, Layout, Info,
//     CheckCircle, AlertCircle, AlertTriangle, XCircle,
//     Upload, Image as ImageIcon, Package, DollarSign,
//     Percent, Calendar, Tag, Box, Truck, Globe,
//     Settings, Shield, Zap, Star, Heart, Award,
//     ShoppingCart, Clock, MapPin, Phone, Mail,
//     FileText, Edit2, Trash2, Plus, Minus, Copy,
//     Check, Loader2, Camera, Video, Link2, Hash,
//     AtSign, FileSignature, Palette, Brush, Sparkles,
//     Crown, Gem, Diamond, Gift, ThumbsUp, ThumbsDown,
//     MessageSquare, Send, Paperclip, Smile, Home,
//     ArrowLeft, ArrowRight, Grid, List, RefreshCw,
//     Filter, Search, MoreVertical, Download, Printer,
//     Share2, Bookmark, Eye, EyeOff, Lock, Unlock,
//     Key, Wifi, WifiOff, Battery, BatteryCharging,
//     Cpu, HardDrive, Server, Cloud, CloudOff, Repeat,
//     Shuffle, Play, Pause, Square, Circle, Triangle,
//     Hexagon, Octagon, Building2, CreditCard, Landmark,
//     Receipt, HeadphonesIcon, PhoneCall, MailOpen,
//     MapPinHouse, Building, Store, Globe2, Facebook,
//     Instagram, Twitter, Youtube, Linkedin, TwitterIcon,
//     Linkedin as LinkedinIcon, ShieldCheck, ShieldAlert,
//     Activity, TrendingUp, Users, Briefcase, Calendar as CalendarIcon,
//     ChevronDown, Copy as CopyIcon
// } from 'lucide-react';

// // ==================== CONSTANTS ====================
// const TAX_RATES = [
//     { value: "0", label: "0%", description: "No tax" },
//     { value: "5", label: "5%", description: "Reduced rate" },
//     { value: "12", label: "12%", description: "Standard rate" },
//     { value: "18", label: "18%", description: "Standard rate" },
//     { value: "28", label: "28%", description: "Highest rate" }
// ];

// const TAX_CLASSES = [
//     { value: "standard", label: "Standard", icon: FileText },
//     { value: "reduced", label: "Reduced", icon: Percent },
//     { value: "zero", label: "Zero Rated", icon: Minus },
//     { value: "exempt", label: "Exempt", icon: Shield }
// ];

// const FLAGS = [
//     { id: 'isFeatured', label: 'Featured', icon: Star, color: appTheme.colors.warning },
//     { id: 'isOnSale', label: 'On Sale', icon: Percent, color: appTheme.colors.success },
//     { id: 'isNewArrival', label: 'New Arrival', icon: Calendar, color: appTheme.colors.info },
//     { id: 'isBestSeller', label: 'Best Seller', icon: Crown, color: appTheme.colors.secondary }
// ];

// // ✅ Helper to validate ObjectId
// const isValidObjectId = (id) => {
//     return /^[0-9a-fA-F]{24}$/.test(id);
// };

// export default function ProductForm() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const productId = searchParams.get("id");
    
//     // Refs for scrolling to error fields
//     const fieldRefs = useRef({});
    
//     const { user, isAuthenticated, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();

//     // Redirect if not authenticated or not company admin
//     useEffect(() => {
//         if (!isAuthenticated) {
//             router.push('/login');
//         } else if (!isCompanyAdmin && !isSuperAdmin) {
//             router.push('/dashboard');
//         }
//     }, [isAuthenticated, isCompanyAdmin, isSuperAdmin, router]);

//     // State management
//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [errors, setErrors] = useState({});
//     const [toast, setToast] = useState({ show: false, type: '', message: '' });
    
//     // State for custom ID display
//     const [customId, setCustomId] = useState(null);
//     const [formattedId, setFormattedId] = useState(null);

//     // State for categories
//     const [categories, setCategories] = useState([]);
//     const [subCategories, setSubCategories] = useState([]);
//     const [loadingCategories, setLoadingCategories] = useState(false);
//     const [companyInfo, setCompanyInfo] = useState(null);
//     const [selectedCategoryHasSubs, setSelectedCategoryHasSubs] = useState(false);

//     const [formData, setFormData] = useState({
//         productName: "",
//         slug: "",
//         sku: "",
//         hsnCode: "",
//         category: "",
//         subCategory: "",
//         brand: "",
//         mrp: "",
//         discountPrice: "",
//         costPrice: "",
//         price: "",
//         gstRate: "18",
//         gstIncluded: true,
//         description: "",
//         shortDescription: "",
//         stock: "",
//         lowStockThreshold: "5",
//         trackInventory: true,
//         allowBackorder: false,
//         imageUrls: [],
//         videoUrl: "",
//         options: "",
//         variants: [],
//         specifications: {},
//         metaTitle: "",
//         metaDescription: "",
//         metaKeywords: [],
//         isFeatured: false,
//         isOnSale: false,
//         isNewArrival: false,
//         isBestSeller: false,
//         weight: "",
//         dimensions: {
//             length: "",
//             width: "",
//             height: "",
//             unit: "cm"
//         },
//         maxOrderQuantity: "10",
//         taxClass: "standard",
//         shippingClass: ""
//     });
    
//     const [imageFiles, setImageFiles] = useState([]);
//     const [imagePreviews, setImagePreviews] = useState([]);
//     const [isEditing, setIsEditing] = useState(false);
//     const [isMobile, setIsMobile] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [specKey, setSpecKey] = useState("");
//     const [specValue, setSpecValue] = useState("");
//     const [apiError, setApiError] = useState(null);

//     // Mobile detection
//     useEffect(() => {
//         const checkMobile = () => {
//             setIsMobile(window.innerWidth < 768);
//         };
        
//         checkMobile();
        
//         let resizeTimeout;
//         const handleResize = () => {
//             clearTimeout(resizeTimeout);
//             resizeTimeout = setTimeout(checkMobile, 150);
//         };
        
//         window.addEventListener('resize', handleResize);
//         return () => {
//             window.removeEventListener('resize', handleResize);
//             clearTimeout(resizeTimeout);
//         };
//     }, []);

//     // Toast auto-hide
//     useEffect(() => {
//         if (toast.show) {
//             const timer = setTimeout(() => {
//                 setToast({ show: false, type: '', message: '' });
//             }, 3000);
//             return () => clearTimeout(timer);
//         }
//     }, [toast]);

//     // Fetch categories on mount
//     useEffect(() => {
//         if (user?.companyId) {
//             fetchCategories();
//             fetchCompanyInfo();
//         }
//     }, [user]);

//     // Fetch subcategories when category changes
//     useEffect(() => {
//         if (formData.category && isValidObjectId(formData.category)) {
//             fetchSubCategories(formData.category);
//         } else {
//             setSubCategories([]);
//             setSelectedCategoryHasSubs(false);
//         }
//     }, [formData.category]);

//     // Check if selected category has subcategories
//     useEffect(() => {
//         if (subCategories.length > 0) {
//             setSelectedCategoryHasSubs(true);
//         } else {
//             setSelectedCategoryHasSubs(false);
//         }
//     }, [subCategories]);

//     // Fetch product data if editing
//     useEffect(() => {
//         if (productId && user?.companyId) {
//             setIsEditing(true);
//             fetchProduct();
//         } else {
//             generateSKU();
//         }
//     }, [productId, user]);

//     // Scroll to first error field
//     useEffect(() => {
//         if (Object.keys(errors).length > 0) {
//             const firstErrorField = Object.keys(errors)[0];
//             if (fieldRefs.current[firstErrorField]) {
//                 fieldRefs.current[firstErrorField].scrollIntoView({
//                     behavior: 'smooth',
//                     block: 'center'
//                 });
//             }
//         }
//     }, [errors]);

//     const showToast = (type, message) => {
//         setToast({ show: true, type, message });
//     };

//     const generateSKU = () => {
//         const timestamp = Date.now().toString().slice(-6);
//         const random = Math.random().toString(36).substring(2, 5).toUpperCase();
//         setFormData(prev => ({
//             ...prev,
//             sku: `PRD-${timestamp}-${random}`
//         }));
//     };

//     const generateSlug = (name) => {
//         return name
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/g, '-')
//             .replace(/^-|-$/g, '');
//     };

//     // Format custom ID to 5-digit format (00123)
//     const formatCustomId = (id) => {
//         if (!id && id !== 0) return null;
//         return String(id).padStart(5, '0');
//     };

//     // Fetch company info
//     const fetchCompanyInfo = async () => {
//         try {
//             const res = await fetch(`/api/companies/me`, {
//                 headers: getAuthHeaders()
//             });
//             const data = await res.json();
//             if (data.success) {
//                 setCompanyInfo(data.data);
//             }
//         } catch (error) {
//             console.error('Failed to fetch company info:', error);
//         }
//     };

//     // ✅ FIXED: Fetch all categories with companyId
//     const fetchCategories = async () => {
//         if (!user?.companyId) return;
        
//         setLoadingCategories(true);
//         try {
//             const params = new URLSearchParams({
//                 companyId: user.companyId,
//                 type: 'categories',
//                 format: 'flat'
//             });
            
//             const res = await fetch(`/api/masters?${params}`, {
//                 headers: getAuthHeaders()
//             });
//             const data = await res.json();
//             if (data.success) {
//                 // Filter only main categories (level === 0) for main dropdown
//                 const mainCategories = data.data.filter(c => c.level === 0);
//                 setCategories(mainCategories);
//             }
//         } catch (error) {
//             console.error('Failed to fetch categories:', error);
//             showToast('error', 'Failed to load categories');
//         } finally {
//             setLoadingCategories(false);
//         }
//     };

//     // ✅ FIXED: Fetch subcategories with companyId
//     const fetchSubCategories = async (categoryId) => {
//         if (!categoryId || !isValidObjectId(categoryId) || !user?.companyId) return;
        
//         try {
//             const params = new URLSearchParams({
//                 companyId: user.companyId,
//                 type: 'categories',
//                 parentId: categoryId
//             });
            
//             const res = await fetch(`/api/masters?${params}`, {
//                 headers: getAuthHeaders()
//             });
//             const data = await res.json();
//             if (data.success) {
//                 setSubCategories(data.data);
//             }
//         } catch (error) {
//             console.error('Failed to fetch subcategories:', error);
//         }
//     };

//     // ✅ FIXED: Fetch product with company context
//     const fetchProduct = async () => {
//         try {
//             setLoading(true);
//             setApiError(null);
            
//             const res = await fetch(`/api/products?id=${productId}&companyId=${user?.companyId}`, {
//                 headers: getAuthHeaders()
//             });
//             const data = await res.json();
            
//             if (data.success) {
//                 const product = data.data;
                
//                 // Set custom ID if available
//                 if (product.customId) {
//                     setCustomId(product.customId);
//                     setFormattedId(formatCustomId(product.customId));
//                 }

//                 // Handle category and subCategory (they come as populated objects)
//                 const categoryId = product.category?._id || product.category || "";
//                 const subCategoryId = product.subCategory?._id || product.subCategory || "";

//                 setFormData({
//                     productName: product.productName || "",
//                     slug: product.slug || "",
//                     sku: product.sku || "",
//                     hsnCode: product.hsnCode || "",
//                     category: categoryId,
//                     subCategory: subCategoryId,
//                     brand: product.brand || "",
//                     mrp: product.mrp?.toString() || "",
//                     discountPrice: product.discountPrice?.toString() || "",
//                     costPrice: product.costPrice?.toString() || "",
//                     price: product.discountPrice?.toString() || "",
//                     gstRate: product.gstRate?.toString() || "18",
//                     gstIncluded: product.gstIncluded !== false,
//                     description: product.description || "",
//                     shortDescription: product.shortDescription || "",
//                     stock: product.stock?.toString() || "",
//                     lowStockThreshold: product.lowStockThreshold?.toString() || "5",
//                     trackInventory: product.trackInventory !== false,
//                     allowBackorder: product.allowBackorder || false,
//                     imageUrls: product.imageUrls || [],
//                     videoUrl: product.videoUrl || "",
//                     options: product.options || "",
//                     variants: product.variants || [],
//                     specifications: product.specifications || {},
//                     metaTitle: product.metaTitle || "",
//                     metaDescription: product.metaDescription || "",
//                     metaKeywords: product.metaKeywords || [],
//                     isFeatured: product.isFeatured || false,
//                     isOnSale: product.isOnSale || false,
//                     isNewArrival: product.isNewArrival || false,
//                     isBestSeller: product.isBestSeller || false,
//                     weight: product.weight?.toString() || "",
//                     dimensions: product.dimensions || {
//                         length: "",
//                         width: "",
//                         height: "",
//                         unit: "cm"
//                     },
//                     maxOrderQuantity: product.maxOrderQuantity?.toString() || "10",
//                     taxClass: product.taxClass || "standard",
//                     shippingClass: product.shippingClass || ""
//                 });
                
//                 // Set existing images as previews
//                 if (product.imageUrls && product.imageUrls.length > 0) {
//                     setImagePreviews(product.imageUrls);
//                 }
                
//                 // Fetch subcategories if category exists
//                 if (categoryId) {
//                     await fetchSubCategories(categoryId);
//                 }
                
//                 showToast('success', 'Product loaded successfully');
//             } else {
//                 if (res.status === 403) {
//                     throw new Error("You don't have permission to edit this product");
//                 }
//                 showToast('error', 'Failed to fetch product: ' + data.message);
//                 setTimeout(() => router.push("/admin/products"), 2000);
//             }
//         } catch (err) {
//             console.error("Error fetching product:", err);
//             setApiError(err.message);
//             showToast('error', err.message || 'Failed to load product data');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         // Required fields validation
//         if (!formData.productName.trim()) {
//             newErrors.productName = "Product name is required";
//         }

//         if (!formData.sku.trim()) {
//             newErrors.sku = "SKU is required";
//         }

//         if (!formData.hsnCode.trim()) {
//             newErrors.hsnCode = "HSN code is required";
//         }

//         if (!formData.category) {
//             newErrors.category = "Category is required";
//         } else if (!isValidObjectId(formData.category)) {
//             newErrors.category = "Invalid category selected";
//         }

//         // Subcategory required if category has subcategories
//         if (formData.category && selectedCategoryHasSubs) {
//             if (!formData.subCategory) {
//                 newErrors.subCategory = "Sub-category is required for this category";
//             } else if (!isValidObjectId(formData.subCategory)) {
//                 newErrors.subCategory = "Invalid sub-category selected";
//             }
//         }

//         // MRP validation
//         if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
//             newErrors.mrp = "Valid MRP is required";
//         }

//         // Discount price validation
//         if (!formData.discountPrice || parseFloat(formData.discountPrice) < 0) {
//             newErrors.discountPrice = "Valid discount price is required";
//         } else if (parseFloat(formData.discountPrice) > parseFloat(formData.mrp)) {
//             newErrors.discountPrice = "Discount price cannot be greater than MRP";
//         }

//         // GST validation
//         const gstRate = parseFloat(formData.gstRate);
//         if (isNaN(gstRate) || gstRate < 0 || gstRate > 28) {
//             newErrors.gstRate = "GST rate must be between 0 and 28";
//         }

//         // Stock validation
//         if (!formData.stock || parseInt(formData.stock) < 0) {
//             newErrors.stock = "Valid stock quantity is required";
//         }

//         if (!formData.description.trim()) {
//             newErrors.description = "Description is required";
//         }

//         // Image validation
//         if (imagePreviews.length === 0 && (!formData.imageUrls || formData.imageUrls.length === 0)) {
//             newErrors.images = "At least one product image is required";
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
        
//         if (type === 'checkbox') {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: checked
//             }));
//         } else if (name.startsWith('dimensions.')) {
//             const dimension = name.split('.')[1];
//             setFormData(prev => ({
//                 ...prev,
//                 dimensions: {
//                     ...prev.dimensions,
//                     [dimension]: value
//                 }
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: value
//             }));

//             // Auto-generate slug from product name
//             if (name === 'productName' && !isEditing) {
//                 setFormData(prev => ({
//                     ...prev,
//                     slug: generateSlug(value)
//                 }));
//             }

//             // Update price based on discount price
//             if (name === 'discountPrice') {
//                 setFormData(prev => ({
//                     ...prev,
//                     price: value
//                 }));
//             }

//             // Check if product is on sale
//             if (name === 'mrp' || name === 'discountPrice') {
//                 const mrp = parseFloat(name === 'mrp' ? value : formData.mrp);
//                 const discount = parseFloat(name === 'discountPrice' ? value : formData.discountPrice);
//                 if (!isNaN(mrp) && !isNaN(discount)) {
//                     setFormData(prev => ({
//                         ...prev,
//                         isOnSale: discount < mrp
//                     }));
//                 }
//             }

//             // Clear subcategory when category changes
//             if (name === 'category') {
//                 setFormData(prev => ({
//                     ...prev,
//                     subCategory: ""
//                 }));
//                 setSubCategories([]);
//                 setSelectedCategoryHasSubs(false);
//             }
//         }
        
//         // Clear error when user starts typing
//         if (errors[name]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [name]: ""
//             }));
//         }
//     };

//     const handleMetaKeywordsChange = (e) => {
//         const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k);
//         setFormData(prev => ({
//             ...prev,
//             metaKeywords: keywords
//         }));
//     };

//     const addSpecification = () => {
//         if (specKey.trim() && specValue.trim()) {
//             setFormData(prev => ({
//                 ...prev,
//                 specifications: {
//                     ...prev.specifications,
//                     [specKey.trim()]: specValue.trim()
//                 }
//             }));
//             setSpecKey("");
//             setSpecValue("");
//             showToast('success', 'Specification added');
//         }
//     };

//     const removeSpecification = (key) => {
//         const newSpecs = { ...formData.specifications };
//         delete newSpecs[key];
//         setFormData(prev => ({
//             ...prev,
//             specifications: newSpecs
//         }));
//         showToast('success', 'Specification removed');
//     };

//     const handleImageChange = (e) => {
//         const files = Array.from(e.target.files);
        
//         // Clear image error
//         if (errors.images) {
//             setErrors(prev => ({ ...prev, images: "" }));
//         }

//         // Validate file types and sizes
//         const validFiles = files.filter(file => {
//             const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
//             const maxSize = 5 * 1024 * 1024; // 5MB
            
//             if (!validTypes.includes(file.type)) {
//                 showToast('error', `Invalid file type: ${file.name}. Please upload JPEG, PNG, WebP, or GIF images.`);
//                 return false;
//             }
            
//             if (file.size > maxSize) {
//                 showToast('error', `File too large: ${file.name}. Maximum size is 5MB.`);
//                 return false;
//             }
            
//             return true;
//         });

//         if (validFiles.length === 0) return;

//         // Limit to 8 images maximum
//         const remainingSlots = 8 - imagePreviews.length;
//         const filesToAdd = validFiles.slice(0, remainingSlots);
        
//         if (filesToAdd.length === 0) {
//             showToast('error', "Maximum 8 images allowed per product");
//             return;
//         }

//         if (filesToAdd.length < validFiles.length) {
//             showToast('warning', `Only ${remainingSlots} image(s) can be added. ${validFiles.length - remainingSlots} skipped.`);
//         }

//         // Create previews for new files
//         const newPreviews = [];
//         const newFiles = [];

//         filesToAdd.forEach(file => {
//             const reader = new FileReader();
//             reader.onload = (e) => {
//                 newPreviews.push(e.target.result);
                
//                 // When all previews are ready, update state
//                 if (newPreviews.length === filesToAdd.length) {
//                     setImagePreviews(prev => [...prev, ...newPreviews]);
//                     setImageFiles(prev => [...prev, ...filesToAdd]);
//                     showToast('success', `${filesToAdd.length} image(s) added`);
//                 }
//             };
//             reader.readAsDataURL(file);
//         });
//     };

//     const removeImage = (index) => {
//         setImagePreviews(prev => prev.filter((_, i) => i !== index));
//         setImageFiles(prev => prev.filter((_, i) => i !== index));
        
//         // If removing existing image URL, update formData
//         if (index < formData.imageUrls.length) {
//             const updatedImageUrls = [...formData.imageUrls];
//             updatedImageUrls.splice(index, 1);
//             setFormData(prev => ({
//                 ...prev,
//                 imageUrls: updatedImageUrls
//             }));
//         }
//         showToast('success', 'Image removed');
//     };

//     const uploadImages = async () => {
//         if (imageFiles.length === 0) return [];

//         const uploadedUrls = [];
        
//         for (const file of imageFiles) {
//             const uploadFormData = new FormData();
//             uploadFormData.append("file", file);

//             try {
//                 const res = await fetch("/api/upload", {
//                     method: "POST",
//                     body: uploadFormData,
//                 });
                
//                 if (!res.ok) {
//                     throw new Error(`Upload failed with status: ${res.status}`);
//                 }
                
//                 const data = await res.json();
                
//                 if (data.success) {
//                     uploadedUrls.push(data.imageUrl);
//                 } else {
//                     throw new Error(data.message || "Upload failed");
//                 }
//             } catch (error) {
//                 console.error("Upload error:", error);
//                 throw new Error(`Failed to upload ${file.name}: ${error.message}`);
//             }
//         }
        
//         return uploadedUrls;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             showToast('error', "Please fix the errors before submitting.");
//             return;
//         }

//         if (isSubmitting) return;
        
//         setIsSubmitting(true);
//         setSaving(true);
//         setApiError(null);

//         try {
//             let imageUrls = [...formData.imageUrls];

//             // Upload new images if selected
//             if (imageFiles.length > 0) {
//                 const uploadedUrls = await uploadImages();
//                 imageUrls = [...imageUrls, ...uploadedUrls];
//             }

//             // Calculate margin if cost price is provided
//             let margin = null;
//             if (formData.costPrice && parseFloat(formData.costPrice) > 0) {
//                 margin = ((parseFloat(formData.discountPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.costPrice)) * 100;
//             }

//             // Prepare product data with category IDs
//             const productData = {
//                 productName: formData.productName.trim(),
//                 slug: formData.slug || generateSlug(formData.productName),
//                 sku: formData.sku.toUpperCase(),
//                 hsnCode: formData.hsnCode,
//                 category: formData.category,
//                 subCategory: formData.subCategory || undefined,
//                 brand: formData.brand.trim() || undefined,
//                 mrp: parseFloat(formData.mrp),
//                 discountPrice: parseFloat(formData.discountPrice),
//                 costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
//                 margin,
//                 gstRate: parseFloat(formData.gstRate),
//                 gstIncluded: formData.gstIncluded,
//                 description: formData.description.trim(),
//                 shortDescription: formData.shortDescription.trim() || undefined,
//                 stock: parseInt(formData.stock),
//                 lowStockThreshold: parseInt(formData.lowStockThreshold),
//                 trackInventory: formData.trackInventory,
//                 allowBackorder: formData.allowBackorder,
//                 imageUrls,
//                 videoUrl: formData.videoUrl || undefined,
//                 options: formData.options || undefined,
//                 variants: formData.variants,
//                 specifications: formData.specifications,
//                 metaTitle: formData.metaTitle || undefined,
//                 metaDescription: formData.metaDescription || undefined,
//                 metaKeywords: formData.metaKeywords,
//                 isFeatured: formData.isFeatured,
//                 isOnSale: formData.isOnSale,
//                 isNewArrival: formData.isNewArrival,
//                 isBestSeller: formData.isBestSeller,
//                 weight: formData.weight ? parseFloat(formData.weight) : undefined,
//                 dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) ? {
//                     length: parseFloat(formData.dimensions.length) || 0,
//                     width: parseFloat(formData.dimensions.width) || 0,
//                     height: parseFloat(formData.dimensions.height) || 0,
//                     unit: formData.dimensions.unit
//                 } : undefined,
//                 maxOrderQuantity: parseInt(formData.maxOrderQuantity),
//                 taxClass: formData.taxClass,
//                 shippingClass: formData.shippingClass || undefined,
//                 isActive: true,
//                 createdBy: user?.id,
//             };

//             // Add _id for updates
//             if (isEditing) {
//                 productData._id = productId;
//                 productData.updatedBy = user?.id;
//             }

//             const url = "/api/products";
//             const method = isEditing ? "PUT" : "POST";

//             const res = await fetch(url, {
//                 method,
//                 headers: {
//                     "Content-Type": "application/json",
//                     ...getAuthHeaders()
//                 },
//                 body: JSON.stringify(productData),
//             });

//             const data = await res.json();

//             if (data.success) {
//                 showToast('success', isEditing ? "✅ Product updated successfully!" : "🎉 Product created successfully!");
//                 setTimeout(() => router.push("/admin/products"), 1500);
//             } else {
//                 if (res.status === 403) {
//                     throw new Error("You don't have permission to perform this action");
//                 }
//                 throw new Error(data.message || data.error || "Failed to save product");
//             }
//         } catch (error) {
//             console.error("Error saving product:", error);
//             setApiError(error.message);
//             showToast('error', `❌ Failed to save product: ${error.message}`);
//         } finally {
//             setSaving(false);
//             setIsSubmitting(false);
//         }
//     };

//     const handleBack = useCallback(() => {
//         if (window.history.length > 1) {
//             router.back();
//         } else {
//             router.push("/admin/products");
//         }
//     }, [router]);

//     const copyToClipboard = (text) => {
//         navigator.clipboard.writeText(text);
//         showToast('success', 'Copied to clipboard!');
//     };

//     if (loading && isEditing) {
//         return (
//             <div className="loading-container">
//                 <div className="loading-spinner"></div>
//                 <p className="loading-text">Loading product data...</p>
//             </div>
//         );
//     }

//     if (!isAuthenticated || !user) {
//         return null;
//     }

//     return (
//         <>
//             <Head>
//                 <title>{isEditing ? 'Edit Product' : 'Add Product'} | LFMS</title>
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//             </Head>

//             <div className="product-form-page">
//                 {/* Toast Notification */}
//                 {toast.show && (
//                     <div className={`toast-notification ${toast.type}`}>
//                         {toast.type === 'success' ? <CheckCircle size={20} /> : 
//                          toast.type === 'error' ? <AlertCircle size={20} /> : 
//                          <AlertTriangle size={20} />}
//                         <span>{toast.message}</span>
//                     </div>
//                 )}

//                 {/* Header */}
//                 <header className="page-header">
//                     <div className="header-content">
//                         <div className="header-left">
//                             <button
//                                 onClick={handleBack}
//                                 className="back-button"
//                             >
//                                 <ArrowLeft size={20} />
//                                 <span>Back to Products</span>
//                             </button>
//                             <h1 className="page-title">
//                                 {isEditing ? 'Edit Product' : 'Create New Product'}
//                             </h1>
//                             <p className="page-description">
//                                 {isEditing ? 'Update your product information' : 'Fill in the details to create a new product'}
//                             </p>
//                         </div>
//                         <div className="header-actions">
//                             <button
//                                 onClick={handleSubmit}
//                                 disabled={saving || isSubmitting}
//                                 className="save-button desktop-save"
//                             >
//                                 {saving || isSubmitting ? (
//                                     <>
//                                         <div className="button-spinner"></div>
//                                         <span>Saving...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save size={16} />
//                                         <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </header>

//                 {/* Company Context Banner */}
//                 <div className="company-banner">
//                     <div className="company-banner-content">
//                         <div className="company-banner-left">
//                             <Building2 size={18} />
//                             <span>
//                                 {isSuperAdmin ? 'Super Admin' : 'Company Admin'} · 
//                                 {companyInfo?.companyName || user?.companyName || 'Your Company'}
//                             </span>
//                         </div>
//                         {isSuperAdmin && (
//                             <div className="super-admin-badge">
//                                 <Shield size={14} />
//                                 Super Admin
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* API Error Message */}
//                 {apiError && (
//                     <div className="api-error">
//                         <AlertCircle size={18} />
//                         <span>{apiError}</span>
//                     </div>
//                 )}

//                 {/* Main Content - Full Width */}
//                 <main className="main-content">
//                     {/* Product ID Card - Only for editing */}
//                     {isEditing && customId && (
//                         <div className="product-id-card">
//                             <div className="product-id-info">
//                                 <Hash size={20} />
//                                 <div>
//                                     <span className="product-id-label">Product ID</span>
//                                     <span className="product-id-value">{formattedId}</span>
//                                 </div>
//                             </div>
//                             <button 
//                                 className="copy-button"
//                                 onClick={() => copyToClipboard(formattedId)}
//                             >
//                                 <CopyIcon size={16} />
//                             </button>
//                         </div>
//                     )}

//                     {/* Form Sections */}
//                     <div className="form-sections">
//                         {/* Basic Information */}
//                         <div className="form-section">
//                             <div className="section-header">
//                                 <div className="section-header-left">
//                                     <div className="section-icon" style={{ background: `${appTheme.colors.primary}15`, color: appTheme.colors.primary }}>
//                                         <Package size={20} />
//                                     </div>
//                                     <div>
//                                         <h2>Basic Information</h2>
//                                         <p>Product name, category, and description</p>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div className="section-content">
//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>
//                                             Product Name <span className="required">*</span>
//                                             <span className="label-hint">Required</span>
//                                         </label>
//                                         <input
//                                             type="text"
//                                             name="productName"
//                                             value={formData.productName}
//                                             onChange={handleInputChange}
//                                             className={errors.productName ? 'error' : ''}
//                                             placeholder="e.g., Premium Cotton T-Shirt"
//                                             ref={el => fieldRefs.current['productName'] = el}
//                                         />
//                                         {errors.productName && <span className="error-text">{errors.productName}</span>}
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Slug (URL)</label>
//                                         <div className="input-with-hint">
//                                             <input
//                                                 type="text"
//                                                 name="slug"
//                                                 value={formData.slug}
//                                                 onChange={handleInputChange}
//                                                 placeholder="premium-cotton-tshirt"
//                                             />
//                                             <span className="field-hint">Auto-generated</span>
//                                         </div>
//                                     </div>

//                                     <div className="form-group">
//                                         <label>
//                                             SKU <span className="required">*</span>
//                                         </label>
//                                         <div className="input-group">
//                                             <input
//                                                 type="text"
//                                                 name="sku"
//                                                 value={formData.sku}
//                                                 onChange={handleInputChange}
//                                                 className={errors.sku ? 'error' : ''}
//                                                 placeholder="PRD-123456-ABC"
//                                                 ref={el => fieldRefs.current['sku'] = el}
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={generateSKU}
//                                                 className="icon-button"
//                                                 title="Generate new SKU"
//                                             >
//                                                 <RefreshCw size={16} />
//                                             </button>
//                                         </div>
//                                         {errors.sku && <span className="error-text">{errors.sku}</span>}
//                                     </div>

//                                     <div className="form-group">
//                                         <label>
//                                             HSN Code <span className="required">*</span>
//                                         </label>
//                                         <input
//                                             type="text"
//                                             name="hsnCode"
//                                             value={formData.hsnCode}
//                                             onChange={handleInputChange}
//                                             className={errors.hsnCode ? 'error' : ''}
//                                             placeholder="e.g., 6109"
//                                             ref={el => fieldRefs.current['hsnCode'] = el}
//                                         />
//                                         {errors.hsnCode && <span className="error-text">{errors.hsnCode}</span>}
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>
//                                             Category <span className="required">*</span>
//                                         </label>
//                                         <select
//                                             name="category"
//                                             value={formData.category}
//                                             onChange={handleInputChange}
//                                             className={errors.category ? 'error' : ''}
//                                             disabled={loadingCategories}
//                                             ref={el => fieldRefs.current['category'] = el}
//                                         >
//                                             <option value="">Select Category</option>
//                                             {categories.map(cat => (
//                                                 <option key={cat._id} value={cat._id}>
//                                                     {cat.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         {errors.category && <span className="error-text">{errors.category}</span>}
//                                     </div>

//                                     <div className="form-group">
//                                         <label>
//                                             Sub Category
//                                             {selectedCategoryHasSubs && <span className="required">*</span>}
//                                         </label>
//                                         <select
//                                             name="subCategory"
//                                             value={formData.subCategory}
//                                             onChange={handleInputChange}
//                                             className={errors.subCategory ? 'error' : ''}
//                                             disabled={!formData.category || subCategories.length === 0}
//                                             ref={el => fieldRefs.current['subCategory'] = el}
//                                         >
//                                             <option value="">
//                                                 {selectedCategoryHasSubs 
//                                                     ? "Select Sub Category" 
//                                                     : subCategories.length === 0 && formData.category
//                                                         ? "No subcategories available"
//                                                         : "Select Sub Category"
//                                                 }
//                                             </option>
//                                             {subCategories.map(sub => (
//                                                 <option key={sub._id} value={sub._id}>
//                                                     {sub.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         {errors.subCategory && <span className="error-text">{errors.subCategory}</span>}
//                                         {formData.category && subCategories.length === 0 && !selectedCategoryHasSubs && (
//                                             <span className="help-text">No subcategories found for this category</span>
//                                         )}
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Brand</label>
//                                         <input
//                                             type="text"
//                                             name="brand"
//                                             value={formData.brand}
//                                             onChange={handleInputChange}
//                                             placeholder="Brand name"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>Short Description</label>
//                                         <textarea
//                                             name="shortDescription"
//                                             value={formData.shortDescription}
//                                             onChange={handleInputChange}
//                                             rows="2"
//                                             placeholder="Brief summary of the product (max 500 characters)"
//                                             maxLength="500"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>
//                                             Full Description <span className="required">*</span>
//                                         </label>
//                                         <textarea
//                                             name="description"
//                                             value={formData.description}
//                                             onChange={handleInputChange}
//                                             rows={isMobile ? "4" : "3"}
//                                             className={errors.description ? 'error' : ''}
//                                             placeholder="Detailed description of your product..."
//                                             ref={el => fieldRefs.current['description'] = el}
//                                         />
//                                         {errors.description && <span className="error-text">{errors.description}</span>}
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>Options & Customization</label>
//                                         <input
//                                             type="text"
//                                             name="options"
//                                             value={formData.options}
//                                             onChange={handleInputChange}
//                                             placeholder="e.g., Color: Red, Size: Large, Material: Premium Cotton"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Pricing & Stock */}
//                         <div className="form-section">
//                             <div className="section-header">
//                                 <div className="section-header-left">
//                                     <div className="section-icon" style={{ background: `${appTheme.colors.secondary}15`, color: appTheme.colors.secondary }}>
//                                         <DollarSign size={20} />
//                                     </div>
//                                     <div>
//                                         <h2>Pricing & Stock</h2>
//                                         <p>Pricing, GST, and inventory management</p>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div className="section-content">
//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>
//                                             MRP (₹) <span className="required">*</span>
//                                         </label>
//                                         <input
//                                             type="number"
//                                             step="0.01"
//                                             min="0.01"
//                                             name="mrp"
//                                             value={formData.mrp}
//                                             onChange={handleInputChange}
//                                             className={errors.mrp ? 'error' : ''}
//                                             placeholder="0.00"
//                                             ref={el => fieldRefs.current['mrp'] = el}
//                                         />
//                                         {errors.mrp && <span className="error-text">{errors.mrp}</span>}
//                                     </div>

//                                     <div className="form-group">
//                                         <label>
//                                             Selling Price (₹) <span className="required">*</span>
//                                         </label>
//                                         <input
//                                             type="number"
//                                             step="0.01"
//                                             min="0"
//                                             name="discountPrice"
//                                             value={formData.discountPrice}
//                                             onChange={handleInputChange}
//                                             className={errors.discountPrice ? 'error' : ''}
//                                             placeholder="0.00"
//                                             ref={el => fieldRefs.current['discountPrice'] = el}
//                                         />
//                                         {errors.discountPrice && <span className="error-text">{errors.discountPrice}</span>}
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Cost Price (₹)</label>
//                                         <input
//                                             type="number"
//                                             step="0.01"
//                                             min="0"
//                                             name="costPrice"
//                                             value={formData.costPrice}
//                                             onChange={handleInputChange}
//                                             placeholder="0.00"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>
//                                             GST Rate (%) <span className="required">*</span>
//                                         </label>
//                                         <select
//                                             name="gstRate"
//                                             value={formData.gstRate}
//                                             onChange={handleInputChange}
//                                             className={errors.gstRate ? 'error' : ''}
//                                             ref={el => fieldRefs.current['gstRate'] = el}
//                                         >
//                                             {TAX_RATES.map(rate => (
//                                                 <option key={rate.value} value={rate.value}>
//                                                     {rate.label}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         {errors.gstRate && <span className="error-text">{errors.gstRate}</span>}
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Tax Class</label>
//                                         <select
//                                             name="taxClass"
//                                             value={formData.taxClass}
//                                             onChange={handleInputChange}
//                                         >
//                                             {TAX_CLASSES.map(tc => (
//                                                 <option key={tc.value} value={tc.value}>
//                                                     {tc.label}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="form-group checkbox-group">
//                                         <label className="checkbox-label">
//                                             <input
//                                                 type="checkbox"
//                                                 name="gstIncluded"
//                                                 checked={formData.gstIncluded}
//                                                 onChange={handleInputChange}
//                                             />
//                                             <span>Price includes GST</span>
//                                         </label>
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>
//                                             Stock Quantity <span className="required">*</span>
//                                         </label>
//                                         <input
//                                             type="number"
//                                             min="0"
//                                             name="stock"
//                                             value={formData.stock}
//                                             onChange={handleInputChange}
//                                             className={errors.stock ? 'error' : ''}
//                                             placeholder="0"
//                                             ref={el => fieldRefs.current['stock'] = el}
//                                         />
//                                         {errors.stock && <span className="error-text">{errors.stock}</span>}
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Low Stock Alert</label>
//                                         <input
//                                             type="number"
//                                             min="1"
//                                             name="lowStockThreshold"
//                                             value={formData.lowStockThreshold}
//                                             onChange={handleInputChange}
//                                             placeholder="5"
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Max Order Quantity</label>
//                                         <input
//                                             type="number"
//                                             min="1"
//                                             name="maxOrderQuantity"
//                                             value={formData.maxOrderQuantity}
//                                             onChange={handleInputChange}
//                                             placeholder="10"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group checkbox-group">
//                                         <label className="checkbox-label">
//                                             <input
//                                                 type="checkbox"
//                                                 name="trackInventory"
//                                                 checked={formData.trackInventory}
//                                                 onChange={handleInputChange}
//                                             />
//                                             <span>Track Inventory</span>
//                                         </label>
//                                     </div>

//                                     <div className="form-group checkbox-group">
//                                         <label className="checkbox-label">
//                                             <input
//                                                 type="checkbox"
//                                                 name="allowBackorder"
//                                                 checked={formData.allowBackorder}
//                                                 onChange={handleInputChange}
//                                             />
//                                             <span>Allow Backorder</span>
//                                         </label>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Media */}
//                         <div className="form-section">
//                             <div className="section-header">
//                                 <div className="section-header-left">
//                                     <div className="section-icon" style={{ background: `${appTheme.colors.warning}15`, color: appTheme.colors.warning }}>
//                                         <Camera size={20} />
//                                     </div>
//                                     <div>
//                                         <h2>Media</h2>
//                                         <p>Product images and videos</p>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div className="section-content">
//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>
//                                             Product Images {!isEditing && "*"}
//                                             <span className="image-count">{imagePreviews.length}/8</span>
//                                         </label>
                                        
//                                         {errors.images && <span className="error-text">{errors.images}</span>}
                                        
//                                         {/* Image Grid */}
//                                         {imagePreviews.length > 0 && (
//                                             <div className="image-grid">
//                                                 {imagePreviews.map((preview, index) => (
//                                                     <div key={index} className="image-preview">
//                                                         <img src={preview} alt={`Preview ${index + 1}`} />
//                                                         <button
//                                                             type="button"
//                                                             onClick={() => removeImage(index)}
//                                                             className="remove-image-btn"
//                                                         >
//                                                             <X size={14} />
//                                                         </button>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}

//                                         {/* Upload Area */}
//                                         {imagePreviews.length < 8 && (
//                                             <div 
//                                                 className="upload-area"
//                                                 onClick={() => document.getElementById("image-upload").click()}
//                                                 onDragOver={(e) => e.preventDefault()}
//                                                 onDrop={(e) => {
//                                                     e.preventDefault();
//                                                     const files = Array.from(e.dataTransfer.files);
//                                                     if (files.length > 0) {
//                                                         handleImageChange({ target: { files } });
//                                                     }
//                                                 }}
//                                             >
//                                                 <input
//                                                     type="file"
//                                                     accept="image/*"
//                                                     onChange={handleImageChange}
//                                                     id="image-upload"
//                                                     multiple
//                                                 />
//                                                 <Upload size={32} />
//                                                 <p>Click or drag to upload images</p>
//                                                 <span>JPEG, PNG, WebP, GIF (Max 5MB each)</span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>Video URL</label>
//                                         <input
//                                             type="url"
//                                             name="videoUrl"
//                                             value={formData.videoUrl}
//                                             onChange={handleInputChange}
//                                             placeholder="https://youtube.com/watch?v=..."
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Specifications */}
//                         <div className="form-section">
//                             <div className="section-header">
//                                 <div className="section-header-left">
//                                     <div className="section-icon" style={{ background: `${appTheme.colors.info}15`, color: appTheme.colors.info }}>
//                                         <Settings size={20} />
//                                     </div>
//                                     <div>
//                                         <h2>Specifications</h2>
//                                         <p>Technical details and attributes</p>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div className="section-content">
//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>Add Specification</label>
//                                         <div className="spec-input-group">
//                                             <input
//                                                 type="text"
//                                                 placeholder="Specification name"
//                                                 value={specKey}
//                                                 onChange={(e) => setSpecKey(e.target.value)}
//                                             />
//                                             <input
//                                                 type="text"
//                                                 placeholder="Specification value"
//                                                 value={specValue}
//                                                 onChange={(e) => setSpecValue(e.target.value)}
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={addSpecification}
//                                                 className="add-spec-btn"
//                                             >
//                                                 <Plus size={16} />
//                                                 <span>Add</span>
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {Object.keys(formData.specifications).length > 0 && (
//                                     <div className="form-row">
//                                         <div className="form-group span-3">
//                                             <div className="specs-list">
//                                                 {Object.entries(formData.specifications).map(([key, value]) => (
//                                                     <div key={key} className="spec-item">
//                                                         <div className="spec-content">
//                                                             <span className="spec-key">{key}:</span>
//                                                             <span className="spec-value">{value}</span>
//                                                         </div>
//                                                         <button
//                                                             type="button"
//                                                             onClick={() => removeSpecification(key)}
//                                                             className="remove-spec-btn"
//                                                         >
//                                                             <Trash2 size={14} />
//                                                         </button>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* SEO & Flags */}
//                         <div className="form-section">
//                             <div className="section-header">
//                                 <div className="section-header-left">
//                                     <div className="section-icon" style={{ background: `${appTheme.colors.accent}15`, color: appTheme.colors.accent }}>
//                                         <Globe size={20} />
//                                     </div>
//                                     <div>
//                                         <h2>SEO & Flags</h2>
//                                         <p>Search engine optimization and product badges</p>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div className="section-content">
//                                 <div className="form-row">
//                                     <div className="form-group span-2">
//                                         <label>Meta Title</label>
//                                         <input
//                                             type="text"
//                                             name="metaTitle"
//                                             value={formData.metaTitle}
//                                             onChange={handleInputChange}
//                                             placeholder="SEO title (60-70 characters)"
//                                             maxLength="70"
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Meta Keywords</label>
//                                         <input
//                                             type="text"
//                                             value={formData.metaKeywords.join(', ')}
//                                             onChange={handleMetaKeywordsChange}
//                                             placeholder="keyword1, keyword2, keyword3"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>Meta Description</label>
//                                         <textarea
//                                             name="metaDescription"
//                                             value={formData.metaDescription}
//                                             onChange={handleInputChange}
//                                             rows="2"
//                                             placeholder="SEO description (150-160 characters)"
//                                             maxLength="160"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>Product Flags</label>
//                                         <div className="flags-grid">
//                                             {FLAGS.map(flag => {
//                                                 const Icon = flag.icon;
//                                                 const isActive = formData[flag.id];
//                                                 return (
//                                                     <label 
//                                                         key={flag.id} 
//                                                         className={`flag-checkbox ${isActive ? 'active' : ''}`}
//                                                         style={{ 
//                                                             borderColor: isActive ? flag.color : appTheme.colors.border,
//                                                             background: isActive ? `${flag.color}10` : 'white'
//                                                         }}
//                                                     >
//                                                         <input
//                                                             type="checkbox"
//                                                             name={flag.id}
//                                                             checked={isActive}
//                                                             onChange={handleInputChange}
//                                                         />
//                                                         <Icon size={16} color={isActive ? flag.color : appTheme.colors.textSecondary} />
//                                                         <span style={{ color: isActive ? flag.color : appTheme.colors.textPrimary }}>
//                                                             {flag.label}
//                                                         </span>
//                                                     </label>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Shipping */}
//                         <div className="form-section">
//                             <div className="section-header">
//                                 <div className="section-header-left">
//                                     <div className="section-icon" style={{ background: `${appTheme.colors.success}15`, color: appTheme.colors.success }}>
//                                         <Truck size={20} />
//                                     </div>
//                                     <div>
//                                         <h2>Shipping</h2>
//                                         <p>Weight, dimensions, and shipping class</p>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <div className="section-content">
//                                 <div className="form-row">
//                                     <div className="form-group">
//                                         <label>Weight (kg)</label>
//                                         <input
//                                             type="number"
//                                             step="0.01"
//                                             min="0"
//                                             name="weight"
//                                             value={formData.weight}
//                                             onChange={handleInputChange}
//                                             placeholder="0.00"
//                                         />
//                                     </div>

//                                     <div className="form-group">
//                                         <label>Shipping Class</label>
//                                         <input
//                                             type="text"
//                                             name="shippingClass"
//                                             value={formData.shippingClass}
//                                             onChange={handleInputChange}
//                                             placeholder="e.g., Standard, Express, Fragile"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-row">
//                                     <div className="form-group span-3">
//                                         <label>Package Dimensions</label>
//                                         <div className="dimensions-grid">
//                                             <input
//                                                 type="number"
//                                                 step="0.1"
//                                                 min="0"
//                                                 name="dimensions.length"
//                                                 value={formData.dimensions.length}
//                                                 onChange={handleInputChange}
//                                                 placeholder="Length"
//                                             />
//                                             <input
//                                                 type="number"
//                                                 step="0.1"
//                                                 min="0"
//                                                 name="dimensions.width"
//                                                 value={formData.dimensions.width}
//                                                 onChange={handleInputChange}
//                                                 placeholder="Width"
//                                             />
//                                             <input
//                                                 type="number"
//                                                 step="0.1"
//                                                 min="0"
//                                                 name="dimensions.height"
//                                                 value={formData.dimensions.height}
//                                                 onChange={handleInputChange}
//                                                 placeholder="Height"
//                                             />
//                                             <select
//                                                 name="dimensions.unit"
//                                                 value={formData.dimensions.unit}
//                                                 onChange={handleInputChange}
//                                             >
//                                                 <option value="cm">cm</option>
//                                                 <option value="in">in</option>
//                                             </select>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </main>

//                 {/* Mobile Save Button */}
//                 <div className="mobile-save">
//                     <button
//                         onClick={handleSubmit}
//                         disabled={saving || isSubmitting}
//                         className="mobile-save-btn"
//                     >
//                         {saving || isSubmitting ? (
//                             <div className="button-spinner"></div>
//                         ) : (
//                             <>
//                                 <Save size={18} />
//                                 <span>{isEditing ? 'Update Product' : 'Create Product'}</span>
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             <style jsx>{`
//                 /* ==================== GLOBAL STYLES ==================== */
//                 .product-form-page {
//                     min-height: 100vh;
//                     background: ${appTheme.colors.backgroundLight};
//                     width: 100%;
//                 }

//                 /* ==================== LOADING ==================== */
//                 .loading-container {
//                     min-height: 100vh;
//                     display: flex;
//                     flex-direction: column;
//                     align-items: center;
//                     justify-content: center;
//                     background: ${appTheme.colors.backgroundLight};
//                 }

//                 .loading-spinner {
//                     width: 40px;
//                     height: 40px;
//                     border: 3px solid ${appTheme.colors.primary}20;
//                     border-top-color: ${appTheme.colors.primary};
//                     border-radius: 50%;
//                     animation: spin 0.8s linear infinite;
//                     margin-bottom: 16px;
//                 }

//                 .loading-text {
//                     color: ${appTheme.colors.textSecondary};
//                     font-size: 0.875rem;
//                 }

//                 @keyframes spin {
//                     to { transform: rotate(360deg); }
//                 }

//                 /* ==================== TOAST NOTIFICATION ==================== */
//                 .toast-notification {
//                     position: fixed;
//                     top: 20px;
//                     right: 20px;
//                     z-index: 1100;
//                     display: flex;
//                     align-items: center;
//                     gap: 10px;
//                     padding: 12px 20px;
//                     background: ${appTheme.colors.backgroundCard};
//                     border-radius: ${appTheme.radius.md};
//                     box-shadow: ${appTheme.shadows.lg};
//                     animation: slideInRight 0.3s ease;
//                     font-size: 0.875rem;
//                     max-width: 400px;
//                     border: 1px solid ${appTheme.colors.border};
//                 }

//                 .toast-notification.success {
//                     border-left: 4px solid ${appTheme.colors.success};
//                 }

//                 .toast-notification.error {
//                     border-left: 4px solid ${appTheme.colors.error};
//                 }

//                 .toast-notification.warning {
//                     border-left: 4px solid ${appTheme.colors.warning};
//                 }

//                 .toast-notification.success svg {
//                     color: ${appTheme.colors.success};
//                 }

//                 .toast-notification.error svg {
//                     color: ${appTheme.colors.error};
//                 }

//                 .toast-notification.warning svg {
//                     color: ${appTheme.colors.warning};
//                 }

//                 @keyframes slideInRight {
//                     from {
//                         transform: translateX(100%);
//                         opacity: 0;
//                     }
//                     to {
//                         transform: translateX(0);
//                         opacity: 1;
//                     }
//                 }

//                 /* ==================== HEADER ==================== */
//                 .page-header {
//                     background: ${appTheme.colors.backgroundCard};
//                     border-bottom: 1px solid ${appTheme.colors.border};
//                     padding: 20px 24px;
//                     position: sticky;
//                     top: 0;
//                     z-index: 100;
//                     backdrop-filter: blur(10px);
//                     background: rgba(255, 255, 255, 0.95);
//                     width: 100%;
//                 }

//                 .header-content {
//                     max-width: 100%;
//                     margin: 0 auto;
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     padding: 0 24px;
//                 }

//                 .header-left {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 4px;
//                 }

//                 .back-button {
//                     display: inline-flex;
//                     align-items: center;
//                     gap: 6px;
//                     background: none;
//                     border: none;
//                     color: ${appTheme.colors.primary};
//                     font-size: 0.813rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                     padding: 4px 0;
//                     transition: opacity 0.2s;
//                     width: fit-content;
//                 }

//                 .back-button:hover {
//                     opacity: 0.7;
//                 }

//                 .page-title {
//                     font-size: 1.5rem;
//                     font-weight: 600;
//                     color: ${appTheme.colors.textPrimary};
//                     margin: 0;
//                 }

//                 .page-description {
//                     color: ${appTheme.colors.textSecondary};
//                     font-size: 0.875rem;
//                     margin: 0;
//                 }

//                 .header-actions {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                 }

//                 .desktop-save {
//                     display: flex;
//                 }

//                 .save-button {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     padding: 12px 24px;
//                     background: ${appTheme.colors.primary};
//                     color: white;
//                     border: none;
//                     border-radius: ${appTheme.radius.md};
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
//                 }

//                 .save-button:hover {
//                     background: ${appTheme.colors.gradientStart};
//                     transform: translateY(-1px);
//                     box-shadow: 0 6px 16px ${appTheme.colors.primary}40;
//                 }

//                 .save-button:disabled {
//                     opacity: 0.6;
//                     cursor: not-allowed;
//                     transform: none;
//                 }

//                 .button-spinner {
//                     width: 16px;
//                     height: 16px;
//                     border: 2px solid rgba(255, 255, 255, 0.3);
//                     border-top-color: white;
//                     border-radius: 50%;
//                     animation: spin 0.8s linear infinite;
//                 }

//                 /* ==================== COMPANY BANNER ==================== */
//                 .company-banner {
//                     width: 100%;
//                     margin: 16px 0 0 0;
//                     padding: 0 24px;
//                 }

//                 .company-banner-content {
//                     background: ${appTheme.colors.backgroundCard};
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.md};
//                     padding: 12px 16px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                     width: 100%;
//                 }

//                 .company-banner-left {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     color: ${appTheme.colors.textPrimary};
//                     font-size: 0.875rem;
//                 }

//                 .company-banner-left svg {
//                     color: ${appTheme.colors.primary};
//                 }

//                 .super-admin-badge {
//                     display: flex;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 4px 10px;
//                     background: ${appTheme.colors.warning}15;
//                     border: 1px solid ${appTheme.colors.warning}30;
//                     border-radius: 20px;
//                     color: ${appTheme.colors.warning};
//                     font-size: 0.75rem;
//                     font-weight: 600;
//                 }

//                 /* ==================== API ERROR ==================== */
//                 .api-error {
//                     width: 100%;
//                     margin: 16px 0 0 0;
//                     padding: 0 24px;
//                 }

//                 .api-error {
//                     background: ${appTheme.colors.error}10;
//                     border: 1px solid ${appTheme.colors.error}30;
//                     border-radius: ${appTheme.radius.md};
//                     padding: 12px 16px;
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     color: ${appTheme.colors.error};
//                     font-size: 0.875rem;
//                 }

//                 /* ==================== MAIN CONTENT ==================== */
//                 .main-content {
//                     width: 100%;
//                     margin: 24px 0;
//                     padding: 0 24px;
//                 }

//                 /* ==================== PRODUCT ID CARD ==================== */
//                 .product-id-card {
//                     background: linear-gradient(135deg, ${appTheme.colors.primary}10, ${appTheme.colors.secondary}10);
//                     border: 1px solid ${appTheme.colors.primary}30;
//                     border-radius: ${appTheme.radius.md};
//                     padding: 16px;
//                     margin-bottom: 24px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                 }

//                 .product-id-info {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                 }

//                 .product-id-info svg {
//                     color: ${appTheme.colors.primary};
//                 }

//                 .product-id-label {
//                     font-size: 0.75rem;
//                     color: ${appTheme.colors.textSecondary};
//                     display: block;
//                 }

//                 .product-id-value {
//                     font-size: 1.25rem;
//                     font-weight: 700;
//                     color: ${appTheme.colors.primary};
//                     font-family: monospace;
//                     letter-spacing: 1px;
//                 }

//                 .copy-button {
//                     background: ${appTheme.colors.backgroundCard};
//                     border: 1px solid ${appTheme.colors.primary}30;
//                     border-radius: ${appTheme.radius.sm};
//                     padding: 8px;
//                     color: ${appTheme.colors.primary};
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .copy-button:hover {
//                     background: ${appTheme.colors.hover};
//                 }

//                 /* ==================== FORM SECTIONS ==================== */
//                 .form-sections {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 20px;
//                 }

//                 .form-section {
//                     background: ${appTheme.colors.backgroundCard};
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.lg};
//                     overflow: hidden;
//                 }

//                 .section-header {
//                     padding: 20px 24px;
//                     background: #fafbfc;
//                     border-bottom: 1px solid ${appTheme.colors.border};
//                 }

//                 .section-header-left {
//                     display: flex;
//                     align-items: center;
//                     gap: 16px;
//                 }

//                 .section-icon {
//                     width: 44px;
//                     height: 44px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     border-radius: ${appTheme.radius.md};
//                 }

//                 .section-header-left h2 {
//                     font-size: 1rem;
//                     font-weight: 600;
//                     color: ${appTheme.colors.textPrimary};
//                     margin: 0 0 4px 0;
//                 }

//                 .section-header-left p {
//                     font-size: 0.75rem;
//                     color: ${appTheme.colors.textSecondary};
//                     margin: 0;
//                 }

//                 .section-content {
//                     padding: 24px;
//                 }

//                 /* ==================== FORM LAYOUT ==================== */
//                 .form-row {
//                     display: grid;
//                     grid-template-columns: repeat(3, 1fr);
//                     gap: 20px;
//                     margin-bottom: 20px;
//                 }

//                 .form-row:last-child {
//                     margin-bottom: 0;
//                 }

//                 .form-group {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 6px;
//                 }

//                 .form-group.span-2 {
//                     grid-column: span 2;
//                 }

//                 .form-group.span-3 {
//                     grid-column: span 3;
//                 }

//                 .form-group.checkbox-group {
//                     justify-content: flex-end;
//                 }

//                 .form-group label {
//                     font-size: 0.813rem;
//                     font-weight: 500;
//                     color: ${appTheme.colors.textPrimary};
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                 }

//                 .label-hint {
//                     font-size: 0.688rem;
//                     font-weight: normal;
//                     color: ${appTheme.colors.textSecondary};
//                 }

//                 .required {
//                     color: ${appTheme.colors.error};
//                     margin-left: 4px;
//                 }

//                 .form-group input,
//                 .form-group select,
//                 .form-group textarea {
//                     width: 100%;
//                     padding: 12px 14px;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.md};
//                     font-size: 0.938rem;
//                     transition: all 0.2s ease;
//                     background: ${appTheme.colors.backgroundCard};
//                     color: ${appTheme.colors.textPrimary};
//                 }

//                 .form-group input:focus,
//                 .form-group select:focus,
//                 .form-group textarea:focus {
//                     outline: none;
//                     border-color: ${appTheme.colors.primary};
//                     box-shadow: 0 0 0 4px ${appTheme.colors.primary}15;
//                 }

//                 .form-group input.error,
//                 .form-group select.error,
//                 .form-group textarea.error {
//                     border-color: ${appTheme.colors.error};
//                 }

//                 .error-text {
//                     font-size: 0.688rem;
//                     color: ${appTheme.colors.error};
//                 }

//                 .help-text {
//                     font-size: 0.688rem;
//                     color: ${appTheme.colors.textSecondary};
//                     margin-top: 4px;
//                 }

//                 .input-group {
//                     display: flex;
//                     gap: 8px;
//                 }

//                 .input-group input {
//                     flex: 1;
//                 }

//                 .icon-button {
//                     padding: 12px;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.md};
//                     background: ${appTheme.colors.backgroundLight};
//                     color: ${appTheme.colors.textSecondary};
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                 }

//                 .icon-button:hover {
//                     background: ${appTheme.colors.hover};
//                     color: ${appTheme.colors.primary};
//                     border-color: ${appTheme.colors.primary};
//                 }

//                 .input-with-hint {
//                     position: relative;
//                 }

//                 .field-hint {
//                     position: absolute;
//                     right: 12px;
//                     top: 50%;
//                     transform: translateY(-50%);
//                     font-size: 0.688rem;
//                     color: ${appTheme.colors.textSecondary};
//                     pointer-events: none;
//                 }

//                 .checkbox-label {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     cursor: pointer;
//                     padding: 8px 0;
//                     color: ${appTheme.colors.textPrimary};
//                 }

//                 .checkbox-label input[type="checkbox"] {
//                     width: 18px;
//                     height: 18px;
//                     cursor: pointer;
//                     accent-color: ${appTheme.colors.primary};
//                 }

//                 /* ==================== IMAGE SECTION ==================== */
//                 .image-count {
//                     font-size: 0.75rem;
//                     color: ${appTheme.colors.textSecondary};
//                     font-weight: normal;
//                 }

//                 .image-grid {
//                     display: grid;
//                     grid-template-columns: repeat(4, 1fr);
//                     gap: 12px;
//                     margin: 16px 0;
//                 }

//                 .image-preview {
//                     position: relative;
//                     width: 100%;
//                     aspect-ratio: 1/1;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.md};
//                     overflow: hidden;
//                     background: ${appTheme.colors.backgroundLight};
//                 }

//                 .image-preview img {
//                     width: 100%;
//                     height: 100%;
//                     object-fit: cover;
//                 }

//                 .remove-image-btn {
//                     position: absolute;
//                     top: 4px;
//                     right: 4px;
//                     width: 28px;
//                     height: 28px;
//                     background: ${appTheme.colors.error};
//                     color: white;
//                     border: none;
//                     border-radius: ${appTheme.radius.sm};
//                     cursor: pointer;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     transition: all 0.2s ease;
//                 }

//                 .remove-image-btn:hover {
//                     background: #dc2626;
//                     transform: scale(1.1);
//                 }

//                 .upload-area {
//                     border: 2px dashed ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.md};
//                     padding: 32px;
//                     text-align: center;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     background: ${appTheme.colors.backgroundLight};
//                 }

//                 .upload-area:hover {
//                     border-color: ${appTheme.colors.primary};
//                     background: ${appTheme.colors.primary}05;
//                 }

//                 .upload-area input {
//                     display: none;
//                 }

//                 .upload-area svg {
//                     color: ${appTheme.colors.primary};
//                     margin-bottom: 12px;
//                 }

//                 .upload-area p {
//                     font-size: 0.938rem;
//                     font-weight: 500;
//                     color: ${appTheme.colors.textPrimary};
//                     margin: 0 0 4px 0;
//                 }

//                 .upload-area span {
//                     font-size: 0.75rem;
//                     color: ${appTheme.colors.textSecondary};
//                 }

//                 /* ==================== SPECIFICATIONS ==================== */
//                 .spec-input-group {
//                     display: grid;
//                     grid-template-columns: 1fr 1fr auto;
//                     gap: 10px;
//                 }

//                 .add-spec-btn {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 6px;
//                     padding: 0 20px;
//                     background: ${appTheme.colors.primary};
//                     color: white;
//                     border: none;
//                     border-radius: ${appTheme.radius.md};
//                     cursor: pointer;
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     transition: all 0.2s ease;
//                 }

//                 .add-spec-btn:hover {
//                     background: ${appTheme.colors.gradientStart};
//                 }

//                 .specs-list {
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.md};
//                     overflow: hidden;
//                     margin-top: 16px;
//                 }

//                 .spec-item {
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                     padding: 12px 16px;
//                     border-bottom: 1px solid ${appTheme.colors.border};
//                     background: ${appTheme.colors.backgroundCard};
//                 }

//                 .spec-item:last-child {
//                     border-bottom: none;
//                 }

//                 .spec-item:nth-child(even) {
//                     background: ${appTheme.colors.backgroundLight};
//                 }

//                 .spec-content {
//                     flex: 1;
//                     font-size: 0.875rem;
//                 }

//                 .spec-key {
//                     font-weight: 600;
//                     color: ${appTheme.colors.textPrimary};
//                 }

//                 .spec-value {
//                     color: ${appTheme.colors.textSecondary};
//                     margin-left: 4px;
//                 }

//                 .remove-spec-btn {
//                     background: none;
//                     border: none;
//                     color: ${appTheme.colors.error};
//                     cursor: pointer;
//                     padding: 4px;
//                     border-radius: ${appTheme.radius.sm};
//                     transition: all 0.2s ease;
//                 }

//                 .remove-spec-btn:hover {
//                     background: ${appTheme.colors.error}10;
//                 }

//                 /* ==================== FLAGS GRID ==================== */
//                 .flags-grid {
//                     display: grid;
//                     grid-template-columns: repeat(4, 1fr);
//                     gap: 12px;
//                     margin-top: 8px;
//                 }

//                 .flag-checkbox {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 8px;
//                     padding: 12px;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.md};
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     background: ${appTheme.colors.backgroundCard};
//                 }

//                 .flag-checkbox input {
//                     display: none;
//                 }

//                 .flag-checkbox.active {
//                     background: ${appTheme.colors.primary}10;
//                 }

//                 .flag-checkbox span {
//                     font-size: 0.813rem;
//                     font-weight: 500;
//                 }

//                 /* ==================== DIMENSIONS GRID ==================== */
//                 .dimensions-grid {
//                     display: grid;
//                     grid-template-columns: 1fr 1fr 1fr auto;
//                     gap: 10px;
//                     margin-top: 8px;
//                 }

//                 .dimensions-grid input,
//                 .dimensions-grid select {
//                     padding: 12px 14px;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: ${appTheme.radius.md};
//                     font-size: 0.938rem;
//                     background: ${appTheme.colors.backgroundCard};
//                     color: ${appTheme.colors.textPrimary};
//                 }

//                 .dimensions-grid input:focus,
//                 .dimensions-grid select:focus {
//                     outline: none;
//                     border-color: ${appTheme.colors.primary};
//                     box-shadow: 0 0 0 4px ${appTheme.colors.primary}15;
//                 }

//                 /* ==================== MOBILE SAVE ==================== */
//                 .mobile-save {
//                     display: none;
//                     position: fixed;
//                     bottom: 0;
//                     left: 0;
//                     right: 0;
//                     padding: 16px;
//                     background: linear-gradient(to top, ${appTheme.colors.backgroundLight}, transparent);
//                     z-index: 100;
//                 }

//                 .mobile-save-btn {
//                     width: 100%;
//                     padding: 16px;
//                     background: ${appTheme.colors.primary};
//                     color: white;
//                     border: none;
//                     border-radius: ${appTheme.radius.md};
//                     font-size: 1rem;
//                     font-weight: 600;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 8px;
//                     box-shadow: 0 4px 20px ${appTheme.colors.primary}40;
//                 }

//                 .mobile-save-btn:disabled {
//                     opacity: 0.6;
//                     cursor: not-allowed;
//                 }

//                 /* ==================== RESPONSIVE ==================== */
//                 @media (max-width: 1200px) {
//                     .header-content,
//                     .main-content,
//                     .company-banner,
//                     .api-error {
//                         padding: 0 20px;
//                     }
//                 }

//                 @media (max-width: 1024px) {
//                     .form-row {
//                         grid-template-columns: repeat(2, 1fr);
//                     }

//                     .form-group.span-2,
//                     .form-group.span-3 {
//                         grid-column: span 2;
//                     }
//                 }

//                 @media (max-width: 768px) {
//                     .page-header {
//                         padding: 16px;
//                     }

//                     .header-content {
//                         flex-direction: column;
//                         gap: 16px;
//                         align-items: flex-start;
//                         padding: 0 16px;
//                     }

//                     .header-actions {
//                         width: 100%;
//                     }

//                     .desktop-save {
//                         display: none !important;
//                     }

//                     .mobile-save {
//                         display: block;
//                     }

//                     .page-title {
//                         font-size: 1.25rem;
//                     }

//                     .main-content {
//                         padding: 0 16px;
//                         margin-bottom: 80px;
//                     }

//                     .section-header {
//                         padding: 16px;
//                     }

//                     .section-header-left {
//                         gap: 12px;
//                     }

//                     .section-icon {
//                         width: 36px;
//                         height: 36px;
//                     }

//                     .section-content {
//                         padding: 16px;
//                     }

//                     .form-row {
//                         grid-template-columns: 1fr;
//                         gap: 16px;
//                     }

//                     .form-group.span-2,
//                     .form-group.span-3 {
//                         grid-column: span 1;
//                     }

//                     .image-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }

//                     .spec-input-group {
//                         grid-template-columns: 1fr;
//                     }

//                     .add-spec-btn {
//                         padding: 12px;
//                     }

//                     .flags-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }

//                     .dimensions-grid {
//                         grid-template-columns: 1fr 1fr;
//                     }

//                     .dimensions-grid select {
//                         grid-column: span 2;
//                     }

//                     .upload-area {
//                         padding: 24px;
//                     }

//                     .upload-area p {
//                         font-size: 0.875rem;
//                     }

//                     .company-banner,
//                     .api-error {
//                         padding: 0 16px;
//                     }
//                 }

//                 @media (max-width: 480px) {
//                     .form-group label {
//                         font-size: 0.75rem;
//                     }

//                     .form-group input,
//                     .form-group select,
//                     .form-group textarea {
//                         font-size: 16px;
//                         padding: 10px 12px;
//                     }

//                     .image-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }

//                     .flags-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }

//                     .flag-checkbox {
//                         padding: 10px;
//                     }

//                     .flag-checkbox span {
//                         font-size: 0.75rem;
//                     }
//                 }
//             `}</style>
//         </>
//     );
// }













































'use client';

import { useState, useEffect, useCallback, useRef } from "react";
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
    ChevronDown, Copy as CopyIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================
const TAX_RATES = [
    { value: "0", label: "0%", description: "No tax" },
    { value: "5", label: "5%", description: "Reduced rate" },
    { value: "12", label: "12%", description: "Standard rate" },
    { value: "18", label: "18%", description: "Standard rate" },
    { value: "28", label: "28%", description: "Highest rate" }
];

const TAX_CLASSES = [
    { value: "standard", label: "Standard", icon: FileText },
    { value: "reduced", label: "Reduced", icon: Percent },
    { value: "zero", label: "Zero Rated", icon: Minus },
    { value: "exempt", label: "Exempt", icon: Shield }
];

const FLAGS = [
    { id: 'isFeatured', label: 'Featured', icon: Star, color: appTheme.colors.warning },
    { id: 'isOnSale', label: 'On Sale', icon: Percent, color: appTheme.colors.success },
    { id: 'isNewArrival', label: 'New Arrival', icon: Calendar, color: appTheme.colors.info },
    { id: 'isBestSeller', label: 'Best Seller', icon: Crown, color: appTheme.colors.secondary }
];

// ✅ Helper to validate ObjectId
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export default function ProductForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("id");
    
    // Refs for scrolling to error fields
    const fieldRefs = useRef({});
    
    const { user, isAuthenticated, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();

    // Redirect if not authenticated or not company admin
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (!isCompanyAdmin && !isSuperAdmin) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, isCompanyAdmin, isSuperAdmin, router]);

    // State management
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
    const [companyInfo, setCompanyInfo] = useState(null);
    const [selectedCategoryHasSubs, setSelectedCategoryHasSubs] = useState(false);

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
    const [apiError, setApiError] = useState(null);

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
        if (user?.companyId) {
            fetchCategories();
            fetchCompanyInfo();
        }
    }, [user]);

    // Fetch subcategories when category changes
    useEffect(() => {
        if (formData.category && isValidObjectId(formData.category)) {
            fetchSubCategories(formData.category);
        } else {
            setSubCategories([]);
            setSelectedCategoryHasSubs(false);
        }
    }, [formData.category]);

    // Check if selected category has subcategories
    useEffect(() => {
        if (subCategories.length > 0) {
            setSelectedCategoryHasSubs(true);
        } else {
            setSelectedCategoryHasSubs(false);
        }
    }, [subCategories]);

    // Fetch product data if editing
    useEffect(() => {
        if (productId && user?.companyId) {
            setIsEditing(true);
            fetchProduct();
        } else {
            generateSKU();
        }
    }, [productId, user]);

    // Scroll to first error field
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            const firstErrorField = Object.keys(errors)[0];
            if (fieldRefs.current[firstErrorField]) {
                fieldRefs.current[firstErrorField].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [errors]);

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

    // Fetch company info
    const fetchCompanyInfo = async () => {
        try {
            const res = await fetch(`/api/companies/me`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setCompanyInfo(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch company info:', error);
        }
    };

    // ✅ FIXED: Fetch all categories with companyId
    const fetchCategories = async () => {
        if (!user?.companyId) return;
        
        setLoadingCategories(true);
        try {
            const params = new URLSearchParams({
                companyId: user.companyId,
                type: 'categories',
                format: 'flat'
            });
            
            const res = await fetch(`/api/masters?${params}`, {
                headers: getAuthHeaders()
            });
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

    // ✅ FIXED: Fetch subcategories with companyId
    const fetchSubCategories = async (categoryId) => {
        if (!categoryId || !isValidObjectId(categoryId) || !user?.companyId) return;
        
        try {
            const params = new URLSearchParams({
                companyId: user.companyId,
                type: 'categories',
                parentId: categoryId
            });
            
            const res = await fetch(`/api/masters?${params}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setSubCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch subcategories:', error);
        }
    };

    // ✅ FIXED: Fetch product with company context
    const fetchProduct = async () => {
        try {
            setLoading(true);
            setApiError(null);
            
            const res = await fetch(`/api/products?id=${productId}&companyId=${user?.companyId}`, {
                headers: getAuthHeaders()
            });
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
                
                // Fetch subcategories if category exists
                if (categoryId) {
                    await fetchSubCategories(categoryId);
                }
                
                showToast('success', 'Product loaded successfully');
            } else {
                if (res.status === 403) {
                    throw new Error("You don't have permission to edit this product");
                }
                showToast('error', 'Failed to fetch product: ' + data.message);
                setTimeout(() => router.push("/admin/products"), 2000);
            }
        } catch (err) {
            console.error("Error fetching product:", err);
            setApiError(err.message);
            showToast('error', err.message || 'Failed to load product data');
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

        // Subcategory required if category has subcategories
        if (formData.category && selectedCategoryHasSubs) {
            if (!formData.subCategory) {
                newErrors.subCategory = "Sub-category is required for this category";
            } else if (!isValidObjectId(formData.subCategory)) {
                newErrors.subCategory = "Invalid sub-category selected";
            }
        }

        // MRP validation
        if (!formData.mrp || parseFloat(formData.mrp) <= 0) {
            newErrors.mrp = "Valid MRP is required";
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
            newErrors.stock = "Valid stock quantity is required";
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

            // Clear subcategory when category changes
            if (name === 'category') {
                setFormData(prev => ({
                    ...prev,
                    subCategory: ""
                }));
                setSubCategories([]);
                setSelectedCategoryHasSubs(false);
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
        setApiError(null);

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
                category: formData.category,
                subCategory: formData.subCategory || undefined,
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
                createdBy: user?.id,
            };

            // Add _id for updates
            if (isEditing) {
                productData._id = productId;
                productData.updatedBy = user?.id;
            }

            const url = "/api/products";
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify(productData),
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', isEditing ? "✅ Product updated successfully!" : "🎉 Product created successfully!");
                setTimeout(() => router.push("/admin/products"), 1500);
            } else {
                if (res.status === 403) {
                    throw new Error("You don't have permission to perform this action");
                }
                throw new Error(data.message || data.error || "Failed to save product");
            }
        } catch (error) {
            console.error("Error saving product:", error);
            setApiError(error.message);
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('success', 'Copied to clipboard!');
    };

    if (loading && isEditing) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading product data...</p>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <>
            <Head>
                <title>{isEditing ? 'Edit Product' : 'Add Product'} | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
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
                                <span>Back to Products</span>
                            </button>
                            <h1 className="page-title">
                                {isEditing ? 'Edit Product' : 'Create New Product'}
                            </h1>
                            <p className="page-description">
                                {isEditing ? 'Update your product information' : 'Fill in the details to create a new product'}
                            </p>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || isSubmitting}
                                className="save-button desktop-save"
                            >
                                {saving || isSubmitting ? (
                                    <>
                                        <div className="button-spinner"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>{isEditing ? 'Update Product' : 'Save Product'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Company Context Banner */}
                <div className="company-banner">
                    <div className="company-banner-content">
                        <div className="company-banner-left">
                            <Building2 size={18} />
                            <span>
                                {isSuperAdmin ? 'Super Admin' : 'Company Admin'} · 
                                {companyInfo?.companyName || user?.companyName || 'Your Company'}
                            </span>
                        </div>
                        {isSuperAdmin && (
                            <div className="super-admin-badge">
                                <Shield size={14} />
                                Super Admin
                            </div>
                        )}
                    </div>
                </div>

                {/* API Error Message */}
                {apiError && (
                    <div className="api-error">
                        <AlertCircle size={18} />
                        <span>{apiError}</span>
                    </div>
                )}

                {/* Main Content - Full Width */}
                <main className="main-content">
                    {/* Product ID Card - Only for editing */}
                    {isEditing && customId && (
                        <div className="product-id-card">
                            <div className="product-id-info">
                                <Hash size={20} />
                                <div>
                                    <span className="product-id-label">Product ID</span>
                                    <span className="product-id-value">{formattedId}</span>
                                </div>
                            </div>
                            <button 
                                className="copy-button"
                                onClick={() => copyToClipboard(formattedId)}
                            >
                                <CopyIcon size={16} />
                            </button>
                        </div>
                    )}

                    {/* Form Sections */}
                    <div className="form-sections">
                        {/* Basic Information */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.primary}15`, color: appTheme.colors.primary }}>
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h2>Basic Information</h2>
                                        <p>Product name, category, and description</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>
                                            Product Name <span className="required">*</span>
                                            <span className="label-hint">Required</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="productName"
                                            value={formData.productName}
                                            onChange={handleInputChange}
                                            className={errors.productName ? 'error' : ''}
                                            placeholder="e.g., Premium Cotton T-Shirt"
                                            ref={el => fieldRefs.current['productName'] = el}
                                        />
                                        {errors.productName && <span className="error-text">{errors.productName}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Slug (URL)</label>
                                        <div className="input-with-hint">
                                            <input
                                                type="text"
                                                name="slug"
                                                value={formData.slug}
                                                onChange={handleInputChange}
                                                placeholder="premium-cotton-tshirt"
                                            />
                                            <span className="field-hint">Auto-generated</span>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            SKU <span className="required">*</span>
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleInputChange}
                                                className={errors.sku ? 'error' : ''}
                                                placeholder="PRD-123456-ABC"
                                                ref={el => fieldRefs.current['sku'] = el}
                                            />
                                            <button
                                                type="button"
                                                onClick={generateSKU}
                                                className="icon-button"
                                                title="Generate new SKU"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                        </div>
                                        {errors.sku && <span className="error-text">{errors.sku}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            HSN Code <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="hsnCode"
                                            value={formData.hsnCode}
                                            onChange={handleInputChange}
                                            className={errors.hsnCode ? 'error' : ''}
                                            placeholder="e.g., 6109"
                                            ref={el => fieldRefs.current['hsnCode'] = el}
                                        />
                                        {errors.hsnCode && <span className="error-text">{errors.hsnCode}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Category <span className="required">*</span>
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className={errors.category ? 'error' : ''}
                                            disabled={loadingCategories}
                                            ref={el => fieldRefs.current['category'] = el}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && <span className="error-text">{errors.category}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Sub Category
                                            {selectedCategoryHasSubs && <span className="required">*</span>}
                                        </label>
                                        <select
                                            name="subCategory"
                                            value={formData.subCategory}
                                            onChange={handleInputChange}
                                            className={errors.subCategory ? 'error' : ''}
                                            disabled={!formData.category || subCategories.length === 0}
                                            ref={el => fieldRefs.current['subCategory'] = el}
                                        >
                                            <option value="">
                                                {selectedCategoryHasSubs 
                                                    ? "Select Sub Category" 
                                                    : subCategories.length === 0 && formData.category
                                                        ? "No subcategories available"
                                                        : "Select Sub Category"
                                                }
                                            </option>
                                            {subCategories.map(sub => (
                                                <option key={sub._id} value={sub._id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.subCategory && <span className="error-text">{errors.subCategory}</span>}
                                        {formData.category && subCategories.length === 0 && !selectedCategoryHasSubs && (
                                            <span className="help-text">No subcategories found for this category</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label>Brand</label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleInputChange}
                                            placeholder="Brand name"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
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
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>
                                            Full Description <span className="required">*</span>
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={isMobile ? "4" : "3"}
                                            className={errors.description ? 'error' : ''}
                                            placeholder="Detailed description of your product..."
                                            ref={el => fieldRefs.current['description'] = el}
                                        />
                                        {errors.description && <span className="error-text">{errors.description}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Options & Customization</label>
                                        <input
                                            type="text"
                                            name="options"
                                            value={formData.options}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Color: Red, Size: Large, Material: Premium Cotton"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Stock */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.secondary}15`, color: appTheme.colors.secondary }}>
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <h2>Pricing & Stock</h2>
                                        <p>Pricing, GST, and inventory management</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            MRP (₹) <span className="required">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            name="mrp"
                                            value={formData.mrp}
                                            onChange={handleInputChange}
                                            className={errors.mrp ? 'error' : ''}
                                            placeholder="0.00"
                                            ref={el => fieldRefs.current['mrp'] = el}
                                        />
                                        {errors.mrp && <span className="error-text">{errors.mrp}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Selling Price (₹) <span className="required">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="discountPrice"
                                            value={formData.discountPrice}
                                            onChange={handleInputChange}
                                            className={errors.discountPrice ? 'error' : ''}
                                            placeholder="0.00"
                                            ref={el => fieldRefs.current['discountPrice'] = el}
                                        />
                                        {errors.discountPrice && <span className="error-text">{errors.discountPrice}</span>}
                                    </div>

                                    <div className="form-group">
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
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            GST Rate (%) <span className="required">*</span>
                                        </label>
                                        <select
                                            name="gstRate"
                                            value={formData.gstRate}
                                            onChange={handleInputChange}
                                            className={errors.gstRate ? 'error' : ''}
                                            ref={el => fieldRefs.current['gstRate'] = el}
                                        >
                                            {TAX_RATES.map(rate => (
                                                <option key={rate.value} value={rate.value}>
                                                    {rate.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.gstRate && <span className="error-text">{errors.gstRate}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Tax Class</label>
                                        <select
                                            name="taxClass"
                                            value={formData.taxClass}
                                            onChange={handleInputChange}
                                        >
                                            {TAX_CLASSES.map(tc => (
                                                <option key={tc.value} value={tc.value}>
                                                    {tc.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group checkbox-group">
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
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            Stock Quantity <span className="required">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            className={errors.stock ? 'error' : ''}
                                            placeholder="0"
                                            ref={el => fieldRefs.current['stock'] = el}
                                        />
                                        {errors.stock && <span className="error-text">{errors.stock}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>Low Stock Alert</label>
                                        <input
                                            type="number"
                                            min="1"
                                            name="lowStockThreshold"
                                            value={formData.lowStockThreshold}
                                            onChange={handleInputChange}
                                            placeholder="5"
                                        />
                                    </div>

                                    <div className="form-group">
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
                                </div>

                                <div className="form-row">
                                    <div className="form-group checkbox-group">
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

                                    <div className="form-group checkbox-group">
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
                        </div>

                        {/* Media */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.warning}15`, color: appTheme.colors.warning }}>
                                        <Camera size={20} />
                                    </div>
                                    <div>
                                        <h2>Media</h2>
                                        <p>Product images and videos</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>
                                            Product Images {!isEditing && "*"}
                                            <span className="image-count">{imagePreviews.length}/8</span>
                                        </label>
                                        
                                        {errors.images && <span className="error-text">{errors.images}</span>}
                                        
                                        {/* Image Grid */}
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
                                                            <X size={14} />
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
                                                <p>Click or drag to upload images</p>
                                                <span>JPEG, PNG, WebP, GIF (Max 5MB each)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Video URL</label>
                                        <input
                                            type="url"
                                            name="videoUrl"
                                            value={formData.videoUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.info}15`, color: appTheme.colors.info }}>
                                        <Settings size={20} />
                                    </div>
                                    <div>
                                        <h2>Specifications</h2>
                                        <p>Technical details and attributes</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Add Specification</label>
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
                                </div>

                                {Object.keys(formData.specifications).length > 0 && (
                                    <div className="form-row">
                                        <div className="form-group span-3">
                                            <div className="specs-list">
                                                {Object.entries(formData.specifications).map(([key, value]) => (
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEO & Flags */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.accent}15`, color: appTheme.colors.accent }}>
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h2>SEO & Flags</h2>
                                        <p>Search engine optimization and product badges</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group span-2">
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

                                    <div className="form-group">
                                        <label>Meta Keywords</label>
                                        <input
                                            type="text"
                                            value={formData.metaKeywords.join(', ')}
                                            onChange={handleMetaKeywordsChange}
                                            placeholder="keyword1, keyword2, keyword3"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Meta Description</label>
                                        <textarea
                                            name="metaDescription"
                                            value={formData.metaDescription}
                                            onChange={handleInputChange}
                                            rows="2"
                                            placeholder="SEO description (150-160 characters)"
                                            maxLength="160"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Product Flags</label>
                                        <div className="flags-grid">
                                            {FLAGS.map(flag => {
                                                const Icon = flag.icon;
                                                const isActive = formData[flag.id];
                                                return (
                                                    <label 
                                                        key={flag.id} 
                                                        className={`flag-checkbox ${isActive ? 'active' : ''}`}
                                                        style={{ 
                                                            borderColor: isActive ? flag.color : appTheme.colors.border,
                                                            background: isActive ? `${flag.color}10` : appTheme.colors.backgroundCard
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            name={flag.id}
                                                            checked={isActive}
                                                            onChange={handleInputChange}
                                                        />
                                                        <Icon size={16} color={isActive ? flag.color : appTheme.colors.textSecondary} />
                                                        <span style={{ color: isActive ? flag.color : appTheme.colors.textPrimary }}>
                                                            {flag.label}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.success}15`, color: appTheme.colors.success }}>
                                        <Truck size={20} />
                                    </div>
                                    <div>
                                        <h2>Shipping</h2>
                                        <p>Weight, dimensions, and shipping class</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="form-group">
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

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Package Dimensions</label>
                                        <div className="dimensions-grid">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                name="dimensions.length"
                                                value={formData.dimensions.length}
                                                onChange={handleInputChange}
                                                placeholder="Length"
                                            />
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                name="dimensions.width"
                                                value={formData.dimensions.width}
                                                onChange={handleInputChange}
                                                placeholder="Width"
                                            />
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                name="dimensions.height"
                                                value={formData.dimensions.height}
                                                onChange={handleInputChange}
                                                placeholder="Height"
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
                                    </div>
                                </div>
                            </div>
                        </div>
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
                    background: ${appTheme.colors.backgroundLight};
                    width: 100%;
                }

                /* ==================== LOADING ==================== */
                .loading-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: ${appTheme.colors.backgroundLight};
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid ${appTheme.colors.primary}20;
                    border-top-color: ${appTheme.colors.primary};
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin-bottom: 16px;
                }

                .loading-text {
                    color: ${appTheme.colors.textSecondary};
                    font-size: ${appTheme.fonts.sizes.sm};
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
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
                    background: ${appTheme.colors.backgroundCard};
                    border-radius: ${appTheme.radius.md};
                    box-shadow: ${appTheme.shadows.lg};
                    animation: slideInRight 0.3s ease;
                    font-size: ${appTheme.fonts.sizes.sm};
                    max-width: 400px;
                    border: 1px solid ${appTheme.colors.border};
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
                    background: ${appTheme.colors.backgroundCard};
                    border-bottom: 1px solid ${appTheme.colors.border};
                    padding: 20px 24px;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                    width: 100%;
                }

                .header-content {
                    max-width: 100%;
                    margin: 0 auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 24px;
                }

                .header-left {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .back-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: none;
                    color: ${appTheme.colors.primary};
                    font-size: 0.813rem;
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
                    font-size: ${appTheme.fonts.sizes["2xl"]};
                    font-weight: ${appTheme.fonts.weights.semibold};
                    color: ${appTheme.colors.textPrimary};
                    margin: 0;
                }

                .page-description {
                    color: ${appTheme.colors.textSecondary};
                    font-size: ${appTheme.fonts.sizes.sm};
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .desktop-save {
                    display: flex;
                }

                .save-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: ${appTheme.fonts.sizes.sm};
                    font-weight: ${appTheme.fonts.weights.medium};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
                }

                .save-button:hover {
                    background: ${appTheme.colors.primaryDark};
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

                /* ==================== COMPANY BANNER ==================== */
                .company-banner {
                    width: 100%;
                    margin: 16px 0 0 0;
                    padding: 0 24px;
                }

                .company-banner-content {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }

                .company-banner-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${appTheme.colors.textPrimary};
                    font-size: ${appTheme.fonts.sizes.sm};
                }

                .company-banner-left svg {
                    color: ${appTheme.colors.primary};
                }

                .super-admin-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: ${appTheme.colors.warning}15;
                    border: 1px solid ${appTheme.colors.warning}30;
                    border-radius: 20px;
                    color: ${appTheme.colors.warning};
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                /* ==================== API ERROR ==================== */
                .api-error {
                    width: 100%;
                    margin: 16px 0 0 0;
                    padding: 0 24px;
                }

                .api-error {
                    background: ${appTheme.colors.error}10;
                    border: 1px solid ${appTheme.colors.error}30;
                    border-radius: ${appTheme.radius.md};
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${appTheme.colors.error};
                    font-size: ${appTheme.fonts.sizes.sm};
                }

                /* ==================== MAIN CONTENT ==================== */
                .main-content {
                    width: 100%;
                    margin: 24px 0;
                    padding: 0 24px;
                }

                /* ==================== PRODUCT ID CARD ==================== */
                .product-id-card {
                    background: linear-gradient(135deg, ${appTheme.colors.primary}10, ${appTheme.colors.secondary}10);
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: ${appTheme.radius.md};
                    padding: 16px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .product-id-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .product-id-info svg {
                    color: ${appTheme.colors.primary};
                }

                .product-id-label {
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                    display: block;
                }

                .product-id-value {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: ${appTheme.colors.primary};
                    font-family: ${appTheme.fonts.families.monospace};
                    letter-spacing: 1px;
                }

                .copy-button {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: ${appTheme.radius.sm};
                    padding: 8px;
                    color: ${appTheme.colors.primary};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .copy-button:hover {
                    background: ${appTheme.colors.hover};
                }

                /* ==================== FORM SECTIONS ==================== */
                .form-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-section {
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.lg};
                    overflow: hidden;
                }

                .section-header {
                    padding: 20px 24px;
                    background: ${appTheme.colors.mutedBackground};
                    border-bottom: 1px solid ${appTheme.colors.border};
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
                    border-radius: ${appTheme.radius.md};
                }

                .section-header-left h2 {
                    font-size: ${appTheme.fonts.sizes.base};
                    font-weight: ${appTheme.fonts.weights.semibold};
                    color: ${appTheme.colors.textPrimary};
                    margin: 0 0 4px 0;
                }

                .section-header-left p {
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                    margin: 0;
                }

                .section-content {
                    padding: 24px;
                }

                /* ==================== FORM LAYOUT ==================== */
                .form-row {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .form-row:last-child {
                    margin-bottom: 0;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .form-group.span-2 {
                    grid-column: span 2;
                }

                .form-group.span-3 {
                    grid-column: span 3;
                }

                .form-group.checkbox-group {
                    justify-content: flex-end;
                }

                .form-group label {
                    font-size: 0.813rem;
                    font-weight: ${appTheme.fonts.weights.medium};
                    color: ${appTheme.colors.textPrimary};
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .label-hint {
                    font-size: 0.688rem;
                    font-weight: normal;
                    color: ${appTheme.colors.textSecondary};
                }

                .required {
                    color: ${appTheme.colors.error};
                    margin-left: 4px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 12px 14px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.938rem;
                    transition: all 0.2s ease;
                    background: ${appTheme.colors.backgroundCard};
                    color: ${appTheme.colors.textPrimary};
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 4px ${appTheme.colors.primary}15;
                }

                .form-group input.error,
                .form-group select.error,
                .form-group textarea.error {
                    border-color: ${appTheme.colors.error};
                }

                .error-text {
                    font-size: 0.688rem;
                    color: ${appTheme.colors.error};
                }

                .help-text {
                    font-size: 0.688rem;
                    color: ${appTheme.colors.textSecondary};
                    margin-top: 4px;
                }

                .input-group {
                    display: flex;
                    gap: 8px;
                }

                .input-group input {
                    flex: 1;
                }

                .icon-button {
                    padding: 12px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    background: ${appTheme.colors.backgroundLight};
                    color: ${appTheme.colors.textSecondary};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .icon-button:hover {
                    background: ${appTheme.colors.hover};
                    color: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                .input-with-hint {
                    position: relative;
                }

                .field-hint {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 0.688rem;
                    color: ${appTheme.colors.textSecondary};
                    pointer-events: none;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    padding: 8px 0;
                    color: ${appTheme.colors.textPrimary};
                }

                .checkbox-label input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: ${appTheme.colors.primary};
                }

                /* ==================== IMAGE SECTION ==================== */
                .image-count {
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                    font-weight: normal;
                }

                .image-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin: 16px 0;
                }

                .image-preview {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1/1;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    overflow: hidden;
                    background: ${appTheme.colors.backgroundLight};
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
                    border-radius: ${appTheme.radius.sm};
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .remove-image-btn:hover {
                    background: ${appTheme.colors.destructive};
                    transform: scale(1.1);
                }

                .upload-area {
                    border: 2px dashed ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 32px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: ${appTheme.colors.backgroundLight};
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
                    margin-bottom: 12px;
                }

                .upload-area p {
                    font-size: 0.938rem;
                    font-weight: ${appTheme.fonts.weights.medium};
                    color: ${appTheme.colors.textPrimary};
                    margin: 0 0 4px 0;
                }

                .upload-area span {
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                }

                /* ==================== SPECIFICATIONS ==================== */
                .spec-input-group {
                    display: grid;
                    grid-template-columns: 1fr 1fr auto;
                    gap: 10px;
                }

                .add-spec-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 0 20px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    cursor: pointer;
                    font-size: ${appTheme.fonts.sizes.sm};
                    font-weight: ${appTheme.fonts.weights.medium};
                    transition: all 0.2s ease;
                }

                .add-spec-btn:hover {
                    background: ${appTheme.colors.primaryDark};
                }

                .specs-list {
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    overflow: hidden;
                    margin-top: 16px;
                }

                .spec-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid ${appTheme.colors.border};
                    background: ${appTheme.colors.backgroundCard};
                }

                .spec-item:last-child {
                    border-bottom: none;
                }

                .spec-item:nth-child(even) {
                    background: ${appTheme.colors.backgroundLight};
                }

                .spec-content {
                    flex: 1;
                    font-size: ${appTheme.fonts.sizes.sm};
                }

                .spec-key {
                    font-weight: ${appTheme.fonts.weights.semibold};
                    color: ${appTheme.colors.textPrimary};
                }

                .spec-value {
                    color: ${appTheme.colors.textSecondary};
                    margin-left: 4px;
                }

                .remove-spec-btn {
                    background: none;
                    border: none;
                    color: ${appTheme.colors.error};
                    cursor: pointer;
                    padding: 4px;
                    border-radius: ${appTheme.radius.sm};
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
                    margin-top: 8px;
                }

                .flag-checkbox {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: ${appTheme.colors.backgroundCard};
                }

                .flag-checkbox input {
                    display: none;
                }

                .flag-checkbox.active {
                    background: ${appTheme.colors.primary}10;
                }

                .flag-checkbox span {
                    font-size: 0.813rem;
                    font-weight: ${appTheme.fonts.weights.medium};
                }

                /* ==================== DIMENSIONS GRID ==================== */
                .dimensions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr auto;
                    gap: 10px;
                    margin-top: 8px;
                }

                .dimensions-grid input,
                .dimensions-grid select {
                    padding: 12px 14px;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.938rem;
                    background: ${appTheme.colors.backgroundCard};
                    color: ${appTheme.colors.textPrimary};
                }

                .dimensions-grid input:focus,
                .dimensions-grid select:focus {
                    outline: none;
                    border-color: ${appTheme.colors.primary};
                    box-shadow: 0 0 0 4px ${appTheme.colors.primary}15;
                }

                /* ==================== MOBILE SAVE ==================== */
                .mobile-save {
                    display: none;
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 16px;
                    background: linear-gradient(to top, ${appTheme.colors.backgroundLight}, transparent);
                    z-index: 100;
                }

                .mobile-save-btn {
                    width: 100%;
                    padding: 16px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: ${appTheme.fonts.sizes.base};
                    font-weight: ${appTheme.fonts.weights.semibold};
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
                @media (max-width: 1200px) {
                    .header-content,
                    .main-content,
                    .company-banner,
                    .api-error {
                        padding: 0 20px;
                    }
                }

                @media (max-width: 1024px) {
                    .form-row {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .form-group.span-2,
                    .form-group.span-3 {
                        grid-column: span 2;
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
                        padding: 0 16px;
                    }

                    .header-actions {
                        width: 100%;
                    }

                    .desktop-save {
                        display: none !important;
                    }

                    .mobile-save {
                        display: block;
                    }

                    .page-title {
                        font-size: ${appTheme.fonts.sizes.xl};
                    }

                    .main-content {
                        padding: 0 16px;
                        margin-bottom: 80px;
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

                    .section-content {
                        padding: 16px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .form-group.span-2,
                    .form-group.span-3 {
                        grid-column: span 1;
                    }

                    .image-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .spec-input-group {
                        grid-template-columns: 1fr;
                    }

                    .add-spec-btn {
                        padding: 12px;
                    }

                    .flags-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .dimensions-grid {
                        grid-template-columns: 1fr 1fr;
                    }

                    .dimensions-grid select {
                        grid-column: span 2;
                    }

                    .upload-area {
                        padding: 24px;
                    }

                    .upload-area p {
                        font-size: ${appTheme.fonts.sizes.sm};
                    }

                    .company-banner,
                    .api-error {
                        padding: 0 16px;
                    }
                }

                @media (max-width: 480px) {
                    .form-group label {
                        font-size: 0.75rem;
                    }

                    .form-group input,
                    .form-group select,
                    .form-group textarea {
                        font-size: 16px;
                        padding: 10px 12px;
                    }

                    .image-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .flags-grid {
                        grid-template-columns: repeat(2, 1fr);
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