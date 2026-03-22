

































// "use client";

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import Head from 'next/head';
// import { appTheme } from '../../../../src/constants/theme';
// import { useAuth } from '../../../../context/AuthContext';
// import {
//     Save, X, ChevronRight, Layers, Layout, Info,
//     CheckCircle, AlertCircle, AlertTriangle, XCircle,
//     Package, DollarSign, Percent, Calendar, Tag, Box,
//     Truck, Globe, Settings, Shield, Zap, Star, Heart,
//     Award, ShoppingCart, Clock, MapPin, Phone, Mail,
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
//     User, Mail as MailIcon, Phone as PhoneIcon, Map,
//     CreditCard as CreditCardIcon, Wallet, Banknote,
//     Receipt as ReceiptIcon, Package as PackageIcon,
//     Truck as TruckIcon, Clock as ClockIcon
// } from 'lucide-react';

// // ==================== CONSTANTS ====================
// const SECTIONS = [
//     { 
//         id: 'customer', 
//         title: 'Customer Details', 
//         icon: User, 
//         color: appTheme.colors.primary,
//         description: 'Customer contact information'
//     },
//     { 
//         id: 'address', 
//         title: 'Address Information', 
//         icon: MapPin, 
//         color: appTheme.colors.secondary,
//         description: 'Shipping and billing addresses'
//     },
//     { 
//         id: 'items', 
//         title: 'Order Items', 
//         icon: Package, 
//         color: appTheme.colors.warning,
//         description: 'Products and quantities'
//     },
//     { 
//         id: 'payment', 
//         title: 'Payment & Review', 
//         icon: CreditCard, 
//         color: appTheme.colors.success,
//         description: 'Payment details and order summary'
//     }
// ];

// const PAYMENT_METHODS = [
//     { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
//     { value: 'cash', label: 'Cash', icon: '💵' },
//     { value: 'card', label: 'Card', icon: '💳' },
//     { value: 'upi', label: 'UPI', icon: '📱' },
//     { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
//     { value: 'wallet', label: 'Wallet', icon: '👛' }
// ];

// const DELIVERY_SLOTS = [
//     { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
//     { value: 'afternoon', label: 'Afternoon (12 PM - 3 PM)' },
//     { value: 'evening', label: 'Evening (3 PM - 6 PM)' },
//     { value: 'night', label: 'Night (6 PM - 9 PM)' }
// ];

// const GST_TYPES = [
//     { value: 'intra-state', label: 'Intra-State (CGST + SGST)' },
//     { value: 'inter-state', label: 'Inter-State (IGST)' }
// ];

// const GST_RATES = [0, 5, 12, 18, 28];

// const CreateOrderPage = () => {
//     const router = useRouter();
//     const { user, isCompanyAdmin, isSuperAdmin, getAuthHeaders } = useAuth();
//     const [expandedSections, setExpandedSections] = useState(['customer']);
//     const [activeTab, setActiveTab] = useState('customer');
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [toast, setToast] = useState({ show: false, type: '', message: '' });
//     const [errors, setErrors] = useState({});
//     const [isMobile, setIsMobile] = useState(false);
//     const [currentStep, setCurrentStep] = useState(1);
//     const [apiError, setApiError] = useState(null);

//     const [formData, setFormData] = useState({
//         customerName: '',
//         customerEmail: '',
//         phoneNumber: '',
//         secondaryPhoneNumber: '',
//         shippingAddress: {
//             street: '',
//             city: '',
//             state: '',
//             pincode: '',
//             landmark: '',
//             country: 'India'
//         },
//         billingAddress: {
//             street: '',
//             city: '',
//             state: '',
//             pincode: '',
//             landmark: '',
//             country: 'India'
//         },
//         sameAsShipping: true,
//         paymentMethod: 'cod',
//         gstType: 'intra-state',
//         items: [{
//             productId: '',
//             productName: '',
//             quantity: 1,
//             mrp: 0,
//             discountPrice: 0,
//             price: 0,
//             gstRate: 18,
//             gstIncluded: true,
//             gstAmount: 0,
//             totalAmount: 0,
//             sku: '',
//             hsnCode: ''
//         }],
//         paidAmount: 0,
//         shippingCharge: 0,
//         orderNotes: '',
//         deliveryDate: '',
//         deliverySlot: ''
//     });

//     // Redirect if not authenticated
//     useEffect(() => {
//         if (!user) {
//             router.push('/login');
//         } else if (!isCompanyAdmin && !isSuperAdmin) {
//             router.push('/dashboard');
//         }
//     }, [user, isCompanyAdmin, isSuperAdmin, router]);

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

//     useEffect(() => {
//         if (user?.companyId) {
//             fetchProducts();
//         }
//     }, [user]);

//     const showToast = (type, message) => {
//         setToast({ show: true, type, message });
//     };

//     const fetchProducts = async () => {
//         try {
//             setLoading(true);
//             const response = await fetch('/api/products?isActive=true', {
//                 headers: getAuthHeaders()
//             });
            
//             if (!response.ok) {
//                 if (response.status === 403) {
//                     throw new Error("You don't have permission to view products");
//                 }
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
            
//             const data = await response.json();
//             if (data.success) {
//                 setProducts(data.data);
//             } else {
//                 showToast('error', 'Failed to fetch products: ' + data.message);
//             }
//         } catch (error) {
//             console.error('Error fetching products:', error);
//             setApiError(error.message);
//             showToast('error', error.message || 'Error fetching products');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         // Customer name validation
//         if (!formData.customerName.trim()) {
//             newErrors.customerName = 'Customer name is required';
//         }

//         // Email validation
//         if (!formData.customerEmail.trim()) {
//             newErrors.customerEmail = 'Customer email is required';
//         } else {
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//             if (!emailRegex.test(formData.customerEmail)) {
//                 newErrors.customerEmail = 'Please enter a valid email address';
//             }
//         }

//         // Phone number validation
//         if (!formData.phoneNumber.trim()) {
//             newErrors.phoneNumber = 'Phone number is required';
//         } else {
//             const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
//             if (cleanPhone.length !== 10) {
//                 newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
//             }
//         }

//         // Secondary phone number validation (optional)
//         if (formData.secondaryPhoneNumber.trim()) {
//             const cleanSecondary = formData.secondaryPhoneNumber.replace(/\D/g, '');
//             if (cleanSecondary.length !== 10) {
//                 newErrors.secondaryPhoneNumber = 'Please enter a valid 10-digit phone number';
//             }
//         }

//         // Shipping address validation
//         const address = formData.shippingAddress;
        
//         if (!address.street.trim()) {
//             newErrors.shippingStreet = 'Street address is required';
//         } else if (address.street.trim().length < 5) {
//             newErrors.shippingStreet = 'Please enter a complete street address';
//         }

//         if (!address.city.trim()) {
//             newErrors.shippingCity = 'City is required';
//         }

//         if (!address.state.trim()) {
//             newErrors.shippingState = 'State is required';
//         }

//         if (!address.pincode.trim()) {
//             newErrors.shippingPincode = 'Pincode is required';
//         } else if (!/^\d{6}$/.test(address.pincode)) {
//             newErrors.shippingPincode = 'Please enter a valid 6-digit pincode';
//         }

//         // GST type validation
//         if (!formData.gstType) {
//             newErrors.gstType = 'GST type is required';
//         }

//         // Payment method validation
//         if (!formData.paymentMethod) {
//             newErrors.paymentMethod = 'Payment method is required';
//         }

//         // Paid amount validation
//         if (formData.paidAmount < 0) {
//             newErrors.paidAmount = 'Paid amount cannot be negative';
//         }

//         // Items validation
//         formData.items.forEach((item, index) => {
//             if (!item.productId) {
//                 newErrors[`item_${index}_product`] = 'Please select a product';
//             }
            
//             if (!item.quantity || item.quantity < 1) {
//                 newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
//             } else {
//                 const selectedProduct = products.find(p => p._id === item.productId);
//                 if (selectedProduct) {
//                     if (item.quantity > selectedProduct.stock) {
//                         newErrors[`item_${index}_quantity`] = `Only ${selectedProduct.stock} units available`;
//                     }
//                     if (item.quantity > (selectedProduct.maxOrderQuantity || 10)) {
//                         newErrors[`item_${index}_quantity`] = `Maximum ${selectedProduct.maxOrderQuantity || 10} units allowed`;
//                     }
//                 }
//             }

//             if (item.discountPrice > item.mrp) {
//                 newErrors[`item_${index}_price`] = 'Discount price cannot be greater than MRP';
//             }
//         });

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
        
//         if (name.startsWith('shipping.')) {
//             const field = name.split('.')[1];
//             setFormData(prev => ({
//                 ...prev,
//                 shippingAddress: {
//                     ...prev.shippingAddress,
//                     [field]: value
//                 }
//             }));
            
//             // If sameAsShipping is true, update billing address
//             if (formData.sameAsShipping) {
//                 setFormData(prev => ({
//                     ...prev,
//                     billingAddress: {
//                         ...prev.billingAddress,
//                         [field]: value
//                     }
//                 }));
//             }
//         } else if (name.startsWith('billing.')) {
//             const field = name.split('.')[1];
//             setFormData(prev => ({
//                 ...prev,
//                 billingAddress: {
//                     ...prev.billingAddress,
//                     [field]: value
//                 }
//             }));
//         } else if (type === 'checkbox') {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: checked
//             }));
            
//             // If sameAsShipping is checked, copy shipping to billing
//             if (name === 'sameAsShipping' && checked) {
//                 setFormData(prev => ({
//                     ...prev,
//                     billingAddress: { ...prev.shippingAddress }
//                 }));
//             }
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: value
//             }));
//         }
        
//         // Clear error when user starts typing
//         if (errors[name]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [name]: ''
//             }));
//         }
//     };

//     const handleItemChange = (index, field, value) => {
//         const updatedItems = [...formData.items];
        
//         if (field === 'productId') {
//             const selectedProduct = products.find(p => p._id === value);
//             if (selectedProduct) {
//                 updatedItems[index] = {
//                     ...updatedItems[index],
//                     productId: value,
//                     productName: selectedProduct.productName,
//                     mrp: selectedProduct.mrp,
//                     discountPrice: selectedProduct.discountPrice,
//                     price: selectedProduct.discountPrice,
//                     gstRate: selectedProduct.gstRate || 18,
//                     gstIncluded: selectedProduct.gstIncluded !== false,
//                     sku: selectedProduct.sku,
//                     hsnCode: selectedProduct.hsnCode,
//                     gstAmount: 0,
//                     totalAmount: 0
//                 };
                
//                 calculateItemTotals(updatedItems[index]);
                
//                 if (errors[`item_${index}_product`]) {
//                     setErrors(prev => ({
//                         ...prev,
//                         [`item_${index}_product`]: ''
//                     }));
//                 }
//             }
//         } else if (field === 'quantity' || field === 'price' || field === 'discountPrice' || field === 'mrp') {
//             const numValue = parseFloat(value) || 0;
//             updatedItems[index][field] = field === 'quantity' ? Math.max(1, Math.floor(numValue)) : numValue;
            
//             if (updatedItems[index].discountPrice > updatedItems[index].mrp) {
//                 updatedItems[index].discountPrice = updatedItems[index].mrp;
//             }
            
//             if (field === 'discountPrice') {
//                 updatedItems[index].price = updatedItems[index].discountPrice;
//             }
            
//             calculateItemTotals(updatedItems[index]);
            
//             if (field === 'quantity' && errors[`item_${index}_quantity`]) {
//                 setErrors(prev => ({
//                     ...prev,
//                     [`item_${index}_quantity`]: ''
//                 }));
//             }
//         } else if (field === 'gstRate') {
//             updatedItems[index].gstRate = parseFloat(value) || 0;
//             calculateItemTotals(updatedItems[index]);
//         } else if (field === 'gstIncluded') {
//             updatedItems[index].gstIncluded = value;
//             calculateItemTotals(updatedItems[index]);
//         }

