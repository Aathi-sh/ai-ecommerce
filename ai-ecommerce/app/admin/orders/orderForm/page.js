// "use client"

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Head from 'next/head';

// const CreateOrderPage = () => {
//   const router = useRouter();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     customerName: '',
//     customerEmail: '',
//     phoneNumber: '',
//     secondaryPhoneNumber: '',
//     shippingAddress: {
//       street: '',
//       city: '',
//       state: '',
//       pincode: '',
//       landmark: '',
//       country: 'India'
//     },
//     billingAddress: {
//       street: '',
//       city: '',
//       state: '',
//       pincode: '',
//       landmark: '',
//       country: 'India'
//     },
//     sameAsShipping: true,
//     paymentMethod: 'cod',
//     gstType: 'intra-state',
//     items: [{
//       productId: '',
//       productName: '',
//       quantity: 1,
//       mrp: 0,
//       discountPrice: 0,
//       price: 0,
//       gstRate: 18,
//       gstIncluded: true,
//       gstAmount: 0,
//       totalAmount: 0,
//       sku: '',
//       hsnCode: ''
//     }],
//     paidAmount: 0,
//     shippingCharge: 0,
//     orderNotes: '',
//     deliveryDate: '',
//     deliverySlot: ''
//   });
  
//   const [errors, setErrors] = useState({});
//   const [currentStep, setCurrentStep] = useState(1);
//   const [showBilling, setShowBilling] = useState(false);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('/api/products?isActive=true');
//       const data = await response.json();
//       if (data.success) {
//         setProducts(data.data);
//       } else {
//         console.error('Failed to fetch products:', data.message);
//       }
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Customer name validation
//     if (!formData.customerName.trim()) {
//       newErrors.customerName = 'Customer name is required';
//     }

//     // Email validation
//     if (!formData.customerEmail.trim()) {
//       newErrors.customerEmail = 'Customer email is required';
//     } else {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(formData.customerEmail)) {
//         newErrors.customerEmail = 'Please enter a valid email address';
//       }
//     }

//     // Phone number validation
//     if (!formData.phoneNumber.trim()) {
//       newErrors.phoneNumber = 'Phone number is required';
//     } else {
//       const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
//       if (cleanPhone.length !== 10) {
//         newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
//       }
//     }

//     // Secondary phone number validation (optional)
//     if (formData.secondaryPhoneNumber.trim()) {
//       const cleanSecondary = formData.secondaryPhoneNumber.replace(/\D/g, '');
//       if (cleanSecondary.length !== 10) {
//         newErrors.secondaryPhoneNumber = 'Please enter a valid 10-digit phone number';
//       }
//     }

//     // Shipping address validation
//     const address = formData.shippingAddress;
    
//     // Street validation
//     if (!address.street.trim()) {
//       newErrors.shippingStreet = 'Street address is required';
//     } else if (address.street.trim().length < 5) {
//       newErrors.shippingStreet = 'Please enter a complete street address';
//     }

//     // City validation
//     if (!address.city.trim()) {
//       newErrors.shippingCity = 'City is required';
//     }

//     // State validation
//     if (!address.state.trim()) {
//       newErrors.shippingState = 'State is required';
//     }

//     // Pincode validation
//     if (!address.pincode.trim()) {
//       newErrors.shippingPincode = 'Pincode is required';
//     } else if (!/^\d{6}$/.test(address.pincode)) {
//       newErrors.shippingPincode = 'Please enter a valid 6-digit pincode';
//     }

//     // GST type validation
//     if (!formData.gstType) {
//       newErrors.gstType = 'GST type is required';
//     }

//     // Payment method validation
//     if (!formData.paymentMethod) {
//       newErrors.paymentMethod = 'Payment method is required';
//     }

//     // Paid amount validation
//     if (formData.paidAmount < 0) {
//       newErrors.paidAmount = 'Paid amount cannot be negative';
//     }

//     // Items validation
//     formData.items.forEach((item, index) => {
//       if (!item.productId) {
//         newErrors[`item_${index}_product`] = 'Please select a product';
//       }
      
//       if (!item.quantity || item.quantity < 1) {
//         newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
//       } else {
//         const selectedProduct = products.find(p => p._id === item.productId);
//         if (selectedProduct) {
//           if (item.quantity > selectedProduct.stock) {
//             newErrors[`item_${index}_quantity`] = `Only ${selectedProduct.stock} units available`;
//           }
//           if (item.quantity > (selectedProduct.maxOrderQuantity || 10)) {
//             newErrors[`item_${index}_quantity`] = `Maximum ${selectedProduct.maxOrderQuantity || 10} units allowed`;
//           }
//         }
//       }

//       // Validate pricing
//       if (item.discountPrice > item.mrp) {
//         newErrors[`item_${index}_price`] = 'Discount price cannot be greater than MRP';
//       }
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     if (name.startsWith('shipping.')) {
//       const field = name.split('.')[1];
//       setFormData(prev => ({
//         ...prev,
//         shippingAddress: {
//           ...prev.shippingAddress,
//           [field]: value
//         }
//       }));
//     } else if (name.startsWith('billing.')) {
//       const field = name.split('.')[1];
//       setFormData(prev => ({
//         ...prev,
//         billingAddress: {
//           ...prev.billingAddress,
//           [field]: value
//         }
//       }));
//     } else if (type === 'checkbox') {
//       setFormData(prev => ({
//         ...prev,
//         [name]: checked
//       }));
      
//       // If sameAsShipping is checked, copy shipping to billing
//       if (name === 'sameAsShipping' && checked) {
//         setFormData(prev => ({
//           ...prev,
//           billingAddress: { ...prev.shippingAddress }
//         }));
//       }
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: ''
//       }));
//     }
//   };

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...formData.items];
    
//     if (field === 'productId') {
//       const selectedProduct = products.find(p => p._id === value);
//       if (selectedProduct) {
//         updatedItems[index] = {
//           ...updatedItems[index],
//           productId: value,
//           productName: selectedProduct.productName,
//           mrp: selectedProduct.mrp,
//           discountPrice: selectedProduct.discountPrice,
//           price: selectedProduct.discountPrice,
//           gstRate: selectedProduct.gstRate || 18,
//           gstIncluded: selectedProduct.gstIncluded !== false,
//           sku: selectedProduct.sku,
//           hsnCode: selectedProduct.hsnCode,
//           gstAmount: 0,
//           totalAmount: 0
//         };
        
//         // Calculate GST and total
//         calculateItemTotals(updatedItems[index]);
        
//         // Clear product error
//         if (errors[`item_${index}_product`]) {
//           setErrors(prev => ({
//             ...prev,
//             [`item_${index}_product`]: ''
//           }));
//         }
//       }
//     } else if (field === 'quantity' || field === 'price' || field === 'discountPrice' || field === 'mrp') {
//       const numValue = parseFloat(value) || 0;
//       updatedItems[index][field] = field === 'quantity' ? Math.max(1, Math.floor(numValue)) : numValue;
      
//       // Ensure discount price doesn't exceed MRP
//       if (updatedItems[index].discountPrice > updatedItems[index].mrp) {
//         updatedItems[index].discountPrice = updatedItems[index].mrp;
//       }
      
//       // Update price based on discount price
//       if (field === 'discountPrice') {
//         updatedItems[index].price = updatedItems[index].discountPrice;
//       }
      
//       // Recalculate totals
//       calculateItemTotals(updatedItems[index]);
      
//       // Clear quantity error
//       if (field === 'quantity' && errors[`item_${index}_quantity`]) {
//         setErrors(prev => ({
//           ...prev,
//           [`item_${index}_quantity`]: ''
//         }));
//       }
//     } else if (field === 'gstRate') {
//       updatedItems[index].gstRate = parseFloat(value) || 0;
//       calculateItemTotals(updatedItems[index]);
//     } else if (field === 'gstIncluded') {
//       updatedItems[index].gstIncluded = value;
//       calculateItemTotals(updatedItems[index]);
//     }

//     setFormData(prev => ({
//       ...prev,
//       items: updatedItems
//     }));
//   };

//   const calculateItemTotals = (item) => {
//     const itemTotal = item.quantity * item.price;
//     item.totalAmount = itemTotal;
    
//     if (!item.gstIncluded) {
//       // Calculate GST on base price
//       item.gstAmount = (itemTotal * item.gstRate) / 100;
//     } else {
//       // Back-calculate GST from inclusive price
//       const basePrice = itemTotal * 100 / (100 + item.gstRate);
//       item.gstAmount = itemTotal - basePrice;
//     }
//   };