//         setFormData(prev => ({
//             ...prev,
//             items: updatedItems
//         }));
//     };

//     const calculateItemTotals = (item) => {
//         const itemTotal = item.quantity * item.price;
//         item.totalAmount = itemTotal;
        
//         if (!item.gstIncluded) {
//             item.gstAmount = (itemTotal * item.gstRate) / 100;
//         } else {
//             const basePrice = itemTotal * 100 / (100 + item.gstRate);
//             item.gstAmount = itemTotal - basePrice;
//         }
//     };

//     const addItem = () => {
//         setFormData(prev => ({
//             ...prev,
//             items: [...prev.items, {
//                 productId: '',
//                 productName: '',
//                 quantity: 1,
//                 mrp: 0,
//                 discountPrice: 0,
//                 price: 0,
//                 gstRate: 18,
//                 gstIncluded: true,
//                 gstAmount: 0,
//                 totalAmount: 0,
//                 sku: '',
//                 hsnCode: ''
//             }]
//         }));
//     };

//     const removeItem = (index) => {
//         if (formData.items.length > 1) {
//             const updatedItems = formData.items.filter((_, i) => i !== index);
//             setFormData(prev => ({
//                 ...prev,
//                 items: updatedItems
//             }));

//             const newErrors = { ...errors };
//             delete newErrors[`item_${index}_product`];
//             delete newErrors[`item_${index}_quantity`];
//             delete newErrors[`item_${index}_price`];
//             setErrors(newErrors);
//         }
//     };

//     const calculateSubtotal = () => {
//         return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//     };

//     const calculateTotalGST = () => {
//         return formData.items.reduce((total, item) => total + (item.gstAmount || 0), 0);
//     };

//     const calculateTotalDiscount = () => {
//         return formData.items.reduce((total, item) => 
//             total + (item.quantity * (item.mrp - item.price)), 0
//         );
//     };

//     const calculateTotal = () => {
//         return calculateSubtotal() + calculateTotalGST() + (formData.shippingCharge || 0);
//     };

//     const getAvailableStock = (productId) => {
//         const product = products.find(p => p._id === productId);
//         return product ? product.stock : 0;
//     };

//     const getProductDetails = (productId) => {
//         return products.find(p => p._id === productId);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             showToast('error', 'Please fix the errors before submitting');
//             const firstError = Object.keys(errors)[0];
//             if (firstError) {
//                 const element = document.getElementById(firstError);
//                 if (element) {
//                     element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                 }
//             }
//             return;
//         }

//         const total = calculateTotal();
//         if (formData.paidAmount > total) {
//             showToast('error', 'Paid amount cannot be greater than order total');
//             return;
//         }

//         setSaving(true);
//         setApiError(null);

//         try {
//             const orderData = {
//                 companyId: user?.companyId,
//                 customerName: formData.customerName.trim(),
//                 customerEmail: formData.customerEmail.trim().toLowerCase(),
//                 phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
//                 secondaryPhoneNumber: formData.secondaryPhoneNumber ? formData.secondaryPhoneNumber.replace(/\D/g, '') : null,
//                 shippingAddress: formData.shippingAddress,
//                 billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
//                 sameAsShipping: formData.sameAsShipping,
//                 paymentMethod: formData.paymentMethod,
//                 gstType: formData.gstType,
//                 items: formData.items.map(item => ({
//                     productId: item.productId,
//                     productName: item.productName,
//                     quantity: item.quantity,
//                     mrp: item.mrp,
//                     discountPrice: item.discountPrice,
//                     price: item.price,
//                     gstRate: item.gstRate,
//                     gstIncluded: item.gstIncluded,
//                     gstAmount: item.gstAmount,
//                     totalAmount: item.totalAmount,
//                     sku: item.sku,
//                     hsnCode: item.hsnCode
//                 })),
//                 subtotal: calculateSubtotal(),
//                 totalDiscount: calculateTotalDiscount(),
//                 totalGst: calculateTotalGST(),
//                 shippingCharge: formData.shippingCharge || 0,
//                 totalPrice: total,
//                 paidAmount: formData.paidAmount || 0,
//                 paymentStatus: formData.paidAmount >= total ? 'paid' : (formData.paidAmount > 0 ? 'partial' : 'pending'),
//                 orderNotes: formData.orderNotes,
//                 deliveryDate: formData.deliveryDate || null,
//                 deliverySlot: formData.deliverySlot || null,
//                 createdBy: user?.id,
//                 status: 'pending',
//                 statusHistory: [{
//                     status: 'pending',
//                     timestamp: new Date().toISOString(),
//                     comment: 'Order created manually',
//                     updatedBy: user?.id
//                 }],
//                 source: 'admin'
//             };

//             const response = await fetch('/api/orders', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     ...getAuthHeaders()
//                 },
//                 body: JSON.stringify(orderData),
//             });

//             const data = await response.json();

//             if (data.success) {
//                 showToast('success', 'Order created successfully!');
//                 setTimeout(() => router.push('/admin/orders'), 1500);
//             } else {
//                 if (response.status === 403) {
//                     throw new Error("You don't have permission to create orders");
//                 }
//                 showToast('error', `Error creating order: ${data.message || data.error || 'Unknown error'}`);
//             }
//         } catch (error) {
//             console.error('Error creating order:', error);
//             setApiError(error.message);
//             showToast('error', error.message || 'Error creating order. Please try again.');
//         } finally {
//             setSaving(false);
//         }
//     };

//     const handleBack = useCallback(() => {
//         if (window.history.length > 1) {
//             router.back();
//         } else {
//             router.push('/admin/orders');
//         }
//     }, [router]);

//     const toggleSection = (sectionId) => {
//         setExpandedSections(prev => {
//             if (prev.includes(sectionId)) {
//                 return prev.filter(id => id !== sectionId);
//             } else {
//                 return [...prev, sectionId];
//             }
//         });
//         setCurrentStep(SECTIONS.findIndex(s => s.id === sectionId) + 1);
//     };

//     const handleTabClick = (tabId) => {
//         setActiveTab(tabId);
//         if (!expandedSections.includes(tabId)) {
//             setExpandedSections(prev => [...prev, tabId]);
//         }
//     };

//     const expandAll = () => {
//         setExpandedSections(SECTIONS.map(s => s.id));
//     };

//     const collapseAll = () => {
//         setExpandedSections([]);
//     };

//     if (!user) {
//         return (
//             <div className="loading-container">
//                 <div className="loading-grid">
//                     <div className="loading-card"></div>
//                     <div className="loading-card"></div>
//                     <div className="loading-card"></div>
//                 </div>
//                 <p className="loading-text">Checking authentication...</p>
//                 <style jsx>{`
//                     .loading-container {
//                         min-height: 100vh;
//                         display: flex;
//                         flex-direction: column;
//                         align-items: center;
//                         justify-content: center;
//                         background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
//                     }
//                     .loading-grid {
//                         display: grid;
//                         grid-template-columns: repeat(3, 1fr);
//                         gap: 16px;
//                         margin-bottom: 24px;
//                     }
//                     .loading-card {
//                         width: 80px;
//                         height: 80px;
//                         background: white;
//                         border-radius: 8px;
//                         animation: pulse 1.5s ease-in-out infinite;
//                     }
//                     .loading-card:nth-child(2) {
//                         animation-delay: 0.2s;
//                     }
//                     .loading-card:nth-child(3) {
//                         animation-delay: 0.4s;
//                     }
//                     @keyframes pulse {
//                         0%, 100% {
//                             opacity: 0.6;
//                             transform: scale(1);
//                         }
//                         50% {
//                             opacity: 1;
//                             transform: scale(1.05);
//                         }
//                     }
//                     .loading-text {
//                         color: #64748b;
//                         font-size: 0.875rem;
//                         font-weight: 500;
//                     }
//                 `}</style>
//             </div>
//         );
//     }

//     if (loading) {
//         return (
//             <div className="loading-container">
//                 <div className="loading-grid">
//                     <div className="loading-card"></div>
//                     <div className="loading-card"></div>
//                     <div className="loading-card"></div>
//                 </div>
//                 <p className="loading-text">Loading products...</p>
//                 <style jsx>{`
//                     .loading-container {
//                         min-height: 100vh;
//                         display: flex;
//                         flex-direction: column;
//                         align-items: center;
//                         justify-content: center;
//                         background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
//                     }
//                     .loading-grid {
//                         display: grid;
//                         grid-template-columns: repeat(3, 1fr);
//                         gap: 16px;
//                         margin-bottom: 24px;
//                     }
//                     .loading-card {
//                         width: 80px;
//                         height: 80px;
//                         background: white;
//                         border-radius: 8px;
//                         animation: pulse 1.5s ease-in-out infinite;
//                     }
//                     .loading-card:nth-child(2) {
//                         animation-delay: 0.2s;
//                     }
//                     .loading-card:nth-child(3) {
//                         animation-delay: 0.4s;
//                     }
//                     @keyframes pulse {
//                         0%, 100% {
//                             opacity: 0.6;
//                             transform: scale(1);
//                         }
//                         50% {
//                             opacity: 1;
//                             transform: scale(1.05);
//                         }
//                     }
//                     .loading-text {
//                         color: #64748b;
//                         font-size: 0.875rem;
//                         font-weight: 500;
//                     }
//                 `}</style>
//             </div>
//         );
//     }

//     return (
//         <>
//             <Head>
//                 <title>Create New Order | LFMS</title>
//                 <meta name="viewport" content="width=device-width, initial-scale=1" />
//                 <meta name="description" content="Create a new customer order with advanced features" />
//             </Head>

//             <div className="create-order-page">
//                 {/* Toast Notification */}
//                 {toast.show && (
//                     <div className={`toast-notification ${toast.type}`}>
//                         {toast.type === 'success' ? <CheckCircle size={20} /> : 
//                          toast.type === 'error' ? <AlertCircle size={20} /> : 
//                          <AlertTriangle size={20} />}
//                         <span>{toast.message}</span>
//                     </div>
//                 )}

//                 {/* Company Context Banner */}
//                 <div className="company-banner">
//                     <div className="company-banner-content">
//                         <div className="company-banner-left">
//                             <Building2 size={20} />
//                             <span>
//                                 {isSuperAdmin ? 'Super Admin View' : 'Company Admin View'} - 
//                                 {user?.companyName || 'Your Company'}
//                             </span>
//                         </div>
//                         {isSuperAdmin && (
//                             <div className="super-admin-badge">
//                                 <Shield size={16} />
//                                 Super Admin
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* API Error Message */}
//                 {apiError && (
//                     <div className="api-error">
//                         <AlertCircle size={20} />
//                         <span>{apiError}</span>
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
//                                 <span>Back</span>
//                             </button>
//                             <h1 className="page-title">
//                                 <ShoppingCart size={28} className="title-icon" />
//                                 Create New Order
//                             </h1>
//                             <p className="page-description">
//                                 Create a comprehensive customer order with GST, pricing, and payment tracking
//                             </p>
//                         </div>
//                         <div className="header-actions">
//                             <button
//                                 onClick={expandAll}
//                                 className="header-action-btn"
//                                 title="Expand all sections"
//                             >
//                                 <Layers size={18} />
//                             </button>
//                             <button
//                                 onClick={collapseAll}
//                                 className="header-action-btn"
//                                 title="Collapse all sections"
//                             >
//                                 <Layout size={18} />
//                             </button>
//                             <button
//                                 onClick={handleSubmit}
//                                 disabled={saving}
//                                 className="save-button"
//                             >
//                                 {saving ? (
//                                     <>
//                                         <div className="button-spinner"></div>
//                                         <span>Creating...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save size={16} />
//                                         <span>Create Order</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </header>