//   const addItem = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, {
//         productId: '',
//         productName: '',
//         quantity: 1,
//         mrp: 0,
//         discountPrice: 0,
//         price: 0,
//         gstRate: 18,
//         gstIncluded: true,
//         gstAmount: 0,
//         totalAmount: 0,
//         sku: '',
//         hsnCode: ''
//       }]
//     }));
//   };

//   const removeItem = (index) => {
//     if (formData.items.length > 1) {
//       const updatedItems = formData.items.filter((_, i) => i !== index);
//       setFormData(prev => ({
//         ...prev,
//         items: updatedItems
//       }));

//       // Remove related errors
//       const newErrors = { ...errors };
//       delete newErrors[`item_${index}_product`];
//       delete newErrors[`item_${index}_quantity`];
//       delete newErrors[`item_${index}_price`];
//       setErrors(newErrors);
//     }
//   };

//   const calculateSubtotal = () => {
//     return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//   };

//   const calculateTotalGST = () => {
//     return formData.items.reduce((total, item) => total + (item.gstAmount || 0), 0);
//   };

//   const calculateTotalDiscount = () => {
//     return formData.items.reduce((total, item) => 
//       total + (item.quantity * (item.mrp - item.price)), 0
//     );
//   };

//   const calculateTotal = () => {
//     return calculateSubtotal() + calculateTotalGST() + (formData.shippingCharge || 0);
//   };

//   const getAvailableStock = (productId) => {
//     const product = products.find(p => p._id === productId);
//     return product ? product.stock : 0;
//   };

//   const getProductDetails = (productId) => {
//     return products.find(p => p._id === productId);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       // Scroll to first error
//       const firstError = Object.keys(errors)[0];
//       if (firstError) {
//         const element = document.getElementById(firstError);
//         if (element) {
//           element.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         }
//       }
//       return;
//     }

//     // Validate total paid amount doesn't exceed order total
//     const total = calculateTotal();
//     if (formData.paidAmount > total) {
//       alert('Paid amount cannot be greater than order total');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Prepare order data for API
//       const orderData = {
//         customerName: formData.customerName.trim(),
//         customerEmail: formData.customerEmail.trim().toLowerCase(),
//         phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
//         secondaryPhoneNumber: formData.secondaryPhoneNumber ? formData.secondaryPhoneNumber.replace(/\D/g, '') : null,
//         shippingAddress: formData.shippingAddress,
//         billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
//         sameAsShipping: formData.sameAsShipping,
//         paymentMethod: formData.paymentMethod,
//         gstType: formData.gstType,
//         items: formData.items.map(item => ({
//           productId: item.productId,
//           productName: item.productName,
//           quantity: item.quantity,
//           mrp: item.mrp,
//           discountPrice: item.discountPrice,
//           price: item.price,
//           gstRate: item.gstRate,
//           gstIncluded: item.gstIncluded,
//           gstAmount: item.gstAmount,
//           totalAmount: item.totalAmount,
//           sku: item.sku,
//           hsnCode: item.hsnCode
//         })),
//         subtotal: calculateSubtotal(),
//         totalDiscount: calculateTotalDiscount(),
//         totalGst: calculateTotalGST(),
//         shippingCharge: formData.shippingCharge || 0,
//         totalPrice: total,
//         paidAmount: formData.paidAmount || 0,
//         paymentStatus: formData.paidAmount >= total ? 'paid' : (formData.paidAmount > 0 ? 'partial' : 'pending'),
//         orderNotes: formData.orderNotes,
//         deliveryDate: formData.deliveryDate || null,
//         deliverySlot: formData.deliverySlot || null,
//         createdBy: 'admin', // This should come from auth context
//         status: 'pending',
//         statusHistory: [{
//           status: 'pending',
//           timestamp: new Date().toISOString(),
//           comment: 'Order created manually',
//           updatedBy: 'admin'
//         }]
//       };

//       console.log('Creating order with data:', orderData);

//       const response = await fetch('/api/orders', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(orderData),
//       });

//       const data = await response.json();

//       if (data.success) {
//         alert('Order created successfully!');
//         router.push('/admin/orders');
//       } else {
//         console.error('API Error:', data);
//         alert(`Error creating order: ${data.message || data.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       console.error('Error creating order:', error);
//       alert('Error creating order. Please check console for details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Steps configuration
//   const steps = [
//     { number: 1, name: 'Customer Details', icon: '👤' },
//     { number: 2, name: 'Address Information', icon: '📍' },
//     { number: 3, name: 'Order Items', icon: '📦' },
//     { number: 4, name: 'Payment & Review', icon: '💳' }
//   ];

//   return (
//     <>
//       <Head>
//         <title>Create New Order | LFMS</title>
//         <meta name="description" content="Create a new customer order with advanced features" />
//       </Head>

//       <div className="create-order-container">
//         {/* Header */}
//         <div className="page-header">
//           <h1 className="page-title">Create New Order</h1>
//           <p className="page-subtitle">
//             Create a comprehensive customer order with GST, pricing, and payment tracking
//           </p>
//         </div>

//         {/* Progress Steps */}
//         <div className="steps-container">
//           {steps.map((step) => (
//             <div 
//               key={step.number}
//               className={`step-item ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
//               onClick={() => setCurrentStep(step.number)}
//             >
//               <div className="step-icon">
//                 {currentStep > step.number ? '✓' : step.icon}
//               </div>
//               <div className="step-name">{step.name}</div>
//             </div>
//           ))}
//         </div>

//         {/* Form */}
//         <div className="form-card">
//           <form onSubmit={handleSubmit} className="form-content">
//             {/* Step 1: Customer Details */}
//             {currentStep === 1 && (
//               <div className="form-section">
//                 <h2 className="form-section-title">Customer Details</h2>
                
//                 <div className="form-grid">
//                   <div className="form-group full-width">
//                     <label htmlFor="customerName" className="form-label">
//                       Customer Name *
//                     </label>
//                     <input
//                       type="text"
//                       id="customerName"
//                       name="customerName"
//                       required
//                       value={formData.customerName}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.customerName ? 'input-error' : ''}`}
//                       placeholder="Enter customer full name"
//                     />
//                     {errors.customerName && (
//                       <p className="form-error">{errors.customerName}</p>
//                     )}
//                   </div>

//                   <div className="form-group full-width">
//                     <label htmlFor="customerEmail" className="form-label">
//                       Customer Email *
//                     </label>
//                     <input
//                       type="email"
//                       id="customerEmail"
//                       name="customerEmail"
//                       required
//                       value={formData.customerEmail}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.customerEmail ? 'input-error' : ''}`}
//                       placeholder="customer@example.com"
//                     />
//                     {errors.customerEmail && (
//                       <p className="form-error">{errors.customerEmail}</p>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="phoneNumber" className="form-label">
//                       Phone Number *
//                     </label>
//                     <input
//                       type="tel"
//                       id="phoneNumber"
//                       name="phoneNumber"
//                       required
//                       value={formData.phoneNumber}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.phoneNumber ? 'input-error' : ''}`}
//                       placeholder="Enter 10-digit phone number"
//                       maxLength={10}
//                     />
//                     {errors.phoneNumber && (
//                       <p className="form-error">{errors.phoneNumber}</p>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="secondaryPhoneNumber" className="form-label">
//                       Secondary Phone (Optional)
//                     </label>
//                     <input
//                       type="tel"
//                       id="secondaryPhoneNumber"
//                       name="secondaryPhoneNumber"
//                       value={formData.secondaryPhoneNumber}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.secondaryPhoneNumber ? 'input-error' : ''}`}
//                       placeholder="Alternate phone number"
//                       maxLength={10}
//                     />
//                     {errors.secondaryPhoneNumber && (
//                       <p className="form-error">{errors.secondaryPhoneNumber}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="form-navigation">
//                   <button
//                     type="button"
//                     onClick={() => router.back()}
//                     className="cancel-button"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setCurrentStep(2)}
//                     className="next-button"
//                   >
//                     Next: Address
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Address Information */}
//             {currentStep === 2 && (
//               <div className="form-section">
//                 <h2 className="form-section-title">Shipping Address</h2>
                
//                 <div className="form-grid">
//                   <div className="form-group full-width">
//                     <label htmlFor="shipping.street" className="form-label">
//                       Street Address *
//                     </label>
//                     <input
//                       type="text"
//                       id="shipping.street"
//                       name="shipping.street"
//                       required
//                       value={formData.shippingAddress.street}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.shippingStreet ? 'input-error' : ''}`}
//                       placeholder="Door No, Building, Street, Area"
//                     />
//                     {errors.shippingStreet && (
//                       <p className="form-error">{errors.shippingStreet}</p>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="shipping.city" className="form-label">
//                       City *
//                     </label>
//                     <input
//                       type="text"
//                       id="shipping.city"
//                       name="shipping.city"
//                       required
//                       value={formData.shippingAddress.city}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.shippingCity ? 'input-error' : ''}`}
//                       placeholder="City"
//                     />
//                     {errors.shippingCity && (
//                       <p className="form-error">{errors.shippingCity}</p>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="shipping.state" className="form-label">
//                       State *
//                     </label>
//                     <input
//                       type="text"
//                       id="shipping.state"
//                       name="shipping.state"
//                       required
//                       value={formData.shippingAddress.state}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.shippingState ? 'input-error' : ''}`}
//                       placeholder="State"
//                     />
//                     {errors.shippingState && (
//                       <p className="form-error">{errors.shippingState}</p>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="shipping.pincode" className="form-label">
//                       Pincode *
//                     </label>
//                     <input
//                       type="text"
//                       id="shipping.pincode"
//                       name="shipping.pincode"
//                       required
//                       maxLength={6}
//                       value={formData.shippingAddress.pincode}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.shippingPincode ? 'input-error' : ''}`}
//                       placeholder="6-digit pincode"
//                     />
//                     {errors.shippingPincode && (
//                       <p className="form-error">{errors.shippingPincode}</p>
//                     )}
//                   </div>

//                   <div className="form-group full-width">
//                     <label htmlFor="shipping.landmark" className="form-label">
//                       Landmark (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       id="shipping.landmark"
//                       name="shipping.landmark"
//                       value={formData.shippingAddress.landmark}
//                       onChange={handleInputChange}
//                       className="form-input"
//                       placeholder="Nearby landmark"
//                     />
//                   </div>

//                   <div className="form-group full-width">
//                     <label className="checkbox-label">
//                       <input
//                         type="checkbox"
//                         name="sameAsShipping"
//                         checked={formData.sameAsShipping}
//                         onChange={handleInputChange}
//                       />
//                       <span>Billing address same as shipping address</span>
//                     </label>
//                   </div>

//                   {!formData.sameAsShipping && (
//                     <div className="billing-section full-width">
//                       <h3 className="subsection-title">Billing Address</h3>
//                       <div className="form-grid">
//                         <div className="form-group full-width">
//                           <label htmlFor="billing.street" className="form-label">
//                             Street Address *
//                           </label>
//                           <input
//                             type="text"
//                             id="billing.street"
//                             name="billing.street"
//                             value={formData.billingAddress.street}
//                             onChange={handleInputChange}
//                             className="form-input"
//                             placeholder="Door No, Building, Street, Area"
//                           />
//                         </div>

//                         <div className="form-group">
//                           <label htmlFor="billing.city" className="form-label">
//                             City *
//                           </label>
//                           <input
//                             type="text"
//                             id="billing.city"
//                             name="billing.city"
//                             value={formData.billingAddress.city}
//                             onChange={handleInputChange}
//                             className="form-input"
//                             placeholder="City"
//                           />
//                         </div>

//                         <div className="form-group">
//                           <label htmlFor="billing.state" className="form-label">
//                             State *
//                           </label>
//                           <input
//                             type="text"
//                             id="billing.state"
//                             name="billing.state"
//                             value={formData.billingAddress.state}
//                             onChange={handleInputChange}
//                             className="form-input"
//                             placeholder="State"
//                           />
//                         </div>

//                         <div className="form-group">
//                           <label htmlFor="billing.pincode" className="form-label">
//                             Pincode *
//                           </label>
//                           <input
//                             type="text"
//                             id="billing.pincode"
//                             name="billing.pincode"
//                             maxLength={6}
//                             value={formData.billingAddress.pincode}
//                             onChange={handleInputChange}
//                             className="form-input"
//                             placeholder="6-digit pincode"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="form-navigation">
//                   <button
//                     type="button"
//                     onClick={() => setCurrentStep(1)}
//                     className="back-button"
//                   >
//                     Back
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setCurrentStep(3)}
//                     className="next-button"
//                   >
//                     Next: Order Items
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Order Items */}
//             {currentStep === 3 && (
//               <div className="form-section">
//                 <div className="section-header">
//                   <h2 className="form-section-title">Order Items</h2>
//                   <button
//                     type="button"
//                     onClick={addItem}
//                     className="add-button"
//                   >
//                     <span className="button-icon">+</span>
//                     Add Item
//                   </button>
//                 </div>

//                 <div className="items-container">
//                   {formData.items.map((item, index) => {
//                     const product = item.productId ? getProductDetails(item.productId) : null;
                    
//                     return (
//                       <div key={index} className="item-card">
//                         <div className="item-header">
//                           <span className="item-number">Item #{index + 1}</span>
//                           {formData.items.length > 1 && (
//                             <button
//                               type="button"
//                               onClick={() => removeItem(index)}
//                               className="remove-item-btn"
//                               title="Remove item"
//                             >
//                               ×
//                             </button>
//                           )}
//                         </div>

//                         <div className="item-grid">
//                           <div className="item-group product-select full-width">
//                             <label className="form-label">
//                               Product *
//                             </label>
//                             <select
//                               value={item.productId}
//                               onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
//                               className={`form-select ${errors[`item_${index}_product`] ? 'input-error' : ''}`}
//                               required
//                             >
//                               <option value="">Select a product</option>
//                               {products.map(product => (
//                                 <option 
//                                   key={product._id} 
//                                   value={product._id}
//                                   disabled={product.stock === 0}
//                                 >
//                                   {product.productName} - MRP: ₹{product.mrp} | Price: ₹{product.discountPrice} 
//                                   {product.stock === 0 ? ' (Out of Stock)' : ` (Stock: ${product.stock})`}
//                                 </option>
//                               ))}
//                             </select>
//                             {errors[`item_${index}_product`] && (
//                               <p className="form-error">{errors[`item_${index}_product`]}</p>
//                             )}
//                           </div>

//                           {product && (
//                             <>
//                               <div className="item-group">
//                                 <label className="form-label">MRP (₹)</label>
//                                 <input
//                                   type="number"
//                                   min="0"
//                                   step="0.01"
//                                   value={item.mrp}
//                                   onChange={(e) => handleItemChange(index, 'mrp', e.target.value)}
//                                   className="form-input"
//                                 />
//                               </div>

//                               <div className="item-group">
//                                 <label className="form-label">Discount Price (₹)</label>
//                                 <input
//                                   type="number"
//                                   min="0"
//                                   step="0.01"
//                                   value={item.discountPrice}
//                                   onChange={(e) => handleItemChange(index, 'discountPrice', e.target.value)}
//                                   className={`form-input ${errors[`item_${index}_price`] ? 'input-error' : ''}`}
//                                 />
//                                 {errors[`item_${index}_price`] && (
//                                   <p className="form-error">{errors[`item_${index}_price`]}</p>
//                                 )}
//                               </div>

//                               <div className="item-group">
//                                 <label className="form-label">Quantity *</label>
//                                 <input
//                                   type="number"
//                                   min="1"
//                                   max={product.stock}
//                                   value={item.quantity}
//                                   onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
//                                   className={`form-input ${errors[`item_${index}_quantity`] ? 'input-error' : ''}`}
//                                   required
//                                 />
//                                 {errors[`item_${index}_quantity`] && (
//                                   <p className="form-error">{errors[`item_${index}_quantity`]}</p>
//                                 )}
//                               </div>

//                               <div className="item-group">
//                                 <label className="form-label">GST Rate (%)</label>
//                                 <select
//                                   value={item.gstRate}
//                                   onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
//                                   className="form-select"
//                                 >
//                                   <option value="0">0%</option>
//                                   <option value="5">5%</option>
//                                   <option value="12">12%</option>
//                                   <option value="18">18%</option>
//                                   <option value="28">28%</option>
//                                 </select>
//                               </div>

//                               <div className="item-group">
//                                 <label className="checkbox-label">
//                                   <input
//                                     type="checkbox"
//                                     checked={item.gstIncluded}
//                                     onChange={(e) => handleItemChange(index, 'gstIncluded', e.target.checked)}
//                                   />
//                                   <span>GST Included</span>
//                                 </label>
//                               </div>
//                             </>
//                           )}
//                         </div>

//                         {item.productId && (
//                           <div className="item-summary">
//                             <div className="summary-row">
//                               <span>Subtotal:</span>
//                               <span>₹{(item.price * item.quantity).toFixed(2)}</span>
//                             </div>
//                             <div className="summary-row">
//                               <span>GST ({item.gstRate}%):</span>
//                               <span>₹{(item.gstAmount || 0).toFixed(2)}</span>
//                             </div>
//                             <div className="summary-row total">
//                               <span>Total:</span>
//                               <span>₹{((item.price * item.quantity) + (item.gstAmount || 0)).toFixed(2)}</span>
//                             </div>
//                           </div>
//                         )}