//                 {/* Desktop Horizontal Tabs */}
//                 <div className="desktop-tabs">
//                     {SECTIONS.map(section => {
//                         const Icon = section.icon;
//                         return (
//                             <button
//                                 key={section.id}
//                                 className={`tab-button ${activeTab === section.id ? 'active' : ''}`}
//                                 onClick={() => handleTabClick(section.id)}
//                             >
//                                 <div className="tab-icon" style={{ 
//                                     backgroundColor: activeTab === section.id ? `${section.color}20` : 'transparent',
//                                     color: activeTab === section.id ? section.color : '#64748b'
//                                 }}>
//                                     <Icon size={20} />
//                                 </div>
//                                 <span className="tab-title" style={{
//                                     color: activeTab === section.id ? '#0f172a' : '#64748b',
//                                     fontWeight: activeTab === section.id ? '600' : '500'
//                                 }}>{section.title}</span>
//                                 {activeTab === section.id && (
//                                     <div className="active-indicator" style={{ backgroundColor: section.color }}></div>
//                                 )}
//                             </button>
//                         );
//                     })}
//                 </div>

//                 {/* Mobile Steps */}
//                 <div className="mobile-steps">
//                     {SECTIONS.map((section, index) => {
//                         const Icon = section.icon;
//                         const stepNumber = index + 1;
//                         return (
//                             <div
//                                 key={section.id}
//                                 className={`mobile-step ${currentStep === stepNumber ? 'active' : ''}`}
//                                 onClick={() => {
//                                     setCurrentStep(stepNumber);
//                                     handleTabClick(section.id);
//                                 }}
//                             >
//                                 <div className="mobile-step-icon" style={{
//                                     backgroundColor: currentStep === stepNumber ? 'white' : `${section.color}15`,
//                                     color: currentStep === stepNumber ? section.color : section.color
//                                 }}>
//                                     <Icon size={16} />
//                                 </div>
//                                 <span className="mobile-step-name">{section.title}</span>
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Main Content */}
//                 <main className="main-content">
//                     {/* Sections */}
//                     <div className="sections-container">
//                         {SECTIONS.map(section => {
//                             const Icon = section.icon;
//                             const isExpanded = expandedSections.includes(section.id);
                            
//                             return (
//                                 <div key={section.id} className={`section-card ${activeTab === section.id ? 'active' : ''}`}>
//                                     {/* Section Header */}
//                                     <div 
//                                         className="section-header"
//                                         onClick={() => toggleSection(section.id)}
//                                     >
//                                         <div className="section-header-left">
//                                             <div 
//                                                 className="section-icon"
//                                                 style={{ background: `${section.color}15`, color: section.color }}
//                                             >
//                                                 <Icon size={20} />
//                                             </div>
//                                             <div className="section-title">
//                                                 <h2>{section.title}</h2>
//                                                 <p>{section.description}</p>
//                                             </div>
//                                         </div>
//                                         <div className="section-header-right">
//                                             <ChevronRight 
//                                                 size={20} 
//                                                 className={`chevron-icon ${isExpanded ? 'expanded' : ''}`}
//                                                 style={{
//                                                     transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
//                                                     transition: 'transform 0.3s ease'
//                                                 }}
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* Section Content */}
//                                     {isExpanded && (
//                                         <div className="section-content">
//                                             {/* Customer Details Section */}
//                                             {section.id === 'customer' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <User size={16} />
//                                                             Customer Information
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Customer Name <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="customerName"
//                                                                     id="customerName"
//                                                                     value={formData.customerName}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.customerName ? 'error' : ''}
//                                                                     placeholder="Enter customer full name"
//                                                                 />
//                                                                 {errors.customerName && <span className="error-text">{errors.customerName}</span>}
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Email Address <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="email"
//                                                                     name="customerEmail"
//                                                                     id="customerEmail"
//                                                                     value={formData.customerEmail}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.customerEmail ? 'error' : ''}
//                                                                     placeholder="customer@example.com"
//                                                                 />
//                                                                 {errors.customerEmail && <span className="error-text">{errors.customerEmail}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Phone Number <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="tel"
//                                                                     name="phoneNumber"
//                                                                     id="phoneNumber"
//                                                                     value={formData.phoneNumber}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.phoneNumber ? 'error' : ''}
//                                                                     placeholder="10-digit phone number"
//                                                                     maxLength={10}
//                                                                 />
//                                                                 {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Secondary Phone</label>
//                                                                 <input
//                                                                     type="tel"
//                                                                     name="secondaryPhoneNumber"
//                                                                     id="secondaryPhoneNumber"
//                                                                     value={formData.secondaryPhoneNumber}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.secondaryPhoneNumber ? 'error' : ''}
//                                                                     placeholder="Alternate phone number"
//                                                                     maxLength={10}
//                                                                 />
//                                                                 {errors.secondaryPhoneNumber && <span className="error-text">{errors.secondaryPhoneNumber}</span>}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Address Section */}
//                                             {section.id === 'address' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <MapPin size={16} />
//                                                             Shipping Address
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field span-2">
//                                                                 <label>Street Address <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="shipping.street"
//                                                                     value={formData.shippingAddress.street}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.shippingStreet ? 'error' : ''}
//                                                                     placeholder="Door No, Building, Street, Area"
//                                                                 />
//                                                                 {errors.shippingStreet && <span className="error-text">{errors.shippingStreet}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>City <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="shipping.city"
//                                                                     value={formData.shippingAddress.city}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.shippingCity ? 'error' : ''}
//                                                                     placeholder="City"
//                                                                 />
//                                                                 {errors.shippingCity && <span className="error-text">{errors.shippingCity}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>State <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="shipping.state"
//                                                                     value={formData.shippingAddress.state}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.shippingState ? 'error' : ''}
//                                                                     placeholder="State"
//                                                                 />
//                                                                 {errors.shippingState && <span className="error-text">{errors.shippingState}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Pincode <span className="required">*</span></label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="shipping.pincode"
//                                                                     value={formData.shippingAddress.pincode}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.shippingPincode ? 'error' : ''}
//                                                                     placeholder="6-digit pincode"
//                                                                     maxLength={6}
//                                                                 />
//                                                                 {errors.shippingPincode && <span className="error-text">{errors.shippingPincode}</span>}
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Landmark</label>
//                                                                 <input
//                                                                     type="text"
//                                                                     name="shipping.landmark"
//                                                                     value={formData.shippingAddress.landmark}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Nearby landmark"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <div className="toggle-field">
//                                                             <label className="toggle">
//                                                                 <input
//                                                                     type="checkbox"
//                                                                     name="sameAsShipping"
//                                                                     checked={formData.sameAsShipping}
//                                                                     onChange={handleInputChange}
//                                                                 />
//                                                                 <span className="toggle-slider"></span>
//                                                                 <span className="toggle-label">Billing address same as shipping address</span>
//                                                             </label>
//                                                         </div>
//                                                     </div>

//                                                     {!formData.sameAsShipping && (
//                                                         <div className="form-block">
//                                                             <h3>
//                                                                 <MapPin size={16} />
//                                                                 Billing Address
//                                                             </h3>
//                                                             <div className="form-grid">
//                                                                 <div className="form-field span-2">
//                                                                     <label>Street Address <span className="required">*</span></label>
//                                                                     <input
//                                                                         type="text"
//                                                                         name="billing.street"
//                                                                         value={formData.billingAddress.street}
//                                                                         onChange={handleInputChange}
//                                                                         placeholder="Door No, Building, Street, Area"
//                                                                     />
//                                                                 </div>

//                                                                 <div className="form-field">
//                                                                     <label>City <span className="required">*</span></label>
//                                                                     <input
//                                                                         type="text"
//                                                                         name="billing.city"
//                                                                         value={formData.billingAddress.city}
//                                                                         onChange={handleInputChange}
//                                                                         placeholder="City"
//                                                                     />
//                                                                 </div>

//                                                                 <div className="form-field">
//                                                                     <label>State <span className="required">*</span></label>
//                                                                     <input
//                                                                         type="text"
//                                                                         name="billing.state"
//                                                                         value={formData.billingAddress.state}
//                                                                         onChange={handleInputChange}
//                                                                         placeholder="State"
//                                                                     />
//                                                                 </div>

//                                                                 <div className="form-field">
//                                                                     <label>Pincode <span className="required">*</span></label>
//                                                                     <input
//                                                                         type="text"
//                                                                         name="billing.pincode"
//                                                                         value={formData.billingAddress.pincode}
//                                                                         onChange={handleInputChange}
//                                                                         placeholder="6-digit pincode"
//                                                                         maxLength={6}
//                                                                     />
//                                                                 </div>

//                                                                 <div className="form-field span-2">
//                                                                     <label>Landmark</label>
//                                                                     <input
//                                                                         type="text"
//                                                                         name="billing.landmark"
//                                                                         value={formData.billingAddress.landmark}
//                                                                         onChange={handleInputChange}
//                                                                         placeholder="Nearby landmark"
//                                                                     />
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     )}
//                                                 </>
//                                             )}

//                                             {/* Order Items Section */}
//                                             {section.id === 'items' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <div className="section-header">
//                                                             <h3>
//                                                                 <Package size={16} />
//                                                                 Order Items
//                                                             </h3>
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={addItem}
//                                                                 className="add-button"
//                                                             >
//                                                                 <Plus size={16} />
//                                                                 <span>Add Item</span>
//                                                             </button>
//                                                         </div>

//                                                         <div className="items-list">
//                                                             {formData.items.map((item, index) => {
//                                                                 const product = item.productId ? getProductDetails(item.productId) : null;
                                                                
//                                                                 return (
//                                                                     <div key={index} className="item-card">
//                                                                         <div className="item-header">
//                                                                             <span className="item-number">Item #{index + 1}</span>
//                                                                             {formData.items.length > 1 && (
//                                                                                 <button
//                                                                                     type="button"
//                                                                                     onClick={() => removeItem(index)}
//                                                                                     className="remove-item-btn"
//                                                                                 >
//                                                                                     <Trash2 size={14} />
//                                                                                 </button>
//                                                                             )}
//                                                                         </div>

//                                                                         <div className="item-grid">
//                                                                             <div className="form-field span-2">
//                                                                                 <label>Product <span className="required">*</span></label>
//                                                                                 <select
//                                                                                     value={item.productId}
//                                                                                     onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
//                                                                                     className={errors[`item_${index}_product`] ? 'error' : ''}
//                                                                                 >
//                                                                                     <option value="">Select a product</option>
//                                                                                     {products.map(product => (
//                                                                                         <option 
//                                                                                             key={product._id} 
//                                                                                             value={product._id}
//                                                                                             disabled={product.stock === 0}
//                                                                                         >
//                                                                                             {product.productName} - MRP: ₹{product.mrp} | Price: ₹{product.discountPrice} 
//                                                                                             {product.stock === 0 ? ' (Out of Stock)' : ` (Stock: ${product.stock})`}
//                                                                                         </option>
//                                                                                     ))}
//                                                                                 </select>
//                                                                                 {errors[`item_${index}_product`] && (
//                                                                                     <span className="error-text">{errors[`item_${index}_product`]}</span>
//                                                                                 )}
//                                                                             </div>

//                                                                             {product && (
//                                                                                 <>
//                                                                                     <div className="form-field">
//                                                                                         <label>MRP (₹)</label>
//                                                                                         <input
//                                                                                             type="number"
//                                                                                             min="0"
//                                                                                             step="0.01"
//                                                                                             value={item.mrp}
//                                                                                             onChange={(e) => handleItemChange(index, 'mrp', e.target.value)}
//                                                                                         />
//                                                                                     </div>

//                                                                                     <div className="form-field">
//                                                                                         <label>Price (₹)</label>
//                                                                                         <input
//                                                                                             type="number"
//                                                                                             min="0"
//                                                                                             step="0.01"
//                                                                                             value={item.discountPrice}
//                                                                                             onChange={(e) => handleItemChange(index, 'discountPrice', e.target.value)}
//                                                                                             className={errors[`item_${index}_price`] ? 'error' : ''}
//                                                                                         />
//                                                                                         {errors[`item_${index}_price`] && (
//                                                                                             <span className="error-text">{errors[`item_${index}_price`]}</span>
//                                                                                         )}
//                                                                                     </div>

//                                                                                     <div className="form-field">
//                                                                                         <label>Quantity <span className="required">*</span></label>
//                                                                                         <input
//                                                                                             type="number"
//                                                                                             min="1"
//                                                                                             max={product?.stock}
//                                                                                             value={item.quantity}
//                                                                                             onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
//                                                                                             className={errors[`item_${index}_quantity`] ? 'error' : ''}
//                                                                                         />
//                                                                                         {errors[`item_${index}_quantity`] && (
//                                                                                             <span className="error-text">{errors[`item_${index}_quantity`]}</span>
//                                                                                         )}
//                                                                                     </div>

//                                                                                     <div className="form-field">
//                                                                                         <label>GST Rate (%)</label>
//                                                                                         <select
//                                                                                             value={item.gstRate}
//                                                                                             onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
//                                                                                         >
//                                                                                             {GST_RATES.map(rate => (
//                                                                                                 <option key={rate} value={rate}>{rate}%</option>
//                                                                                             ))}
//                                                                                         </select>
//                                                                                     </div>

//                                                                                     <div className="form-field checkbox-field">
//                                                                                         <label className="checkbox-label">
//                                                                                             <input
//                                                                                                 type="checkbox"
//                                                                                                 checked={item.gstIncluded}
//                                                                                                 onChange={(e) => handleItemChange(index, 'gstIncluded', e.target.checked)}
//                                                                                             />
//                                                                                             <span>GST Included</span>
//                                                                                         </label>
//                                                                                     </div>
//                                                                                 </>
//                                                                             )}
//                                                                         </div>

//                                                                         {item.productId && (
//                                                                             <div className="item-summary">
//                                                                                 <div className="summary-row">
//                                                                                     <span>Subtotal:</span>
//                                                                                     <span>₹{(item.price * item.quantity).toFixed(2)}</span>
//                                                                                 </div>
//                                                                                 <div className="summary-row">
//                                                                                     <span>GST ({item.gstRate}%):</span>
//                                                                                     <span>₹{(item.gstAmount || 0).toFixed(2)}</span>
//                                                                                 </div>
//                                                                                 <div className="summary-row total">
//                                                                                     <span>Total:</span>
//                                                                                     <span>₹{((item.price * item.quantity) + (item.gstAmount || 0)).toFixed(2)}</span>
//                                                                                 </div>
//                                                                             </div>
//                                                                         )}

//                                                                         {item.productId && (
//                                                                             <div className="item-info">
//                                                                                 <span className="info-badge">SKU: {item.sku}</span>
//                                                                                 <span className="info-badge">HSN: {item.hsnCode}</span>
//                                                                                 <span className="info-badge">Available: {getAvailableStock(item.productId)} units</span>
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 );
//                                                             })}
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}

//                                             {/* Payment & Review Section */}
//                                             {section.id === 'payment' && (
//                                                 <>
//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <CreditCard size={16} />
//                                                             Payment Details
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Payment Method <span className="required">*</span></label>
//                                                                 <select
//                                                                     name="paymentMethod"
//                                                                     value={formData.paymentMethod}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.paymentMethod ? 'error' : ''}
//                                                                 >
//                                                                     {PAYMENT_METHODS.map(method => (
//                                                                         <option key={method.value} value={method.value}>
//                                                                             {method.icon} {method.label}
//                                                                         </option>
//                                                                     ))}
//                                                                 </select>
//                                                                 {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>GST Type <span className="required">*</span></label>
//                                                                 <select
//                                                                     name="gstType"
//                                                                     value={formData.gstType}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.gstType ? 'error' : ''}
//                                                                 >
//                                                                     {GST_TYPES.map(type => (
//                                                                         <option key={type.value} value={type.value}>{type.label}</option>
//                                                                     ))}
//                                                                 </select>
//                                                                 {errors.gstType && <span className="error-text">{errors.gstType}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Paid Amount (₹)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="paidAmount"
//                                                                     min="0"
//                                                                     step="0.01"
//                                                                     value={formData.paidAmount}
//                                                                     onChange={handleInputChange}
//                                                                     className={errors.paidAmount ? 'error' : ''}
//                                                                     placeholder="Amount already paid"
//                                                                 />
//                                                                 {errors.paidAmount && <span className="error-text">{errors.paidAmount}</span>}
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Shipping Charge (₹)</label>
//                                                                 <input
//                                                                     type="number"
//                                                                     name="shippingCharge"
//                                                                     min="0"
//                                                                     step="0.01"
//                                                                     value={formData.shippingCharge}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Shipping cost"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="form-block">
//                                                         <h3>
//                                                             <Calendar size={16} />
//                                                             Delivery Information
//                                                         </h3>
//                                                         <div className="form-grid">
//                                                             <div className="form-field">
//                                                                 <label>Delivery Date</label>
//                                                                 <input
//                                                                     type="date"
//                                                                     name="deliveryDate"
//                                                                     value={formData.deliveryDate}
//                                                                     onChange={handleInputChange}
//                                                                     min={new Date().toISOString().split('T')[0]}
//                                                                 />
//                                                             </div>

//                                                             <div className="form-field">
//                                                                 <label>Delivery Slot</label>
//                                                                 <select
//                                                                     name="deliverySlot"
//                                                                     value={formData.deliverySlot}
//                                                                     onChange={handleInputChange}
//                                                                 >
//                                                                     <option value="">Select slot</option>
//                                                                     {DELIVERY_SLOTS.map(slot => (
//                                                                         <option key={slot.value} value={slot.value}>{slot.label}</option>
//                                                                     ))}
//                                                                 </select>
//                                                             </div>

//                                                             <div className="form-field span-2">
//                                                                 <label>Order Notes</label>
//                                                                 <textarea
//                                                                     name="orderNotes"
//                                                                     rows={3}
//                                                                     value={formData.orderNotes}
//                                                                     onChange={handleInputChange}
//                                                                     placeholder="Any special instructions or notes for this order"
//                                                                 />
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     {/* Order Summary */}
//                                                     <div className="order-summary">
//                                                         <h3>Order Summary</h3>
                                                        
//                                                         <div className="summary-items">
//                                                             {formData.items.map((item, index) => (
//                                                                 <div key={index} className="summary-item">
//                                                                     <div className="summary-item-name">{item.productName || `Item ${index + 1}`}</div>
//                                                                     <div className="summary-item-details">
//                                                                         <span>Qty: {item.quantity}</span>
//                                                                         <span>₹{item.price}</span>
//                                                                         <span>GST: ₹{(item.gstAmount || 0).toFixed(2)}</span>
//                                                                     </div>
//                                                                 </div>
//                                                             ))}
//                                                         </div>

//                                                         <div className="summary-totals">
//                                                             <div className="total-row">
//                                                                 <span>Subtotal:</span>
//                                                                 <span>₹{calculateSubtotal().toFixed(2)}</span>
//                                                             </div>
                                                            
//                                                             <div className="total-row">
//                                                                 <span>Total Discount:</span>
//                                                                 <span className="discount">- ₹{calculateTotalDiscount().toFixed(2)}</span>
//                                                             </div>
                                                            
//                                                             <div className="total-row">
//                                                                 <span>Total GST:</span>
//                                                                 <span>₹{calculateTotalGST().toFixed(2)}</span>
//                                                             </div>
                                                            
//                                                             <div className="total-row">
//                                                                 <span>Shipping:</span>
//                                                                 <span>₹{(formData.shippingCharge || 0).toFixed(2)}</span>
//                                                             </div>
                                                            
//                                                             <div className="total-row grand-total">
//                                                                 <span>Grand Total:</span>
//                                                                 <span>₹{calculateTotal().toFixed(2)}</span>
//                                                             </div>
                                                            
//                                                             <div className="total-row payment">
//                                                                 <span>Paid Amount:</span>
//                                                                 <span>₹{(formData.paidAmount || 0).toFixed(2)}</span>
//                                                             </div>
                                                            
//                                                             <div className="total-row balance">
//                                                                 <span>Balance Amount:</span>
//                                                                 <span className={calculateTotal() - (formData.paidAmount || 0) > 0 ? 'pending' : 'paid'}>
//                                                                     ₹{(calculateTotal() - (formData.paidAmount || 0)).toFixed(2)}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </main>

//                 {/* Mobile Save Button */}
//                 <div className="mobile-save">
//                     <button
//                         onClick={handleSubmit}
//                         disabled={saving}
//                         className="mobile-save-btn"
//                     >
//                         {saving ? (
//                             <div className="button-spinner"></div>
//                         ) : (
//                             <>
//                                 <Save size={18} />
//                                 <span>Create Order</span>
//                             </>
//                         )}
//                     </button>
//                 </div>
//             </div>

//             <style jsx>{`
//                 /* ==================== GLOBAL STYLES ==================== */
//                 .create-order-page {
//                     min-height: 100vh;
//                     background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
//                     font-family: ${appTheme.fonts.primary};
//                 }

//                 /* ==================== COMPANY BANNER ==================== */
//                 .company-banner {
//                     max-width: 1200px;
//                     margin: 0 auto 16px auto;
//                     padding: 0 24px;
//                 }

//                 .company-banner-content {
//                     background: white;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     padding: 12px 16px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: space-between;
//                 }

//                 .company-banner-left {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     color: #0f172a;
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
//                     max-width: 1200px;
//                     margin: 0 auto 16px auto;
//                     padding: 0 24px;
//                 }

//                 .api-error {
//                     background: ${appTheme.colors.error}10;
//                     border: 1px solid ${appTheme.colors.error};
//                     border-radius: 8px;
//                     padding: 12px 16px;
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     color: ${appTheme.colors.error};
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
//                     background: white;
//                     border-radius: 8px;
//                     box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
//                     animation: slideInRight 0.3s ease;
//                     font-size: 0.875rem;
//                     max-width: 400px;
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
//                     background: white;
//                     border-bottom: 1px solid ${appTheme.colors.border};
//                     padding: 20px 24px;
//                     position: sticky;
//                     top: 0;
//                     z-index: 100;
//                     backdrop-filter: blur(10px);
//                     background: rgba(255, 255, 255, 0.95);
//                 }

//                 .header-content {
//                     max-width: 1200px;
//                     margin: 0 auto;
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                 }

//                 .header-left {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 8px;
//                 }

//                 .back-button {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     background: none;
//                     border: none;
//                     color: ${appTheme.colors.primary};
//                     font-size: 0.875rem;
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
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     font-size: 1.5rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0;
//                 }

//                 .title-icon {
//                     color: ${appTheme.colors.primary};
//                 }

//                 .page-description {
//                     color: #64748b;
//                     font-size: 0.875rem;
//                     margin: 0;
//                 }

//                 .header-actions {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                 }

//                 .header-action-btn {
//                     width: 40px;
//                     height: 40px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     background: #f8fafc;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     color: #64748b;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .header-action-btn:hover {
//                     background: #f1f5f9;
//                     color: ${appTheme.colors.primary};
//                     border-color: ${appTheme.colors.primary};
//                 }

//                 .save-button {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     padding: 10px 20px;
//                     background: ${appTheme.colors.primary};
//                     color: white;
//                     border: none;
//                     border-radius: 8px;
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
//                 }

//                 .save-button:hover {
//                     background: #2563eb;
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