//                         {item.productId && (
//                           <div className="item-info">
//                             <span className="sku">SKU: {item.sku}</span>
//                             <span className="hsn">HSN: {item.hsnCode}</span>
//                             <span className="stock">Available: {getAvailableStock(item.productId)} units</span>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//                 <div className="form-navigation">
//                   <button
//                     type="button"
//                     onClick={() => setCurrentStep(2)}
//                     className="back-button"
//                   >
//                     Back
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setCurrentStep(4)}
//                     className="next-button"
//                   >
//                     Next: Payment & Review
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Step 4: Payment & Review */}
//             {currentStep === 4 && (
//               <div className="form-section">
//                 <h2 className="form-section-title">Payment & Review</h2>
                
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label htmlFor="paymentMethod" className="form-label">
//                       Payment Method *
//                     </label>
//                     <select
//                       id="paymentMethod"
//                       name="paymentMethod"
//                       value={formData.paymentMethod}
//                       onChange={handleInputChange}
//                       className={`form-select ${errors.paymentMethod ? 'input-error' : ''}`}
//                       required
//                     >
//                       <option value="cod">Cash on Delivery</option>
//                       <option value="cash">Cash</option>
//                       <option value="card">Card</option>
//                       <option value="upi">UPI</option>
//                       <option value="bank_transfer">Bank Transfer</option>
//                       <option value="wallet">Wallet</option>
//                     </select>
//                     {errors.paymentMethod && (
//                       <p className="form-error">{errors.paymentMethod}</p>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="gstType" className="form-label">
//                       GST Type *
//                     </label>
//                     <select
//                       id="gstType"
//                       name="gstType"
//                       value={formData.gstType}
//                       onChange={handleInputChange}
//                       className={`form-select ${errors.gstType ? 'input-error' : ''}`}
//                       required
//                     >
//                       <option value="intra-state">Intra-State (CGST + SGST)</option>
//                       <option value="inter-state">Inter-State (IGST)</option>
//                     </select>
//                     {errors.gstType && (
//                       <p className="form-error">{errors.gstType}</p>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="paidAmount" className="form-label">
//                       Paid Amount (₹)
//                     </label>
//                     <input
//                       type="number"
//                       id="paidAmount"
//                       name="paidAmount"
//                       min="0"
//                       step="0.01"
//                       value={formData.paidAmount}
//                       onChange={handleInputChange}
//                       className={`form-input ${errors.paidAmount ? 'input-error' : ''}`}
//                       placeholder="Amount already paid"
//                     />
//                     {errors.paidAmount && (
//                       <p className="form-error">{errors.paidAmount}</p>
//                     )}
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="shippingCharge" className="form-label">
//                       Shipping Charge (₹)
//                     </label>
//                     <input
//                       type="number"
//                       id="shippingCharge"
//                       name="shippingCharge"
//                       min="0"
//                       step="0.01"
//                       value={formData.shippingCharge}
//                       onChange={handleInputChange}
//                       className="form-input"
//                       placeholder="Shipping cost"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="deliveryDate" className="form-label">
//                       Delivery Date (Optional)
//                     </label>
//                     <input
//                       type="date"
//                       id="deliveryDate"
//                       name="deliveryDate"
//                       value={formData.deliveryDate}
//                       onChange={handleInputChange}
//                       className="form-input"
//                       min={new Date().toISOString().split('T')[0]}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="deliverySlot" className="form-label">
//                       Delivery Slot (Optional)
//                     </label>
//                     <select
//                       id="deliverySlot"
//                       name="deliverySlot"
//                       value={formData.deliverySlot}
//                       onChange={handleInputChange}
//                       className="form-select"
//                     >
//                       <option value="">Select slot</option>
//                       <option value="morning">Morning (9 AM - 12 PM)</option>
//                       <option value="afternoon">Afternoon (12 PM - 3 PM)</option>
//                       <option value="evening">Evening (3 PM - 6 PM)</option>
//                       <option value="night">Night (6 PM - 9 PM)</option>
//                     </select>
//                   </div>

//                   <div className="form-group full-width">
//                     <label htmlFor="orderNotes" className="form-label">
//                       Order Notes (Optional)
//                     </label>
//                     <textarea
//                       id="orderNotes"
//                       name="orderNotes"
//                       rows={3}
//                       value={formData.orderNotes}
//                       onChange={handleInputChange}
//                       className="form-textarea"
//                       placeholder="Any special instructions or notes for this order"
//                     />
//                   </div>
//                 </div>

//                 {/* Order Summary */}
//                 <div className="order-summary-card">
//                   <h3 className="summary-card-title">Order Summary</h3>
                  
//                   <div className="summary-items">
//                     {formData.items.map((item, index) => (
//                       <div key={index} className="summary-item">
//                         <div className="item-name">{item.productName || `Item ${index + 1}`}</div>
//                         <div className="item-details">
//                           <span>Qty: {item.quantity}</span>
//                           <span>Price: ₹{item.price}</span>
//                           <span>GST: ₹{(item.gstAmount || 0).toFixed(2)}</span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="summary-totals">
//                     <div className="total-row">
//                       <span>Subtotal:</span>
//                       <span>₹{calculateSubtotal().toFixed(2)}</span>
//                     </div>
                    
//                     <div className="total-row">
//                       <span>Total Discount:</span>
//                       <span className="discount">- ₹{calculateTotalDiscount().toFixed(2)}</span>
//                     </div>
                    
//                     <div className="total-row">
//                       <span>Total GST:</span>
//                       <span>₹{calculateTotalGST().toFixed(2)}</span>
//                     </div>
                    
//                     <div className="total-row">
//                       <span>Shipping:</span>
//                       <span>₹{(formData.shippingCharge || 0).toFixed(2)}</span>
//                     </div>
                    
//                     <div className="total-row grand-total">
//                       <span>Grand Total:</span>
//                       <span>₹{calculateTotal().toFixed(2)}</span>
//                     </div>
                    
//                     <div className="total-row payment">
//                       <span>Paid Amount:</span>
//                       <span>₹{(formData.paidAmount || 0).toFixed(2)}</span>
//                     </div>
                    
//                     <div className="total-row balance">
//                       <span>Balance Amount:</span>
//                       <span className={calculateTotal() - (formData.paidAmount || 0) > 0 ? 'pending' : 'paid'}>
//                         ₹{(calculateTotal() - (formData.paidAmount || 0)).toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="form-navigation">
//                   <button
//                     type="button"
//                     onClick={() => setCurrentStep(3)}
//                     className="back-button"
//                   >
//                     Back
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="submit-button"
//                   >
//                     {loading ? (
//                       <>
//                         <span className="spinner"></span>
//                         Creating Order...
//                       </>
//                     ) : (
//                       'Create Order'
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </form>
//         </div>

//         <style jsx>{`
//           /* Container Styles */
//           .create-order-container {
//             padding: 1.5rem;
//             max-width: 1200px;
//             margin: 0 auto;
//             width: 100%;
//           }

//           /* Page Header */
//           .page-header {
//             margin-bottom: 2rem;
//           }

//           .page-title {
//             font-size: clamp(1.5rem, 3vw, 2rem);
//             font-weight: bold;
//             color: #1f2937;
//             margin: 0;
//           }

//           .page-subtitle {
//             margin-top: 0.5rem;
//             color: #6b7280;
//             font-size: 0.95rem;
//           }

//           /* Progress Steps */
//           .steps-container {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 2rem;
//             padding: 1rem;
//             background: white;
//             border-radius: 0.5rem;
//             box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//           }

//           .step-item {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             gap: 0.5rem;
//             flex: 1;
//             cursor: pointer;
//             opacity: 0.5;
//             transition: all 0.3s ease;
//           }

//           .step-item.active {
//             opacity: 1;
//           }

//           .step-item.completed {
//             opacity: 1;
//             color: #10b981;
//           }

//           .step-icon {
//             width: 2.5rem;
//             height: 2.5rem;
//             background: #f3f4f6;
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             font-size: 1.25rem;
//             transition: all 0.3s ease;
//           }

//           .step-item.active .step-icon {
//             background: #3b82f6;
//             color: white;
//           }

//           .step-item.completed .step-icon {
//             background: #10b981;
//             color: white;
//           }

//           .step-name {
//             font-size: 0.875rem;
//             font-weight: 500;
//             text-align: center;
//           }