//                 @keyframes spin {
//                     to { transform: rotate(360deg); }
//                 }

//                 /* ==================== DESKTOP TABS ==================== */
//                 .desktop-tabs {
//                     max-width: 1200px;
//                     margin: 0 auto 24px auto;
//                     padding: 0 24px;
//                     display: none;
//                     background: white;
//                     border-bottom: 2px solid #e2e8f0;
//                 }

//                 @media (min-width: 1024px) {
//                     .desktop-tabs {
//                         display: flex;
//                         padding: 0 24px;
//                         margin: 0 auto 24px auto;
//                     }
//                 }

//                 .tab-button {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     gap: 8px;
//                     padding: 16px 12px;
//                     background: transparent;
//                     border: none;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     white-space: nowrap;
//                     font-size: 0.875rem;
//                     position: relative;
//                     border-bottom: 2px solid transparent;
//                     margin-bottom: -2px;
//                     flex: 1;
//                     min-width: 0;
//                 }

//                 .tab-button:hover {
//                     background: #f8fafc;
//                 }

//                 .tab-button.active {
//                     background: #f8fafc;
//                     border-bottom: 2px solid;
//                 }

//                 .tab-icon {
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     padding: 6px;
//                     border-radius: 8px;
//                     transition: all 0.2s ease;
//                     flex-shrink: 0;
//                 }

//                 .tab-title {
//                     overflow: hidden;
//                     text-overflow: ellipsis;
//                     white-space: nowrap;
//                 }

//                 .active-indicator {
//                     position: absolute;
//                     bottom: -2px;
//                     left: 0;
//                     right: 0;
//                     height: 2px;
//                 }

//                 /* ==================== MAIN CONTENT ==================== */
//                 .main-content {
//                     max-width: 1200px;
//                     margin: 24px auto;
//                     padding: 0 24px 100px 24px;
//                 }

//                 /* ==================== MOBILE STEPS ==================== */
//                 .mobile-steps {
//                     display: none;
//                     margin-bottom: 20px;
//                     gap: 8px;
//                     flex-wrap: wrap;
//                 }

//                 .mobile-step {
//                     display: flex;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 8px 12px;
//                     background: white;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 30px;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .mobile-step.active {
//                     background: ${appTheme.colors.primary};
//                     border-color: ${appTheme.colors.primary};
//                 }

//                 .mobile-step.active .mobile-step-name {
//                     color: white;
//                 }

//                 .mobile-step-icon {
//                     width: 24px;
//                     height: 24px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     border-radius: 50%;
//                 }

//                 .mobile-step-name {
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     color: #0f172a;
//                 }

//                 @media (max-width: 768px) {
//                     .mobile-steps {
//                         display: flex;
//                     }
//                 }

//                 /* ==================== SECTIONS CONTAINER ==================== */
//                 .sections-container {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 16px;
//                 }

//                 .section-card {
//                     background: white;
//                     border-radius: 8px;
//                     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
//                     overflow: hidden;
//                 }

//                 @media (min-width: 1024px) {
//                     .section-card:not(.active) {
//                         display: none;
//                     }
//                 }

//                 .section-header {
//                     padding: 20px 24px;
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .section-header:hover {
//                     background: #f8fafc;
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
//                     border-radius: 8px;
//                 }

//                 .section-title h2 {
//                     font-size: 1rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0 0 4px 0;
//                 }

//                 .section-title p {
//                     font-size: 0.75rem;
//                     color: #64748b;
//                     margin: 0;
//                 }

//                 .chevron-icon {
//                     color: #94a3b8;
//                     transition: transform 0.3s ease;
//                 }

//                 .section-content {
//                     padding: 0 24px 24px 24px;
//                     border-top: 1px solid ${appTheme.colors.border};
//                     animation: slideDown 0.3s ease;
//                 }

//                 @keyframes slideDown {
//                     from {
//                         opacity: 0;
//                         transform: translateY(-10px);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: translateY(0);
//                     }
//                 }

//                 /* ==================== FORM BLOCKS ==================== */
//                 .form-block {
//                     margin-bottom: 28px;
//                 }

//                 .form-block:last-child {
//                     margin-bottom: 0;
//                 }

//                 .form-block h3 {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     font-size: 0.875rem;
//                     font-weight: 600;
//                     color: #334155;
//                     margin: 0 0 16px 0;
//                     padding-bottom: 8px;
//                     border-bottom: 1px dashed ${appTheme.colors.border};
//                 }

//                 .form-block h3 svg {
//                     color: ${appTheme.colors.primary};
//                 }

//                 .form-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 16px;
//                 }

//                 @media (min-width: 640px) {
//                     .form-grid {
//                         grid-template-columns: repeat(2, 1fr);
//                     }
//                 }

//                 @media (min-width: 1024px) {
//                     .form-grid {
//                         grid-template-columns: repeat(3, 1fr);
//                     }
//                 }

//                 .span-2 {
//                     grid-column: 1 / -1;
//                 }

//                 .form-field {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 6px;
//                 }

//                 .form-field.checkbox-field {
//                     flex-direction: row;
//                     align-items: center;
//                     gap: 10px;
//                 }

//                 .form-field label {
//                     font-size: 0.75rem;
//                     font-weight: 500;
//                     color: #475569;
//                     text-transform: uppercase;
//                     letter-spacing: 0.3px;
//                 }

//                 .checkbox-label {
//                     display: flex;
//                     align-items: center;
//                     gap: 8px;
//                     cursor: pointer;
//                     font-size: 0.875rem;
//                     font-weight: normal;
//                     text-transform: none;
//                     color: #334155;
//                 }

//                 .checkbox-label input[type="checkbox"] {
//                     width: 18px;
//                     height: 18px;
//                     cursor: pointer;
//                 }

//                 .form-field input,
//                 .form-field select,
//                 .form-field textarea {
//                     width: 100%;
//                     padding: 10px 14px;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     font-size: 0.938rem;
//                     transition: all 0.2s ease;
//                     background: white;
//                     font-family: ${appTheme.fonts.primary};
//                 }

//                 .form-field input:focus,
//                 .form-field select:focus,
//                 .form-field textarea:focus {
//                     outline: none;
//                     border-color: ${appTheme.colors.primary};
//                     box-shadow: 0 0 0 3px ${appTheme.colors.primary}20;
//                 }

//                 .form-field input.error,
//                 .form-field select.error,
//                 .form-field textarea.error {
//                     border-color: ${appTheme.colors.error};
//                 }

//                 .error-text {
//                     font-size: 0.688rem;
//                     color: ${appTheme.colors.error};
//                 }

//                 .required {
//                     color: ${appTheme.colors.error};
//                 }

//                 .hint {
//                     font-size: 0.688rem;
//                     color: #94a3b8;
//                 }

//                 /* ==================== TOGGLE ==================== */
//                 .toggle-field {
//                     margin: 4px 0;
//                 }

//                 .toggle {
//                     display: flex;
//                     align-items: center;
//                     gap: 12px;
//                     cursor: pointer;
//                 }

//                 .toggle input {
//                     display: none;
//                 }

//                 .toggle-slider {
//                     position: relative;
//                     width: 44px;
//                     height: 24px;
//                     background: #cbd5e1;
//                     border-radius: 12px;
//                     transition: all 0.2s ease;
//                 }

//                 .toggle-slider::before {
//                     content: '';
//                     position: absolute;
//                     top: 2px;
//                     left: 2px;
//                     width: 20px;
//                     height: 20px;
//                     background: white;
//                     border-radius: 50%;
//                     transition: all 0.2s ease;
//                 }

//                 .toggle input:checked + .toggle-slider {
//                     background: ${appTheme.colors.primary};
//                 }

//                 .toggle input:checked + .toggle-slider::before {
//                     left: 22px;
//                 }

//                 .toggle-label {
//                     font-size: 0.875rem;
//                     color: #334155;
//                 }

//                 /* ==================== ADD BUTTON ==================== */
//                 .add-button {
//                     display: inline-flex;
//                     align-items: center;
//                     gap: 6px;
//                     padding: 8px 16px;
//                     background: ${appTheme.colors.primary};
//                     color: white;
//                     border: none;
//                     border-radius: 8px;
//                     font-size: 0.813rem;
//                     font-weight: 500;
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                     min-height: 36px;
//                 }

//                 .add-button:hover {
//                     background: #2563eb;
//                 }

//                 /* ==================== ITEMS LIST ==================== */
//                 .items-list {
//                     display: flex;
//                     flex-direction: column;
//                     gap: 16px;
//                 }

//                 .item-card {
//                     background: #f8fafc;
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 8px;
//                     padding: 16px;
//                 }

//                 .item-header {
//                     display: flex;
//                     justify-content: space-between;
//                     align-items: center;
//                     margin-bottom: 16px;
//                     padding-bottom: 8px;
//                     border-bottom: 1px solid ${appTheme.colors.border};
//                 }

//                 .item-number {
//                     font-size: 0.875rem;
//                     font-weight: 600;
//                     color: #475569;
//                 }

//                 .remove-item-btn {
//                     width: 32px;
//                     height: 32px;
//                     display: flex;
//                     align-items: center;
//                     justify-content: center;
//                     background: ${appTheme.colors.error}10;
//                     border: 1px solid ${appTheme.colors.error}20;
//                     border-radius: 8px;
//                     color: ${appTheme.colors.error};
//                     cursor: pointer;
//                     transition: all 0.2s ease;
//                 }

//                 .remove-item-btn:hover {
//                     background: ${appTheme.colors.error};
//                     color: white;
//                 }

//                 .item-grid {
//                     display: grid;
//                     grid-template-columns: repeat(1, 1fr);
//                     gap: 16px;
//                 }

//                 @media (min-width: 640px) {
//                     .item-grid {
//                         grid-template-columns: repeat(3, 1fr);
//                     }
//                 }

//                 /* ==================== ITEM SUMMARY ==================== */
//                 .item-summary {
//                     margin-top: 16px;
//                     padding: 12px;
//                     background: white;
//                     border-radius: 8px;
//                     border: 1px solid ${appTheme.colors.border};
//                 }

//                 .summary-row {
//                     display: flex;
//                     justify-content: space-between;
//                     margin-bottom: 4px;
//                     font-size: 0.813rem;
//                     color: #64748b;
//                 }

//                 .summary-row.total {
//                     margin-top: 8px;
//                     padding-top: 8px;
//                     border-top: 1px solid ${appTheme.colors.border};
//                     font-weight: 600;
//                     color: #0f172a;
//                 }

//                 .item-info {
//                     display: flex;
//                     gap: 8px;
//                     margin-top: 12px;
//                     flex-wrap: wrap;
//                 }

//                 .info-badge {
//                     padding: 4px 8px;
//                     background: ${appTheme.colors.background};
//                     border: 1px solid ${appTheme.colors.border};
//                     border-radius: 20px;
//                     font-size: 0.625rem;
//                     color: #64748b;
//                 }

//                 /* ==================== ORDER SUMMARY ==================== */
//                 .order-summary {
//                     background: #eef2ff;
//                     border: 1px solid ${appTheme.colors.primary}30;
//                     border-radius: 8px;
//                     padding: 20px;
//                 }

//                 .order-summary h3 {
//                     font-size: 1rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                     margin: 0 0 16px 0;
//                     padding-bottom: 8px;
//                     border-bottom: 1px solid ${appTheme.colors.primary}30;
//                 }

//                 .summary-items {
//                     margin-bottom: 16px;
//                 }

//                 .summary-item {
//                     margin-bottom: 8px;
//                 }

//                 .summary-item-name {
//                     font-size: 0.875rem;
//                     font-weight: 500;
//                     color: #0f172a;
//                 }

//                 .summary-item-details {
//                     display: flex;
//                     gap: 16px;
//                     margin-top: 4px;
//                     font-size: 0.75rem;
//                     color: #64748b;
//                 }

//                 .summary-totals {
//                     border-top: 1px solid ${appTheme.colors.primary}30;
//                     padding-top: 16px;
//                 }

//                 .total-row {
//                     display: flex;
//                     justify-content: space-between;
//                     margin-bottom: 8px;
//                     font-size: 0.875rem;
//                     color: #475569;
//                 }

//                 .total-row.discount {
//                     color: ${appTheme.colors.success};
//                 }

//                 .total-row.grand-total {
//                     margin-top: 8px;
//                     padding-top: 8px;
//                     border-top: 1px solid ${appTheme.colors.primary}30;
//                     font-size: 1rem;
//                     font-weight: 600;
//                     color: #0f172a;
//                 }

//                 .total-row.payment {
//                     color: ${appTheme.colors.primary};
//                 }

//                 .total-row.balance {
//                     font-weight: 600;
//                 }

//                 .total-row.balance .pending {
//                     color: ${appTheme.colors.warning};
//                 }

//                 .total-row.balance .paid {
//                     color: ${appTheme.colors.success};
//                 }

//                 /* ==================== MOBILE SAVE ==================== */
//                 .mobile-save {
//                     display: none;
//                     position: fixed;
//                     bottom: 0;
//                     left: 0;
//                     right: 0;
//                     padding: 16px;
//                     background: linear-gradient(to top, #f1f5f9, transparent);
//                     z-index: 100;
//                 }

//                 .mobile-save-btn {
//                     width: 100%;
//                     padding: 16px;
//                     background: ${appTheme.colors.primary};
//                     color: white;
//                     border: none;
//                     border-radius: 8px;
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
//                 @media (max-width: 1024px) {
//                     .stats-grid {
//                         display: none;
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
//                     }

//                     .page-title {
//                         font-size: 1.25rem;
//                     }

//                     .page-description {
//                         font-size: 0.813rem;
//                     }

//                     .header-actions {
//                         width: 100%;
//                         justify-content: flex-end;
//                     }

//                     .save-button {
//                         display: none;
//                     }

//                     .mobile-save {
//                         display: block;
//                     }

//                     .desktop-tabs {
//                         display: none;
//                     }

//                     .stats-grid {
//                         display: none;
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

//                     .section-icon svg {
//                         width: 18px;
//                         height: 18px;
//                     }

//                     .section-title h2 {
//                         font-size: 0.938rem;
//                     }

//                     .section-title p {
//                         font-size: 0.688rem;
//                     }

//                     .section-content {
//                         padding: 0 16px 16px 16px;
//                     }

//                     .form-block h3 {
//                         font-size: 0.813rem;
//                     }

//                     .form-field input,
//                     .form-field select,
//                     .form-field textarea {
//                         font-size: 16px;
//                         min-height: 48px;
//                     }

//                     .add-button {
//                         min-height: 44px;
//                     }

//                     .item-card {
//                         padding: 12px;
//                     }

//                     .remove-item-btn {
//                         width: 44px;
//                         height: 44px;
//                     }
//                 }

//                 @media (max-width: 480px) {
//                     .main-content {
//                         padding: 16px 16px 90px 16px;
//                     }

//                     .stats-grid {
//                         display: none;
//                     }

//                     .item-info {
//                         flex-direction: column;
//                         gap: 4px;
//                     }

//                     .info-badge {
//                         width: fit-content;
//                     }

//                     .summary-item-details {
//                         flex-direction: column;
//                         gap: 4px;
//                     }
//                 }
//             `}</style>
//         </>
//     );
// };

// export default CreateOrderPage;


























// app/admin/orders/create/page.js
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Head from 'next/head';
import { appTheme } from "../../../../src/constants/theme";
import { useAuth } from '../../../../context/AuthContext';
import {
    Save, X, ChevronRight, Layers, Layout, Info,
    CheckCircle, AlertCircle, AlertTriangle, XCircle,
    Package, DollarSign, Percent, Calendar, Tag, Box,
    Truck, Globe, Settings, Shield, Zap, Star, Heart,
    Award, ShoppingCart, Clock, MapPin, Phone, Mail,
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
    User, Mail as MailIcon, Phone as PhoneIcon, Map,
    CreditCard as CreditCardIcon, Wallet, Banknote,
    Receipt as ReceiptIcon, Package as PackageIcon,
    Truck as TruckIcon, Clock as ClockIcon, ChevronDown,
    Copy as CopyIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================
const PAYMENT_METHODS = [
    { value: "cod", label: "Cash on Delivery", icon: Truck },
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "card", label: "Card", icon: CreditCard },
    { value: "upi", label: "UPI", icon: Phone },
    { value: "bank_transfer", label: "Bank Transfer", icon: Landmark },
    { value: "wallet", label: "Wallet", icon: Wallet }
];

const GST_TYPES = [
    { value: "intra-state", label: "Intra-State (CGST + SGST)" },
    { value: "inter-state", label: "Inter-State (IGST)" }
];

const GST_RATES = [0, 5, 12, 18, 28];

const DELIVERY_SLOTS = [
    { value: "morning", label: "Morning (9 AM - 12 PM)" },
    { value: "afternoon", label: "Afternoon (12 PM - 3 PM)" },
    { value: "evening", label: "Evening (3 PM - 6 PM)" },
    { value: "night", label: "Night (6 PM - 9 PM)" }
];

export default function CreateOrderPage() {
    const router = useRouter();
    
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
    
    // State for products
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(null);

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        phoneNumber: "",
        secondaryPhoneNumber: "",
        shippingAddress: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
            country: "India"
        },
        billingAddress: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
            country: "India"
        },
        sameAsShipping: true,
        paymentMethod: "cod",
        gstType: "intra-state",
        items: [{
            productId: "",
            productName: "",
            quantity: 1,
            mrp: 0,
            discountPrice: 0,
            price: 0,
            gstRate: 18,
            gstIncluded: true,
            gstAmount: 0,
            totalAmount: 0,
            sku: "",
            hsnCode: ""
        }],
        paidAmount: 0,
        shippingCharge: 0,
        orderNotes: "",
        deliveryDate: "",
        deliverySlot: "",
        orderSource: "admin"
    });
    
    const [isMobile, setIsMobile] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    // Fetch products on mount
    useEffect(() => {
        if (user?.companyId) {
            fetchProducts();
            fetchCompanyInfo();
        }
    }, [user]);

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

    // Fetch all products
    const fetchProducts = async () => {
        setLoadingProducts(true);
        try {
            const params = new URLSearchParams({
                isActive: 'true'
            });
            
            const res = await fetch(`/api/products?${params}`, {
                headers: getAuthHeaders()
            });
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            showToast('error', 'Failed to load products');
        } finally {
            setLoadingProducts(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Customer name validation
        if (!formData.customerName.trim()) {
            newErrors.customerName = "Customer name is required";
        }

        // Email validation
        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = "Customer email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.customerEmail)) {
                newErrors.customerEmail = "Please enter a valid email address";
            }
        }

        // Phone number validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else {
            const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
            if (cleanPhone.length !== 10) {
                newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
            }
        }

        // Secondary phone validation (optional)
        if (formData.secondaryPhoneNumber.trim()) {
            const cleanSecondary = formData.secondaryPhoneNumber.replace(/\D/g, '');
            if (cleanSecondary.length !== 10) {
                newErrors.secondaryPhoneNumber = "Please enter a valid 10-digit phone number";
            }
        }

        // Shipping address validation
        if (!formData.shippingAddress.street.trim()) {
            newErrors.shippingStreet = "Street address is required";
        }

        if (!formData.shippingAddress.city.trim()) {
            newErrors.shippingCity = "City is required";
        }

        if (!formData.shippingAddress.state.trim()) {
            newErrors.shippingState = "State is required";
        }

        if (!formData.shippingAddress.pincode.trim()) {
            newErrors.shippingPincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(formData.shippingAddress.pincode)) {
            newErrors.shippingPincode = "Please enter a valid 6-digit pincode";
        }

        // Items validation
        let hasValidItems = false;
        formData.items.forEach((item, index) => {
            if (!item.productId) {
                newErrors[`item_${index}_product`] = "Please select a product";
            } else {
                hasValidItems = true;
                const selectedProduct = products.find(p => p._id === item.productId);
                if (selectedProduct) {
                    if (item.quantity < 1) {
                        newErrors[`item_${index}_quantity`] = "Quantity must be at least 1";
                    }
                    if (item.quantity > selectedProduct.stock) {
                        newErrors[`item_${index}_quantity`] = `Only ${selectedProduct.stock} units available`;
                    }
                }
            }

            if (item.discountPrice > item.mrp) {
                newErrors[`item_${index}_price`] = "Discount price cannot be greater than MRP";
            }
        });

        if (!hasValidItems) {
            newErrors.items = "At least one product must be selected";
        }

        // Payment method validation
        if (!formData.paymentMethod) {
            newErrors.paymentMethod = "Payment method is required";
        }

        // GST type validation
        if (!formData.gstType) {
            newErrors.gstType = "GST type is required";
        }

        // Paid amount validation
        if (formData.paidAmount < 0) {
            newErrors.paidAmount = "Paid amount cannot be negative";
        }

        const total = calculateTotal();
        if (formData.paidAmount > total) {
            newErrors.paidAmount = "Paid amount cannot be greater than order total";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('shipping.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                shippingAddress: {
                    ...prev.shippingAddress,
                    [field]: value
                }
            }));
            
            // If sameAsShipping is true, update billing address
            if (formData.sameAsShipping) {
                setFormData(prev => ({
                    ...prev,
                    billingAddress: {
                        ...prev.billingAddress,
                        [field]: value
                    }
                }));
            }
        } else if (name.startsWith('billing.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                billingAddress: {
                    ...prev.billingAddress,
                    [field]: value
                }
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
            
            // If sameAsShipping is checked, copy shipping to billing
            if (name === 'sameAsShipping' && checked) {
                setFormData(prev => ({
                    ...prev,
                    billingAddress: { ...prev.shippingAddress }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        
        if (field === 'productId') {
            const selectedProduct = products.find(p => p._id === value);
            if (selectedProduct) {
                updatedItems[index] = {
                    ...updatedItems[index],
                    productId: value,
                    productName: selectedProduct.productName,
                    mrp: selectedProduct.mrp,
                    discountPrice: selectedProduct.discountPrice,
                    price: selectedProduct.discountPrice,
                    gstRate: selectedProduct.gstRate || 18,
                    gstIncluded: selectedProduct.gstIncluded !== false,
                    sku: selectedProduct.sku,
                    hsnCode: selectedProduct.hsnCode,
                    gstAmount: 0,
                    totalAmount: 0
                };
                
                calculateItemTotals(updatedItems[index]);
                
                // Clear error
                if (errors[`item_${index}_product`]) {
                    setErrors(prev => ({
                        ...prev,
                        [`item_${index}_product`]: ""
                    }));
                }
            }
        } else if (field === 'quantity') {
            const numValue = parseInt(value) || 0;
            updatedItems[index].quantity = Math.max(1, numValue);
            calculateItemTotals(updatedItems[index]);
            
            if (errors[`item_${index}_quantity`]) {
                setErrors(prev => ({
                    ...prev,
                    [`item_${index}_quantity`]: ""
                }));
            }
        } else if (field === 'discountPrice') {
            const numValue = parseFloat(value) || 0;
            updatedItems[index].discountPrice = numValue;
            updatedItems[index].price = numValue;
            
            if (updatedItems[index].discountPrice > updatedItems[index].mrp) {
                updatedItems[index].discountPrice = updatedItems[index].mrp;
                updatedItems[index].price = updatedItems[index].mrp;
            }
            
            calculateItemTotals(updatedItems[index]);
            
            if (errors[`item_${index}_price`]) {
                setErrors(prev => ({
                    ...prev,
                    [`item_${index}_price`]: ""
                }));
            }
        } else if (field === 'gstRate') {
            updatedItems[index].gstRate = parseFloat(value) || 0;
            calculateItemTotals(updatedItems[index]);
        } else if (field === 'gstIncluded') {
            updatedItems[index].gstIncluded = value;
            calculateItemTotals(updatedItems[index]);
        }

        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const calculateItemTotals = (item) => {
        const itemTotal = item.quantity * item.price;
        item.totalAmount = itemTotal;
        
        if (!item.gstIncluded) {
            item.gstAmount = (itemTotal * item.gstRate) / 100;
        } else {
            const basePrice = itemTotal * 100 / (100 + item.gstRate);
            item.gstAmount = itemTotal - basePrice;
        }
    };

    const addItem = () => {
        if (formData.items.length >= 10) {
            showToast('warning', 'Maximum 10 items allowed per order');
            return;
        }

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                productId: "",
                productName: "",
                quantity: 1,
                mrp: 0,
                discountPrice: 0,
                price: 0,
                gstRate: 18,
                gstIncluded: true,
                gstAmount: 0,
                totalAmount: 0,
                sku: "",
                hsnCode: ""
            }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            const updatedItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                items: updatedItems
            }));

            // Clear errors for removed item
            const newErrors = { ...errors };
            delete newErrors[`item_${index}_product`];
            delete newErrors[`item_${index}_quantity`];
            delete newErrors[`item_${index}_price`];
            setErrors(newErrors);
        }
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const calculateTotalGST = () => {
        return formData.items.reduce((total, item) => total + (item.gstAmount || 0), 0);
    };

    const calculateTotalDiscount = () => {
        return formData.items.reduce((total, item) => 
            total + (item.quantity * (item.mrp - item.price)), 0
        );
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTotalGST() + (formData.shippingCharge || 0);
    };

    const getAvailableStock = (productId) => {
        const product = products.find(p => p._id === productId);
        return product ? product.stock : 0;
    };

    const getProductDetails = (productId) => {
        return products.find(p => p._id === productId);
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
            const total = calculateTotal();

            // Prepare order data
            const orderData = {
                companyId: user?.companyId,
                customerName: formData.customerName.trim(),
                customerEmail: formData.customerEmail.trim().toLowerCase(),
                phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
                secondaryPhoneNumber: formData.secondaryPhoneNumber ? formData.secondaryPhoneNumber.replace(/\D/g, '') : undefined,
                shippingAddress: formData.shippingAddress,
                billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
                sameAsShipping: formData.sameAsShipping,
                paymentMethod: formData.paymentMethod,
                gstType: formData.gstType,
                items: formData.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    mrp: item.mrp,
                    discountPrice: item.discountPrice,
                    price: item.price,
                    gstRate: item.gstRate,
                    gstIncluded: item.gstIncluded,
                    gstAmount: item.gstAmount,
                    totalAmount: item.totalAmount,
                    sku: item.sku,
                    hsnCode: item.hsnCode
                })),
                subtotal: calculateSubtotal(),
                totalDiscount: calculateTotalDiscount(),
                totalGst: calculateTotalGST(),
                shippingCharge: formData.shippingCharge || 0,
                totalPrice: total,
                paidAmount: formData.paidAmount || 0,
                paymentStatus: formData.paidAmount >= total ? 'paid' : (formData.paidAmount > 0 ? 'partial' : 'pending'),
                orderNotes: formData.orderNotes || undefined,
                deliveryDate: formData.deliveryDate || undefined,
                deliverySlot: formData.deliverySlot || undefined,
                orderSource: 'admin',
                status: 'pending',
                statusHistory: [{
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    comment: 'Order created manually',
                    updatedBy: user?.id
                }],
                createdBy: user?.id
            };

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders()
                },
                body: JSON.stringify(orderData),
            });

            const data = await res.json();

            if (data.success) {
                showToast('success', "🎉 Order created successfully!");
                setTimeout(() => router.push("/admin/orders"), 1500);
            } else {
                if (res.status === 403) {
                    throw new Error("You don't have permission to create orders");
                }
                throw new Error(data.message || data.error || "Failed to create order");
            }
        } catch (error) {
            console.error("Error creating order:", error);
            setApiError(error.message);
            showToast('error', `❌ Failed to create order: ${error.message}`);
        } finally {
            setSaving(false);
            setIsSubmitting(false);
        }
    };

    const handleBack = useCallback(() => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push("/admin/orders");
        }
    }, [router]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('success', 'Copied to clipboard!');
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Create Order | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="order-form-page">
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
                                <span>Back to Orders</span>
                            </button>
                            <h1 className="page-title">
                                Create New Order
                            </h1>
                            <p className="page-description">
                                Fill in the details to create a new customer order
                            </p>
                        </div>
                        <div className="header-actions">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || isSubmitting}
                                className="save-button"
                            >
                                {saving || isSubmitting ? (
                                    <>
                                        <div className="button-spinner"></div>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Create Order</span>
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

                {/* Main Content - Single Scroll Page */}
                <main className="main-content">
                    {/* Form Sections - All Visible at Once */}
                    <div className="form-sections">
                        {/* ==================== CUSTOMER DETAILS SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.primary}15`, color: appTheme.colors.primary }}>
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h2>Customer Details</h2>
                                        <p>Customer contact information</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>
                                            Customer Name <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className={errors.customerName ? 'error' : ''}
                                            placeholder="Enter customer full name"
                                            ref={el => fieldRefs.current['customerName'] = el}
                                        />
                                        {errors.customerName && <span className="error-text">{errors.customerName}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-2">
                                        <label>
                                            Email Address <span className="required">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleInputChange}
                                            className={errors.customerEmail ? 'error' : ''}
                                            placeholder="customer@example.com"
                                            ref={el => fieldRefs.current['customerEmail'] = el}
                                        />
                                        {errors.customerEmail && <span className="error-text">{errors.customerEmail}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Phone Number <span className="required">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleInputChange}
                                            className={errors.phoneNumber ? 'error' : ''}
                                            placeholder="10-digit phone number"
                                            maxLength="10"
                                            ref={el => fieldRefs.current['phoneNumber'] = el}
                                        />
                                        {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group span-3">
                                        <label>Secondary Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            name="secondaryPhoneNumber"
                                            value={formData.secondaryPhoneNumber}
                                            onChange={handleInputChange}
                                            className={errors.secondaryPhoneNumber ? 'error' : ''}
                                            placeholder="Alternate phone number"
                                            maxLength="10"
                                        />
                                        {errors.secondaryPhoneNumber && <span className="error-text">{errors.secondaryPhoneNumber}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ==================== ADDRESS SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.secondary}15`, color: appTheme.colors.secondary }}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <h2>Address Information</h2>
                                        <p>Shipping and billing addresses</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                {/* Shipping Address */}
                                <div className="form-block">
                                    <h3>
                                        <Truck size={16} />
                                        Shipping Address
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group span-3">
                                            <label>
                                                Street Address <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="shipping.street"
                                                value={formData.shippingAddress.street}
                                                onChange={handleInputChange}
                                                className={errors.shippingStreet ? 'error' : ''}
                                                placeholder="Door No, Building, Street, Area"
                                                ref={el => fieldRefs.current['shippingStreet'] = el}
                                            />
                                            {errors.shippingStreet && <span className="error-text">{errors.shippingStreet}</span>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>
                                                City <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="shipping.city"
                                                value={formData.shippingAddress.city}
                                                onChange={handleInputChange}
                                                className={errors.shippingCity ? 'error' : ''}
                                                placeholder="City"
                                                ref={el => fieldRefs.current['shippingCity'] = el}
                                            />
                                            {errors.shippingCity && <span className="error-text">{errors.shippingCity}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                State <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="shipping.state"
                                                value={formData.shippingAddress.state}
                                                onChange={handleInputChange}
                                                className={errors.shippingState ? 'error' : ''}
                                                placeholder="State"
                                                ref={el => fieldRefs.current['shippingState'] = el}
                                            />
                                            {errors.shippingState && <span className="error-text">{errors.shippingState}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                Pincode <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="shipping.pincode"
                                                value={formData.shippingAddress.pincode}
                                                onChange={handleInputChange}
                                                className={errors.shippingPincode ? 'error' : ''}
                                                placeholder="6-digit pincode"
                                                maxLength="6"
                                                ref={el => fieldRefs.current['shippingPincode'] = el}
                                            />
                                            {errors.shippingPincode && <span className="error-text">{errors.shippingPincode}</span>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group span-3">
                                            <label>Landmark (Optional)</label>
                                            <input
                                                type="text"
                                                name="shipping.landmark"
                                                value={formData.shippingAddress.landmark}
                                                onChange={handleInputChange}
                                                placeholder="Nearby landmark"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Same as Shipping Toggle */}
                                <div className="form-block">
                                    <div className="form-row">
                                        <div className="form-group span-3 checkbox-group">
                                            <label className="checkbox-label">
                                                <input
                                                    type="checkbox"
                                                    name="sameAsShipping"
                                                    checked={formData.sameAsShipping}
                                                    onChange={handleInputChange}
                                                />
                                                <span>Billing address same as shipping address</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Billing Address (if not same) */}
                                {!formData.sameAsShipping && (
                                    <div className="form-block">
                                        <h3>
                                            <CreditCard size={16} />
                                            Billing Address
                                        </h3>
                                        
                                        <div className="form-row">
                                            <div className="form-group span-3">
                                                <label>Street Address <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    name="billing.street"
                                                    value={formData.billingAddress.street}
                                                    onChange={handleInputChange}
                                                    placeholder="Door No, Building, Street, Area"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>City <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    name="billing.city"
                                                    value={formData.billingAddress.city}
                                                    onChange={handleInputChange}
                                                    placeholder="City"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>State <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    name="billing.state"
                                                    value={formData.billingAddress.state}
                                                    onChange={handleInputChange}
                                                    placeholder="State"
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Pincode <span className="required">*</span></label>
                                                <input
                                                    type="text"
                                                    name="billing.pincode"
                                                    value={formData.billingAddress.pincode}
                                                    onChange={handleInputChange}
                                                    placeholder="6-digit pincode"
                                                    maxLength="6"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group span-3">
                                                <label>Landmark (Optional)</label>
                                                <input
                                                    type="text"
                                                    name="billing.landmark"
                                                    value={formData.billingAddress.landmark}
                                                    onChange={handleInputChange}
                                                    placeholder="Nearby landmark"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ==================== ORDER ITEMS SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.warning}15`, color: appTheme.colors.warning }}>
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h2>Order Items</h2>
                                        <p>Products and quantities</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                {/* Add Item Button */}
                                <div className="form-row">
                                    <div className="form-group span-3" style={{ alignItems: 'flex-end' }}>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="add-button"
                                            disabled={formData.items.length >= 10}
                                        >
                                            <Plus size={16} />
                                            <span>Add Item</span>
                                        </button>
                                        {errors.items && <span className="error-text">{errors.items}</span>}
                                    </div>
                                </div>

                                {/* Items List */}
                                {formData.items.map((item, index) => {
                                    const product = item.productId ? getProductDetails(item.productId) : null;
                                    
                                    return (
                                        <div key={index} className="item-card">
                                            <div className="item-header">
                                                <span className="item-number">Item #{index + 1}</span>
                                                {formData.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="remove-item-btn"
                                                        title="Remove item"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="form-row">
                                                <div className="form-group span-2">
                                                    <label>
                                                        Product <span className="required">*</span>
                                                    </label>
                                                    <select
                                                        value={item.productId}
                                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                        className={errors[`item_${index}_product`] ? 'error' : ''}
                                                        disabled={loadingProducts}
                                                    >
                                                        <option value="">Select a product</option>
                                                        {products.map(product => (
                                                            <option 
                                                                key={product._id} 
                                                                value={product._id}
                                                                disabled={product.stock === 0}
                                                            >
                                                                {product.productName} - MRP: ₹{product.mrp} | Price: ₹{product.discountPrice} 
                                                                {product.stock === 0 ? ' (Out of Stock)' : ` (Stock: ${product.stock})`}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {errors[`item_${index}_product`] && (
                                                        <span className="error-text">{errors[`item_${index}_product`]}</span>
                                                    )}
                                                </div>
                                            </div>

                                            {product && (
                                                <>
                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label>MRP (₹)</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.mrp}
                                                                onChange={(e) => handleItemChange(index, 'mrp', e.target.value)}
                                                                placeholder="0.00"
                                                            />
                                                        </div>

                                                        <div className="form-group">
                                                            <label>
                                                                Price (₹) <span className="required">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.discountPrice}
                                                                onChange={(e) => handleItemChange(index, 'discountPrice', e.target.value)}
                                                                className={errors[`item_${index}_price`] ? 'error' : ''}
                                                                placeholder="0.00"
                                                            />
                                                            {errors[`item_${index}_price`] && (
                                                                <span className="error-text">{errors[`item_${index}_price`]}</span>
                                                            )}
                                                        </div>

                                                        <div className="form-group">
                                                            <label>
                                                                Quantity <span className="required">*</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={product?.stock}
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                                className={errors[`item_${index}_quantity`] ? 'error' : ''}
                                                                placeholder="1"
                                                            />
                                                            {errors[`item_${index}_quantity`] && (
                                                                <span className="error-text">{errors[`item_${index}_quantity`]}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="form-row">
                                                        <div className="form-group">
                                                            <label>GST Rate (%)</label>
                                                            <select
                                                                value={item.gstRate}
                                                                onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                                                            >
                                                                {GST_RATES.map(rate => (
                                                                    <option key={rate} value={rate}>{rate}%</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="form-group checkbox-group">
                                                            <label className="checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={item.gstIncluded}
                                                                    onChange={(e) => handleItemChange(index, 'gstIncluded', e.target.checked)}
                                                                />
                                                                <span>GST Included</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Item Summary */}
                                                    <div className="item-summary">
                                                        <div className="summary-row">
                                                            <span>Subtotal:</span>
                                                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                        <div className="summary-row">
                                                            <span>GST ({item.gstRate}%):</span>
                                                            <span>₹{(item.gstAmount || 0).toFixed(2)}</span>
                                                        </div>
                                                        <div className="summary-row total">
                                                            <span>Total:</span>
                                                            <span>₹{((item.price * item.quantity) + (item.gstAmount || 0)).toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Product Info Badges */}
                                                    <div className="item-info">
                                                        <span className="info-badge">SKU: {item.sku}</span>
                                                        <span className="info-badge">HSN: {item.hsnCode}</span>
                                                        <span className="info-badge">Available: {getAvailableStock(item.productId)} units</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ==================== PAYMENT & DELIVERY SECTION ==================== */}
                        <div className="form-section">
                            <div className="section-header">
                                <div className="section-header-left">
                                    <div className="section-icon" style={{ background: `${appTheme.colors.success}15`, color: appTheme.colors.success }}>
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h2>Payment & Delivery</h2>
                                        <p>Payment details and delivery information</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="section-content">
                                {/* Payment Details */}
                                <div className="form-block">
                                    <h3>
                                        <CreditCard size={16} />
                                        Payment Details
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>
                                                Payment Method <span className="required">*</span>
                                            </label>
                                            <select
                                                name="paymentMethod"
                                                value={formData.paymentMethod}
                                                onChange={handleInputChange}
                                                className={errors.paymentMethod ? 'error' : ''}
                                            >
                                                {PAYMENT_METHODS.map(method => (
                                                    <option key={method.value} value={method.value}>
                                                        {method.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                GST Type <span className="required">*</span>
                                            </label>
                                            <select
                                                name="gstType"
                                                value={formData.gstType}
                                                onChange={handleInputChange}
                                                className={errors.gstType ? 'error' : ''}
                                            >
                                                {GST_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                            {errors.gstType && <span className="error-text">{errors.gstType}</span>}
                                        </div>

                                        <div className="form-group">
                                            <label>Paid Amount (₹)</label>
                                            <input
                                                type="number"
                                                name="paidAmount"
                                                min="0"
                                                step="0.01"
                                                value={formData.paidAmount}
                                                onChange={handleInputChange}
                                                className={errors.paidAmount ? 'error' : ''}
                                                placeholder="0.00"
                                            />
                                            {errors.paidAmount && <span className="error-text">{errors.paidAmount}</span>}
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group span-2">
                                            <label>Shipping Charge (₹)</label>
                                            <input
                                                type="number"
                                                name="shippingCharge"
                                                min="0"
                                                step="0.01"
                                                value={formData.shippingCharge}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Information */}
                                <div className="form-block">
                                    <h3>
                                        <Truck size={16} />
                                        Delivery Information
                                    </h3>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Delivery Date</label>
                                            <input
                                                type="date"
                                                name="deliveryDate"
                                                value={formData.deliveryDate}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Delivery Slot</label>
                                            <select
                                                name="deliverySlot"
                                                value={formData.deliverySlot}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">Select slot</option>
                                                {DELIVERY_SLOTS.map(slot => (
                                                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group span-3">
                                            <label>Order Notes</label>
                                            <textarea
                                                name="orderNotes"
                                                rows="3"
                                                value={formData.orderNotes}
                                                onChange={handleInputChange}
                                                placeholder="Any special instructions or notes for this order"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="order-summary">
                                    <h3>Order Summary</h3>
                                    
                                    <div className="summary-items">
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="summary-item">
                                                <div className="summary-item-name">{item.productName || `Item ${index + 1}`}</div>
                                                <div className="summary-item-details">
                                                    <span>Qty: {item.quantity}</span>
                                                    <span>₹{item.price}</span>
                                                    <span>GST: ₹{(item.gstAmount || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="summary-totals">
                                        <div className="total-row">
                                            <span>Subtotal:</span>
                                            <span>₹{calculateSubtotal().toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="total-row discount">
                                            <span>Total Discount:</span>
                                            <span>- ₹{calculateTotalDiscount().toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="total-row">
                                            <span>Total GST:</span>
                                            <span>₹{calculateTotalGST().toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="total-row">
                                            <span>Shipping:</span>
                                            <span>₹{(formData.shippingCharge || 0).toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="total-row grand-total">
                                            <span>Grand Total:</span>
                                            <span>₹{calculateTotal().toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="total-row payment">
                                            <span>Paid Amount:</span>
                                            <span>₹{(formData.paidAmount || 0).toFixed(2)}</span>
                                        </div>
                                        
                                        <div className="total-row balance">
                                            <span>Balance Amount:</span>
                                            <span className={calculateTotal() - (formData.paidAmount || 0) > 0 ? 'pending' : 'paid'}>
                                                ₹{(calculateTotal() - (formData.paidAmount || 0)).toFixed(2)}
                                            </span>
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
                                <span>Create Order</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                /* ==================== GLOBAL STYLES ==================== */
                .order-form-page {
                    min-height: 100vh;
                    background: ${appTheme.colors.backgroundLight};
                    width: 100%;
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
                    font-size: 0.875rem;
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
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                    margin: 0;
                }

                .page-description {
                    color: ${appTheme.colors.textSecondary};
                    font-size: 0.875rem;
                    margin: 0;
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
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px ${appTheme.colors.primary}30;
                }

                .save-button:hover {
                    background: ${appTheme.colors.gradientStart};
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
                    font-size: 0.875rem;
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
                    font-size: 0.875rem;
                }

                /* ==================== MAIN CONTENT ==================== */
                .main-content {
                    width: 100%;
                    margin: 24px 0;
                    padding: 0 24px;
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
                    background: #fafbfc;
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
                    font-size: 1rem;
                    font-weight: 600;
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
                    color: ${appTheme.colors.textSecondary};
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px dashed ${appTheme.colors.border};
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
                    font-weight: 500;
                    color: ${appTheme.colors.textPrimary};
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
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

                /* ==================== ADD BUTTON ==================== */
                .add-button {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: ${appTheme.colors.primary};
                    color: white;
                    border: none;
                    border-radius: ${appTheme.radius.md};
                    font-size: 0.813rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .add-button:hover {
                    background: ${appTheme.colors.gradientStart};
                }

                .add-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* ==================== ITEMS LIST ==================== */
                .item-card {
                    background: ${appTheme.colors.backgroundLight};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: ${appTheme.radius.md};
                    padding: 20px;
                    margin-bottom: 16px;
                }

                .item-card:last-child {
                    margin-bottom: 0;
                }

                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid ${appTheme.colors.border};
                }

                .item-number {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textSecondary};
                }

                .remove-item-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${appTheme.colors.error}10;
                    border: 1px solid ${appTheme.colors.error}20;
                    border-radius: ${appTheme.radius.sm};
                    color: ${appTheme.colors.error};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .remove-item-btn:hover {
                    background: ${appTheme.colors.error};
                    color: white;
                }

                /* ==================== ITEM SUMMARY ==================== */
                .item-summary {
                    margin-top: 16px;
                    padding: 12px;
                    background: ${appTheme.colors.backgroundCard};
                    border-radius: ${appTheme.radius.md};
                    border: 1px solid ${appTheme.colors.border};
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                    font-size: 0.813rem;
                    color: ${appTheme.colors.textSecondary};
                }

                .summary-row.total {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid ${appTheme.colors.border};
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                }

                .item-info {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                    flex-wrap: wrap;
                }

                .info-badge {
                    padding: 4px 8px;
                    background: ${appTheme.colors.backgroundCard};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 20px;
                    font-size: 0.625rem;
                    color: ${appTheme.colors.textSecondary};
                }

                /* ==================== ORDER SUMMARY ==================== */
                .order-summary {
                    background: ${appTheme.colors.primary}10;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: ${appTheme.radius.md};
                    padding: 20px;
                    margin-top: 20px;
                }

                .order-summary h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid ${appTheme.colors.primary}30;
                }

                .summary-items {
                    margin-bottom: 16px;
                }

                .summary-item {
                    margin-bottom: 8px;
                }

                .summary-item-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: ${appTheme.colors.textPrimary};
                }

                .summary-item-details {
                    display: flex;
                    gap: 16px;
                    margin-top: 4px;
                    font-size: 0.75rem;
                    color: ${appTheme.colors.textSecondary};
                }

                .summary-totals {
                    border-top: 1px solid ${appTheme.colors.primary}30;
                    padding-top: 16px;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 0.875rem;
                    color: ${appTheme.colors.textSecondary};
                }

                .total-row.discount {
                    color: ${appTheme.colors.success};
                }

                .total-row.grand-total {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid ${appTheme.colors.primary}30;
                    font-size: 1rem;
                    font-weight: 600;
                    color: ${appTheme.colors.textPrimary};
                }

                .total-row.payment {
                    color: ${appTheme.colors.primary};
                }

                .total-row.balance {
                    font-weight: 600;
                }

                .total-row.balance .pending {
                    color: ${appTheme.colors.warning};
                }

                .total-row.balance .paid {
                    color: ${appTheme.colors.success};
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

                    .save-button {
                        display: none;
                    }

                    .mobile-save {
                        display: block;
                    }

                    .page-title {
                        font-size: 1.25rem;
                    }

                    .main-content {
                        padding: 0 16px 100px 16px;
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

                    .section-header-left h2 {
                        font-size: 0.938rem;
                    }

                    .section-header-left p {
                        font-size: 0.688rem;
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

                    .item-card {
                        padding: 16px;
                    }

                    .company-banner,
                    .api-error {
                        padding: 0 16px;
                    }
                }
            `}</style>
        </>
    );
}