//           /* Form Card */
//           .form-card {
//             background: white;
//             border-radius: 0.75rem;
//             box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//             overflow: hidden;
//           }

//           .form-content {
//             padding: 1.5rem;
//           }

//           /* Form Sections */
//           .form-section {
//             margin-bottom: 2rem;
//           }

//           .form-section-title {
//             font-size: 1.25rem;
//             font-weight: 600;
//             color: #374151;
//             margin-bottom: 1.5rem;
//           }

//           .subsection-title {
//             font-size: 1rem;
//             font-weight: 600;
//             color: #4b5563;
//             margin: 1rem 0;
//           }

//           .section-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 1rem;
//           }

//           /* Form Grid */
//           .form-grid {
//             display: grid;
//             grid-template-columns: repeat(1, 1fr);
//             gap: 1rem;
//           }

//           @media (min-width: 640px) {
//             .form-grid {
//               grid-template-columns: repeat(2, 1fr);
//             }
//           }

//           @media (min-width: 1024px) {
//             .form-grid {
//               grid-template-columns: repeat(3, 1fr);
//             }
//           }

//           .full-width {
//             grid-column: 1 / -1;
//           }

//           /* Form Groups */
//           .form-group {
//             margin-bottom: 1rem;
//           }

//           .form-label {
//             display: block;
//             font-size: 0.875rem;
//             font-weight: 500;
//             color: #374151;
//             margin-bottom: 0.375rem;
//           }

//           /* Form Inputs */
//           .form-input {
//             width: 100%;
//             padding: 0.5rem 0.75rem;
//             border: 1px solid #d1d5db;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             transition: all 0.15s ease;
//             background: white;
//           }

//           .form-input:focus {
//             outline: none;
//             border-color: #3b82f6;
//             box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//           }

//           .form-textarea {
//             width: 100%;
//             padding: 0.5rem 0.75rem;
//             border: 1px solid #d1d5db;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             transition: all 0.15s ease;
//             background: white;
//             resize: vertical;
//             min-height: 80px;
//           }

//           .form-textarea:focus {
//             outline: none;
//             border-color: #3b82f6;
//             box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//           }

//           .form-select {
//             width: 100%;
//             padding: 0.5rem 0.75rem;
//             border: 1px solid #d1d5db;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             transition: all 0.15s ease;
//             background: white;
//             cursor: pointer;
//           }

//           .form-select:focus {
//             outline: none;
//             border-color: #3b82f6;
//             box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//           }

//           .input-error {
//             border-color: #ef4444;
//           }

//           .input-error:focus {
//             border-color: #ef4444;
//             box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
//           }

//           /* Checkbox */
//           .checkbox-label {
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//             cursor: pointer;
//             font-size: 0.875rem;
//             color: #374151;
//           }

//           .checkbox-label input[type="checkbox"] {
//             width: 1rem;
//             height: 1rem;
//             cursor: pointer;
//           }

//           /* Error Messages */
//           .form-error {
//             margin-top: 0.25rem;
//             font-size: 0.75rem;
//             color: #ef4444;
//           }

//           /* Add Button */
//           .add-button {
//             display: inline-flex;
//             align-items: center;
//             gap: 0.375rem;
//             background: #10b981;
//             color: white;
//             padding: 0.5rem 1rem;
//             border: none;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             font-weight: 500;
//             cursor: pointer;
//             transition: background-color 0.15s ease;
//           }

//           .add-button:hover {
//             background: #059669;
//           }

//           .button-icon {
//             font-size: 1rem;
//             font-weight: bold;
//           }

//           /* Items Container */
//           .items-container {
//             display: flex;
//             flex-direction: column;
//             gap: 1.5rem;
//           }

//           .item-card {
//             background: #f9fafb;
//             border: 1px solid #e5e7eb;
//             border-radius: 0.5rem;
//             padding: 1rem;
//           }

//           .item-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 1rem;
//             padding-bottom: 0.5rem;
//             border-bottom: 1px solid #e5e7eb;
//           }

//           .item-number {
//             font-weight: 600;
//             color: #4b5563;
//           }

//           .remove-item-btn {
//             width: 1.5rem;
//             height: 1.5rem;
//             background: #ef4444;
//             color: white;
//             border: none;
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             cursor: pointer;
//             font-size: 1.25rem;
//             transition: background-color 0.15s ease;
//           }

//           .remove-item-btn:hover {
//             background: #dc2626;
//           }

//           .item-grid {
//             display: grid;
//             grid-template-columns: repeat(1, 1fr);
//             gap: 1rem;
//           }

//           @media (min-width: 768px) {
//             .item-grid {
//               grid-template-columns: repeat(4, 1fr);
//             }
//           }

//           .item-group {
//             margin-bottom: 0;
//           }

//           .product-select {
//             grid-column: 1 / -1;
//           }

//           @media (min-width: 768px) {
//             .product-select {
//               grid-column: span 2;
//             }
//           }

//           /* Item Summary */
//           .item-summary {
//             margin-top: 1rem;
//             padding: 1rem;
//             background: white;
//             border-radius: 0.375rem;
//             border: 1px solid #e5e7eb;
//           }

//           .summary-row {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 0.25rem;
//             font-size: 0.875rem;
//             color: #6b7280;
//           }

//           .summary-row.total {
//             margin-top: 0.5rem;
//             padding-top: 0.5rem;
//             border-top: 1px solid #e5e7eb;
//             font-weight: 600;
//             color: #1f2937;
//           }

//           .item-info {
//             display: flex;
//             gap: 1rem;
//             margin-top: 0.75rem;
//             font-size: 0.75rem;
//             color: #6b7280;
//           }

//           .sku, .hsn, .stock {
//             background: #e5e7eb;
//             padding: 0.25rem 0.5rem;
//             border-radius: 0.25rem;
//           }

//           /* Order Summary Card */
//           .order-summary-card {
//             background: #eff6ff;
//             border: 1px solid #dbeafe;
//             border-radius: 0.5rem;
//             padding: 1.5rem;
//             margin: 1.5rem 0;
//           }

//           .summary-card-title {
//             font-size: 1.125rem;
//             font-weight: 600;
//             color: #1f2937;
//             margin-bottom: 1rem;
//             padding-bottom: 0.5rem;
//             border-bottom: 1px solid #dbeafe;
//           }

//           .summary-items {
//             margin-bottom: 1rem;
//           }

//           .summary-item {
//             margin-bottom: 0.75rem;
//           }

//           .item-name {
//             font-weight: 500;
//             color: #374151;
//           }

//           .item-details {
//             display: flex;
//             gap: 1rem;
//             margin-top: 0.25rem;
//             font-size: 0.875rem;
//             color: #6b7280;
//           }

//           .summary-totals {
//             border-top: 1px solid #dbeafe;
//             padding-top: 1rem;
//           }

//           .total-row {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 0.5rem;
//             font-size: 0.875rem;
//             color: #4b5563;
//           }

//           .total-row.discount {
//             color: #10b981;
//           }

//           .total-row.grand-total {
//             margin-top: 0.5rem;
//             padding-top: 0.5rem;
//             border-top: 1px solid #dbeafe;
//             font-size: 1rem;
//             font-weight: 600;
//             color: #1f2937;
//           }

//           .total-row.payment {
//             color: #3b82f6;
//           }

//           .total-row.balance {
//             font-weight: 600;
//           }

//           .total-row.balance .pending {
//             color: #f59e0b;
//           }

//           .total-row.balance .paid {
//             color: #10b981;
//           }

//           /* Form Navigation */
//           .form-navigation {
//             display: flex;
//             justify-content: space-between;
//             gap: 1rem;
//             padding-top: 1.5rem;
//             border-top: 1px solid #e5e7eb;
//           }

//           .back-button {
//             padding: 0.5rem 1rem;
//             border: 1px solid #d1d5db;
//             border-radius: 0.375rem;
//             background: white;
//             color: #374151;
//             font-size: 0.875rem;
//             font-weight: 500;
//             cursor: pointer;
//             transition: all 0.15s ease;
//           }

//           .back-button:hover {
//             background: #f9fafb;
//           }

//           .next-button {
//             padding: 0.5rem 1.5rem;
//             background: #3b82f6;
//             color: white;
//             border: none;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             font-weight: 500;
//             cursor: pointer;
//             transition: background-color 0.15s ease;
//             margin-left: auto;
//           }

//           .next-button:hover {
//             background: #2563eb;
//           }

//           .cancel-button {
//             padding: 0.5rem 1rem;
//             border: 1px solid #d1d5db;
//             border-radius: 0.375rem;
//             background: white;
//             color: #374151;
//             font-size: 0.875rem;
//             font-weight: 500;
//             cursor: pointer;
//             transition: all 0.15s ease;
//           }

//           .cancel-button:hover {
//             background: #f9fafb;
//           }

//           .submit-button {
//             display: inline-flex;
//             align-items: center;
//             gap: 0.5rem;
//             padding: 0.5rem 1.5rem;
//             background: #10b981;
//             color: white;
//             border: none;
//             border-radius: 0.375rem;
//             font-size: 0.875rem;
//             font-weight: 500;
//             cursor: pointer;
//             transition: background-color 0.15s ease;
//           }

//           .submit-button:hover {
//             background: #059669;
//           }

//           .submit-button:disabled {
//             background: #93c5fd;
//             cursor: not-allowed;
//           }

//           /* Spinner */
//           .spinner {
//             width: 1rem;
//             height: 1rem;
//             border: 2px solid rgba(255, 255, 255, 0.3);
//             border-radius: 50%;
//             border-top-color: white;
//             animation: spin 1s linear infinite;
//           }

//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }

//           /* Loading State */
//           @keyframes pulse {
//             0%, 100% { opacity: 1; }
//             50% { opacity: 0.5; }
//           }

//           .loading {
//             animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//           }

//           /* Billing Section */
//           .billing-section {
//             margin-top: 1rem;
//             padding: 1rem;
//             background: #f9fafb;
//             border-radius: 0.5rem;
//             border: 1px solid #e5e7eb;
//           }

//           /* Mobile Optimizations */
//           @media (max-width: 768px) {
//             .create-order-container {
//               padding: 1rem;
//             }
            
//             .form-content {
//               padding: 1rem;
//             }
            
//             .steps-container {
//               flex-wrap: wrap;
//               gap: 0.5rem;
//             }
            
//             .step-item {
//               min-width: calc(50% - 0.5rem);
//             }
            
//             .form-navigation {
//               flex-direction: column-reverse;
//             }
            
//             .form-navigation button {
//               width: 100%;
//             }
            
//             .next-button {
//               margin-left: 0;
//             }
            
//             .item-card {
//               padding: 0.75rem;
//             }
            
//             .item-info {
//               flex-wrap: wrap;
//             }
//           }

//           @media (max-width: 640px) {
//             .form-grid {
//               grid-template-columns: 1fr;
//             }
            
//             .section-header {
//               flex-direction: column;
//               align-items: stretch;
//               gap: 1rem;
//             }
            
//             .add-button {
//               align-self: flex-start;
//             }
//           }
//         `}</style>
//       </div>
//     </>
//   );
// };

// export default CreateOrderPage;






"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { appTheme } from '../../../../src/constants/theme';
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
    Truck as TruckIcon, Clock as ClockIcon
} from 'lucide-react';

// ==================== CONSTANTS ====================
const SECTIONS = [
    { 
        id: 'customer', 
        title: 'Customer Details', 
        icon: User, 
        color: appTheme.colors.primary,
        description: 'Customer contact information'
    },
    { 
        id: 'address', 
        title: 'Address Information', 
        icon: MapPin, 
        color: appTheme.colors.secondary,
        description: 'Shipping and billing addresses'
    },
    { 
        id: 'items', 
        title: 'Order Items', 
        icon: Package, 
        color: appTheme.colors.warning,
        description: 'Products and quantities'
    },
    { 
        id: 'payment', 
        title: 'Payment & Review', 
        icon: CreditCard, 
        color: appTheme.colors.success,
        description: 'Payment details and order summary'
    }
];

const PAYMENT_METHODS = [
    { value: 'cod', label: 'Cash on Delivery', icon: '💵' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'upi', label: 'UPI', icon: '📱' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'wallet', label: 'Wallet', icon: '👛' }
];

const DELIVERY_SLOTS = [
    { value: 'morning', label: 'Morning (9 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 3 PM)' },
    { value: 'evening', label: 'Evening (3 PM - 6 PM)' },
    { value: 'night', label: 'Night (6 PM - 9 PM)' }
];

const GST_TYPES = [
    { value: 'intra-state', label: 'Intra-State (CGST + SGST)' },
    { value: 'inter-state', label: 'Inter-State (IGST)' }
];

const GST_RATES = [0, 5, 12, 18, 28];

const CreateOrderPage = () => {
    const router = useRouter();
    const [expandedSections, setExpandedSections] = useState(['customer']);
    const [activeTab, setActiveTab] = useState('customer');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [errors, setErrors] = useState({});
    const [isMobile, setIsMobile] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        phoneNumber: '',
        secondaryPhoneNumber: '',
        shippingAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            landmark: '',
            country: 'India'
        },
        billingAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            landmark: '',
            country: 'India'
        },
        sameAsShipping: true,
        paymentMethod: 'cod',
        gstType: 'intra-state',
        items: [{
            productId: '',
            productName: '',
            quantity: 1,
            mrp: 0,
            discountPrice: 0,
            price: 0,
            gstRate: 18,
            gstIncluded: true,
            gstAmount: 0,
            totalAmount: 0,
            sku: '',
            hsnCode: ''
        }],
        paidAmount: 0,
        shippingCharge: 0,
        orderNotes: '',
        deliveryDate: '',
        deliverySlot: ''
    });

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

    useEffect(() => {
        fetchProducts();
    }, []);

    const showToast = (type, message) => {
        setToast({ show: true, type, message });
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products?isActive=true');
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            } else {
                showToast('error', 'Failed to fetch products: ' + data.message);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            showToast('error', 'Error fetching products');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Customer name validation
        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Customer name is required';
        }

        // Email validation
        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'Customer email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.customerEmail)) {
                newErrors.customerEmail = 'Please enter a valid email address';
            }
        }

        // Phone number validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else {
            const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
            if (cleanPhone.length !== 10) {
                newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
            }
        }

        // Secondary phone number validation (optional)
        if (formData.secondaryPhoneNumber.trim()) {
            const cleanSecondary = formData.secondaryPhoneNumber.replace(/\D/g, '');
            if (cleanSecondary.length !== 10) {
                newErrors.secondaryPhoneNumber = 'Please enter a valid 10-digit phone number';
            }
        }

        // Shipping address validation
        const address = formData.shippingAddress;
        
        if (!address.street.trim()) {
            newErrors.shippingStreet = 'Street address is required';
        } else if (address.street.trim().length < 5) {
            newErrors.shippingStreet = 'Please enter a complete street address';
        }

        if (!address.city.trim()) {
            newErrors.shippingCity = 'City is required';
        }

        if (!address.state.trim()) {
            newErrors.shippingState = 'State is required';
        }

        if (!address.pincode.trim()) {
            newErrors.shippingPincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(address.pincode)) {
            newErrors.shippingPincode = 'Please enter a valid 6-digit pincode';
        }

        // GST type validation
        if (!formData.gstType) {
            newErrors.gstType = 'GST type is required';
        }

        // Payment method validation
        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Payment method is required';
        }

        // Paid amount validation
        if (formData.paidAmount < 0) {
            newErrors.paidAmount = 'Paid amount cannot be negative';
        }

        // Items validation
        formData.items.forEach((item, index) => {
            if (!item.productId) {
                newErrors[`item_${index}_product`] = 'Please select a product';
            }
            
            if (!item.quantity || item.quantity < 1) {
                newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
            } else {
                const selectedProduct = products.find(p => p._id === item.productId);
                if (selectedProduct) {
                    if (item.quantity > selectedProduct.stock) {
                        newErrors[`item_${index}_quantity`] = `Only ${selectedProduct.stock} units available`;
                    }
                    if (item.quantity > (selectedProduct.maxOrderQuantity || 10)) {
                        newErrors[`item_${index}_quantity`] = `Maximum ${selectedProduct.maxOrderQuantity || 10} units allowed`;
                    }
                }
            }

            if (item.discountPrice > item.mrp) {
                newErrors[`item_${index}_price`] = 'Discount price cannot be greater than MRP';
            }
        });

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
                [name]: ''
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
                
                if (errors[`item_${index}_product`]) {
                    setErrors(prev => ({
                        ...prev,
                        [`item_${index}_product`]: ''
                    }));
                }
            }
        } else if (field === 'quantity' || field === 'price' || field === 'discountPrice' || field === 'mrp') {
            const numValue = parseFloat(value) || 0;
            updatedItems[index][field] = field === 'quantity' ? Math.max(1, Math.floor(numValue)) : numValue;
            
            if (updatedItems[index].discountPrice > updatedItems[index].mrp) {
                updatedItems[index].discountPrice = updatedItems[index].mrp;
            }
            
            if (field === 'discountPrice') {
                updatedItems[index].price = updatedItems[index].discountPrice;
            }
            
            calculateItemTotals(updatedItems[index]);
            
            if (field === 'quantity' && errors[`item_${index}_quantity`]) {
                setErrors(prev => ({
                    ...prev,
                    [`item_${index}_quantity`]: ''
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
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, {
                productId: '',
                productName: '',
                quantity: 1,
                mrp: 0,
                discountPrice: 0,
                price: 0,
                gstRate: 18,
                gstIncluded: true,
                gstAmount: 0,
                totalAmount: 0,
                sku: '',
                hsnCode: ''
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
            showToast('error', 'Please fix the errors before submitting');
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                const element = document.getElementById(firstError);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return;
        }

        const total = calculateTotal();
        if (formData.paidAmount > total) {
            showToast('error', 'Paid amount cannot be greater than order total');
            return;
        }

        setSaving(true);

        try {
            const orderData = {
                customerName: formData.customerName.trim(),
                customerEmail: formData.customerEmail.trim().toLowerCase(),
                phoneNumber: formData.phoneNumber.replace(/\D/g, ''),
                secondaryPhoneNumber: formData.secondaryPhoneNumber ? formData.secondaryPhoneNumber.replace(/\D/g, '') : null,
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
                orderNotes: formData.orderNotes,
                deliveryDate: formData.deliveryDate || null,
                deliverySlot: formData.deliverySlot || null,
                createdBy: 'admin',
                status: 'pending',
                statusHistory: [{
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                    comment: 'Order created manually',
                    updatedBy: 'admin'
                }]
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (data.success) {
                showToast('success', 'Order created successfully!');
                setTimeout(() => router.push('/admin/orders'), 1500);
            } else {
                showToast('error', `Error creating order: ${data.message || data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            showToast('error', 'Error creating order. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = useCallback(() => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/admin/orders');
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
        setCurrentStep(SECTIONS.findIndex(s => s.id === sectionId) + 1);
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

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-grid">
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                    <div className="loading-card"></div>
                </div>
                <p className="loading-text">Loading products...</p>
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
                <title>Create New Order | LFMS</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Create a new customer order with advanced features" />
            </Head>

            <div className="create-order-page">
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
                                <ShoppingCart size={28} className="title-icon" />
                                Create New Order
                            </h1>
                            <p className="page-description">
                                Create a comprehensive customer order with GST, pricing, and payment tracking
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
                                disabled={saving}
                                className="save-button"
                            >
                                {saving ? (
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
                                            {/* Customer Details Section */}
                                            {section.id === 'customer' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <User size={16} />
                                                            Customer Information
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Customer Name <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="customerName"
                                                                    id="customerName"
                                                                    value={formData.customerName}
                                                                    onChange={handleInputChange}
                                                                    className={errors.customerName ? 'error' : ''}
                                                                    placeholder="Enter customer full name"
                                                                />
                                                                {errors.customerName && <span className="error-text">{errors.customerName}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Email Address <span className="required">*</span></label>
                                                                <input
                                                                    type="email"
                                                                    name="customerEmail"
                                                                    id="customerEmail"
                                                                    value={formData.customerEmail}
                                                                    onChange={handleInputChange}
                                                                    className={errors.customerEmail ? 'error' : ''}
                                                                    placeholder="customer@example.com"
                                                                />
                                                                {errors.customerEmail && <span className="error-text">{errors.customerEmail}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Phone Number <span className="required">*</span></label>
                                                                <input
                                                                    type="tel"
                                                                    name="phoneNumber"
                                                                    id="phoneNumber"
                                                                    value={formData.phoneNumber}
                                                                    onChange={handleInputChange}
                                                                    className={errors.phoneNumber ? 'error' : ''}
                                                                    placeholder="10-digit phone number"
                                                                    maxLength={10}
                                                                />
                                                                {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Secondary Phone</label>
                                                                <input
                                                                    type="tel"
                                                                    name="secondaryPhoneNumber"
                                                                    id="secondaryPhoneNumber"
                                                                    value={formData.secondaryPhoneNumber}
                                                                    onChange={handleInputChange}
                                                                    className={errors.secondaryPhoneNumber ? 'error' : ''}
                                                                    placeholder="Alternate phone number"
                                                                    maxLength={10}
                                                                />
                                                                {errors.secondaryPhoneNumber && <span className="error-text">{errors.secondaryPhoneNumber}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Address Section */}
                                            {section.id === 'address' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <MapPin size={16} />
                                                            Shipping Address
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field span-2">
                                                                <label>Street Address <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="shipping.street"
                                                                    value={formData.shippingAddress.street}
                                                                    onChange={handleInputChange}
                                                                    className={errors.shippingStreet ? 'error' : ''}
                                                                    placeholder="Door No, Building, Street, Area"
                                                                />
                                                                {errors.shippingStreet && <span className="error-text">{errors.shippingStreet}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>City <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="shipping.city"
                                                                    value={formData.shippingAddress.city}
                                                                    onChange={handleInputChange}
                                                                    className={errors.shippingCity ? 'error' : ''}
                                                                    placeholder="City"
                                                                />
                                                                {errors.shippingCity && <span className="error-text">{errors.shippingCity}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>State <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="shipping.state"
                                                                    value={formData.shippingAddress.state}
                                                                    onChange={handleInputChange}
                                                                    className={errors.shippingState ? 'error' : ''}
                                                                    placeholder="State"
                                                                />
                                                                {errors.shippingState && <span className="error-text">{errors.shippingState}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Pincode <span className="required">*</span></label>
                                                                <input
                                                                    type="text"
                                                                    name="shipping.pincode"
                                                                    value={formData.shippingAddress.pincode}
                                                                    onChange={handleInputChange}
                                                                    className={errors.shippingPincode ? 'error' : ''}
                                                                    placeholder="6-digit pincode"
                                                                    maxLength={6}
                                                                />
                                                                {errors.shippingPincode && <span className="error-text">{errors.shippingPincode}</span>}
                                                            </div>

                                                            <div className="form-field span-2">
                                                                <label>Landmark</label>
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

                                                    <div className="form-block">
                                                        <div className="toggle-field">
                                                            <label className="toggle">
                                                                <input
                                                                    type="checkbox"
                                                                    name="sameAsShipping"
                                                                    checked={formData.sameAsShipping}
                                                                    onChange={handleInputChange}
                                                                />
                                                                <span className="toggle-slider"></span>
                                                                <span className="toggle-label">Billing address same as shipping address</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {!formData.sameAsShipping && (
                                                        <div className="form-block">
                                                            <h3>
                                                                <MapPin size={16} />
                                                                Billing Address
                                                            </h3>
                                                            <div className="form-grid">
                                                                <div className="form-field span-2">
                                                                    <label>Street Address <span className="required">*</span></label>
                                                                    <input
                                                                        type="text"
                                                                        name="billing.street"
                                                                        value={formData.billingAddress.street}
                                                                        onChange={handleInputChange}
                                                                        placeholder="Door No, Building, Street, Area"
                                                                    />
                                                                </div>

                                                                <div className="form-field">
                                                                    <label>City <span className="required">*</span></label>
                                                                    <input
                                                                        type="text"
                                                                        name="billing.city"
                                                                        value={formData.billingAddress.city}
                                                                        onChange={handleInputChange}
                                                                        placeholder="City"
                                                                    />
                                                                </div>

                                                                <div className="form-field">
                                                                    <label>State <span className="required">*</span></label>
                                                                    <input
                                                                        type="text"
                                                                        name="billing.state"
                                                                        value={formData.billingAddress.state}
                                                                        onChange={handleInputChange}
                                                                        placeholder="State"
                                                                    />
                                                                </div>

                                                                <div className="form-field">
                                                                    <label>Pincode <span className="required">*</span></label>
                                                                    <input
                                                                        type="text"
                                                                        name="billing.pincode"
                                                                        value={formData.billingAddress.pincode}
                                                                        onChange={handleInputChange}
                                                                        placeholder="6-digit pincode"
                                                                        maxLength={6}
                                                                    />
                                                                </div>

                                                                <div className="form-field span-2">
                                                                    <label>Landmark</label>
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
                                                </>
                                            )}

                                            {/* Order Items Section */}
                                            {section.id === 'items' && (
                                                <>
                                                    <div className="form-block">
                                                        <div className="section-header">
                                                            <h3>
                                                                <Package size={16} />
                                                                Order Items
                                                            </h3>
                                                            <button
                                                                type="button"
                                                                onClick={addItem}
                                                                className="add-button"
                                                            >
                                                                <Plus size={16} />
                                                                <span>Add Item</span>
                                                            </button>
                                                        </div>

                                                        <div className="items-list">
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
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        <div className="item-grid">
                                                                            <div className="form-field span-2">
                                                                                <label>Product <span className="required">*</span></label>
                                                                                <select
                                                                                    value={item.productId}
                                                                                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                                                    className={errors[`item_${index}_product`] ? 'error' : ''}
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

                                                                            {product && (
                                                                                <>
                                                                                    <div className="form-field">
                                                                                        <label>MRP (₹)</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            min="0"
                                                                                            step="0.01"
                                                                                            value={item.mrp}
                                                                                            onChange={(e) => handleItemChange(index, 'mrp', e.target.value)}
                                                                                        />
                                                                                    </div>

                                                                                    <div className="form-field">
                                                                                        <label>Price (₹)</label>
                                                                                        <input
                                                                                            type="number"
                                                                                            min="0"
                                                                                            step="0.01"
                                                                                            value={item.discountPrice}
                                                                                            onChange={(e) => handleItemChange(index, 'discountPrice', e.target.value)}
                                                                                            className={errors[`item_${index}_price`] ? 'error' : ''}
                                                                                        />
                                                                                        {errors[`item_${index}_price`] && (
                                                                                            <span className="error-text">{errors[`item_${index}_price`]}</span>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="form-field">
                                                                                        <label>Quantity <span className="required">*</span></label>
                                                                                        <input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            max={product?.stock}
                                                                                            value={item.quantity}
                                                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                                                            className={errors[`item_${index}_quantity`] ? 'error' : ''}
                                                                                        />
                                                                                        {errors[`item_${index}_quantity`] && (
                                                                                            <span className="error-text">{errors[`item_${index}_quantity`]}</span>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="form-field">
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

                                                                                    <div className="form-field checkbox-field">
                                                                                        <label className="checkbox-label">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={item.gstIncluded}
                                                                                                onChange={(e) => handleItemChange(index, 'gstIncluded', e.target.checked)}
                                                                                            />
                                                                                            <span>GST Included</span>
                                                                                        </label>
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        {item.productId && (
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
                                                                        )}

                                                                        {item.productId && (
                                                                            <div className="item-info">
                                                                                <span className="info-badge">SKU: {item.sku}</span>
                                                                                <span className="info-badge">HSN: {item.hsnCode}</span>
                                                                                <span className="info-badge">Available: {getAvailableStock(item.productId)} units</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {/* Payment & Review Section */}
                                            {section.id === 'payment' && (
                                                <>
                                                    <div className="form-block">
                                                        <h3>
                                                            <CreditCard size={16} />
                                                            Payment Details
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Payment Method <span className="required">*</span></label>
                                                                <select
                                                                    name="paymentMethod"
                                                                    value={formData.paymentMethod}
                                                                    onChange={handleInputChange}
                                                                    className={errors.paymentMethod ? 'error' : ''}
                                                                >
                                                                    {PAYMENT_METHODS.map(method => (
                                                                        <option key={method.value} value={method.value}>
                                                                            {method.icon} {method.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>GST Type <span className="required">*</span></label>
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

                                                            <div className="form-field">
                                                                <label>Paid Amount (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    name="paidAmount"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={formData.paidAmount}
                                                                    onChange={handleInputChange}
                                                                    className={errors.paidAmount ? 'error' : ''}
                                                                    placeholder="Amount already paid"
                                                                />
                                                                {errors.paidAmount && <span className="error-text">{errors.paidAmount}</span>}
                                                            </div>

                                                            <div className="form-field">
                                                                <label>Shipping Charge (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    name="shippingCharge"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={formData.shippingCharge}
                                                                    onChange={handleInputChange}
                                                                    placeholder="Shipping cost"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="form-block">
                                                        <h3>
                                                            <Calendar size={16} />
                                                            Delivery Information
                                                        </h3>
                                                        <div className="form-grid">
                                                            <div className="form-field">
                                                                <label>Delivery Date</label>
                                                                <input
                                                                    type="date"
                                                                    name="deliveryDate"
                                                                    value={formData.deliveryDate}
                                                                    onChange={handleInputChange}
                                                                    min={new Date().toISOString().split('T')[0]}
                                                                />
                                                            </div>

                                                            <div className="form-field">
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

                                                            <div className="form-field span-2">
                                                                <label>Order Notes</label>
                                                                <textarea
                                                                    name="orderNotes"
                                                                    rows={3}
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
                                                            
                                                            <div className="total-row">
                                                                <span>Total Discount:</span>
                                                                <span className="discount">- ₹{calculateTotalDiscount().toFixed(2)}</span>
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
                        disabled={saving}
                        className="mobile-save-btn"
                    >
                        {saving ? (
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
                .create-order-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
                    font-family: ${appTheme.fonts.primary};
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

                /* ==================== MOBILE STEPS ==================== */
                .mobile-steps {
                    display: none;
                    margin-bottom: 20px;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .mobile-step {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: white;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 30px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .mobile-step.active {
                    background: ${appTheme.colors.primary};
                    border-color: ${appTheme.colors.primary};
                }

                .mobile-step.active .mobile-step-name {
                    color: white;
                }

                .mobile-step-icon {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .mobile-step-name {
                    font-size: 0.75rem;
                    font-weight: 500;
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

                @media (min-width: 1024px) {
                    .form-grid {
                        grid-template-columns: repeat(3, 1fr);
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

                /* ==================== TOGGLE ==================== */
                .toggle-field {
                    margin: 4px 0;
                }

                .toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                }

                .toggle input {
                    display: none;
                }

                .toggle-slider {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background: #cbd5e1;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }

                .toggle-slider::before {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .toggle input:checked + .toggle-slider {
                    background: ${appTheme.colors.primary};
                }

                .toggle input:checked + .toggle-slider::before {
                    left: 22px;
                }

                .toggle-label {
                    font-size: 0.875rem;
                    color: #334155;
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
                    border-radius: 8px;
                    font-size: 0.813rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-height: 36px;
                }

                .add-button:hover {
                    background: #2563eb;
                }

                /* ==================== ITEMS LIST ==================== */
                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .item-card {
                    background: #f8fafc;
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 8px;
                    padding: 16px;
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
                    color: #475569;
                }

                .remove-item-btn {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: ${appTheme.colors.error}10;
                    border: 1px solid ${appTheme.colors.error}20;
                    border-radius: 8px;
                    color: ${appTheme.colors.error};
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .remove-item-btn:hover {
                    background: ${appTheme.colors.error};
                    color: white;
                }

                .item-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 16px;
                }

                @media (min-width: 640px) {
                    .item-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                /* ==================== ITEM SUMMARY ==================== */
                .item-summary {
                    margin-top: 16px;
                    padding: 12px;
                    background: white;
                    border-radius: 8px;
                    border: 1px solid ${appTheme.colors.border};
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                    font-size: 0.813rem;
                    color: #64748b;
                }

                .summary-row.total {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid ${appTheme.colors.border};
                    font-weight: 600;
                    color: #0f172a;
                }

                .item-info {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                    flex-wrap: wrap;
                }

                .info-badge {
                    padding: 4px 8px;
                    background: ${appTheme.colors.background};
                    border: 1px solid ${appTheme.colors.border};
                    border-radius: 20px;
                    font-size: 0.625rem;
                    color: #64748b;
                }

                /* ==================== ORDER SUMMARY ==================== */
                .order-summary {
                    background: #eef2ff;
                    border: 1px solid ${appTheme.colors.primary}30;
                    border-radius: 8px;
                    padding: 20px;
                }

                .order-summary h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #0f172a;
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
                    color: #0f172a;
                }

                .summary-item-details {
                    display: flex;
                    gap: 16px;
                    margin-top: 4px;
                    font-size: 0.75rem;
                    color: #64748b;
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
                    color: #475569;
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
                    color: #0f172a;
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

                    .mobile-steps {
                        display: flex;
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

                    .add-button {
                        min-height: 44px;
                    }

                    .item-card {
                        padding: 12px;
                    }

                    .remove-item-btn {
                        width: 44px;
                        height: 44px;
                    }
                }

                @media (max-width: 480px) {
                    .main-content {
                        padding: 16px 16px 90px 16px;
                    }

                    .stats-grid {
                        display: none;
                    }

                    .item-info {
                        flex-direction: column;
                        gap: 4px;
                    }

                    .info-badge {
                        width: fit-content;
                    }

                    .summary-item-details {
                        flex-direction: column;
                        gap: 4px;
                    }
                }
            `}</style>
        </>
    );
};

export default CreateOrderPage;