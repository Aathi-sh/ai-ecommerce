"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const CreateOrderPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    secondaryPhoneNumber: '',
    shippingAddress: '',
    pincode: '',
    items: [{ productId: '', productName: '', quantity: 1, price: 0 }]
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        console.error('Failed to fetch products:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (formData.phoneNumber.replace(/\D/g, '').length < 10) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Secondary phone number validation (optional)
    if (formData.secondaryPhoneNumber.trim() && formData.secondaryPhoneNumber.replace(/\D/g, '').length < 10) {
      newErrors.secondaryPhoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Pincode validation
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Address validation
    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    } else if (formData.shippingAddress.trim().length < 10) {
      newErrors.shippingAddress = 'Please enter a complete shipping address';
    }

    // Items validation
    formData.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`item_${index}_product`] = 'Please select a product';
      }
      if (!item.quantity || item.quantity < 1) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be at least 1';
      }
      
      // Check stock availability
      const selectedProduct = products.find(p => p._id === item.productId);
      if (selectedProduct && item.quantity > selectedProduct.stock) {
        newErrors[`item_${index}_quantity`] = `Only ${selectedProduct.stock} units available`;
      }
    });

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
          price: selectedProduct.price
        };
        
        // Clear product error
        if (errors[`item_${index}_product`]) {
          setErrors(prev => ({
            ...prev,
            [`item_${index}_product`]: ''
          }));
        }
      }
    } else {
      updatedItems[index][field] = field === 'quantity' ? parseInt(value) || 0 : value;
      
      // Clear quantity error
      if (field === 'quantity' && errors[`item_${index}_quantity`]) {
        setErrors(prev => ({
          ...prev,
          [`item_${index}_quantity`]: ''
        }));
      }
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', productName: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: updatedItems
      }));

      // Remove related errors
      const newErrors = { ...errors };
      delete newErrors[`item_${index}_product`];
      delete newErrors[`item_${index}_quantity`];
      setErrors(newErrors);
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getAvailableStock = (productId) => {
    const product = products.find(p => p._id === productId);
    return product ? product.stock : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const orderData = {
        ...formData,
        orderNumber: orderNumber,
        totalPrice: calculateTotal(),
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      console.log('Creating order with data:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Order created successfully!');
        router.push('/admin/orders');
      } else {
        console.error('API Error:', data);
        alert(`Error creating order: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create New Order | LFMS</title>
        <meta name="description" content="Create a new order" />
      </Head>

      <div className="create-order-container">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Create New Order</h1>
          <p className="page-subtitle">
            Create a new customer order manually
          </p>
        </div>

        {/* Form */}
        <div className="form-card">
          <form onSubmit={handleSubmit} className="form-content">
            {/* Customer Information */}
            <div className="form-section">
              <h2 className="form-section-title">Customer Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className={`form-input ${errors.customerName ? 'input-error' : ''}`}
                    placeholder="Enter customer full name"
                  />
                  {errors.customerName && (
                    <p className="form-error">{errors.customerName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.phoneNumber ? 'input-error' : ''}`}
                    placeholder="Enter primary phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="form-error">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="secondaryPhoneNumber" className="form-label">
                    Secondary Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="secondaryPhoneNumber"
                    name="secondaryPhoneNumber"
                    value={formData.secondaryPhoneNumber}
                    onChange={handleInputChange}
                    className={`form-input ${errors.secondaryPhoneNumber ? 'input-error' : ''}`}
                    placeholder="Enter secondary phone number"
                  />
                  {errors.secondaryPhoneNumber && (
                    <p className="form-error">{errors.secondaryPhoneNumber}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="pincode" className="form-label">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    required
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`form-input ${errors.pincode ? 'input-error' : ''}`}
                    placeholder="Enter 6-digit pincode"
                  />
                  {errors.pincode && (
                    <p className="form-error">{errors.pincode}</p>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="shippingAddress" className="form-label">
                    Shipping Address *
                  </label>
                  <textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    required
                    rows={3}
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className={`form-textarea ${errors.shippingAddress ? 'input-error' : ''}`}
                    placeholder="Enter complete shipping address with door number, street, area, city, state"
                  />
                  {errors.shippingAddress && (
                    <p className="form-error">{errors.shippingAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="form-section">
              <div className="section-header">
                <h2 className="form-section-title">Order Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="add-button"
                >
                  <span className="button-icon">+</span>
                  Add Item
                </button>
              </div>

              <div className="items-container">
                {formData.items.map((item, index) => (
                  <div key={index} className="item-card">
                    <div className="item-grid">
                      <div className="item-group product-select">
                        <label className="form-label">
                          Product *
                        </label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          className={`form-select ${errors[`item_${index}_product`] ? 'input-error' : ''}`}
                          required
                        >
                          <option value="">Select a product</option>
                          {products.map(product => (
                            <option 
                              key={product._id} 
                              value={product._id}
                              disabled={product.stock === 0}
                            >
                              {product.productName} - ₹{product.price} 
                              {product.stock === 0 ? ' (Out of Stock)' : ` (Stock: ${product.stock})`}
                            </option>
                          ))}
                        </select>
                        {errors[`item_${index}_product`] && (
                          <p className="form-error">{errors[`item_${index}_product`]}</p>
                        )}
                      </div>

                      <div className="item-group quantity-input">
                        <label className="form-label">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={item.productId ? getAvailableStock(item.productId) : 999}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className={`form-input ${errors[`item_${index}_quantity`] ? 'input-error' : ''}`}
                          required
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="form-error">{errors[`item_${index}_quantity`]}</p>
                        )}
                        {item.productId && (
                          <p className="stock-info">
                            Available: {getAvailableStock(item.productId)} units
                          </p>
                        )}
                      </div>

                      <div className="item-group price-display">
                        <label className="form-label">
                          Price
                        </label>
                        <div className="price-box">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>

                      {formData.items.length > 1 && (
                        <div className="item-group remove-button">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="remove-btn"
                            title="Remove item"
                          >
                            <span className="remove-icon">×</span>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {item.productName && (
                      <div className="item-info">
                        Selected: <strong>{item.productName}</strong> • Unit Price: ₹{item.price}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-content">
                <div>
                  <h3 className="summary-title">Order Total</h3>
                  <p className="summary-subtitle">Including all items and quantities</p>
                </div>
                <div className="total-amount">
                  ₹{calculateTotal()}
                </div>
              </div>
              <div className="summary-details">
                {formData.items.reduce((total, item) => total + item.quantity, 0)} items • {formData.items.length} product(s)
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Order...
                  </>
                ) : (
                  'Create Order'
                )}
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
          /* Container Styles */
          .create-order-container {
            padding: 1.5rem;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
          }

          /* Page Header */
          .page-header {
            margin-bottom: 2rem;
          }

          .page-title {
            font-size: clamp(1.5rem, 3vw, 2rem);
            font-weight: bold;
            color: #1f2937;
            margin: 0;
          }

          .page-subtitle {
            margin-top: 0.5rem;
            color: #6b7280;
            font-size: 0.95rem;
          }

          /* Form Card */
          .form-card {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }

          .form-content {
            padding: 1.5rem;
          }

          /* Form Sections */
          .form-section {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
          }

          .form-section:last-child {
            border-bottom: none;
          }

          .form-section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1.5rem;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          /* Form Grid */
          .form-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
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

          .full-width {
            grid-column: 1 / -1;
          }

          /* Form Groups */
          .form-group {
            margin-bottom: 1rem;
          }

          .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            margin-bottom: 0.375rem;
          }

          /* Form Inputs */
          .form-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            transition: all 0.15s ease;
            background: white;
          }

          .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-textarea {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            transition: all 0.15s ease;
            background: white;
            resize: vertical;
            min-height: 80px;
          }

          .form-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .form-select {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            transition: all 0.15s ease;
            background: white;
            cursor: pointer;
          }

          .form-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .input-error {
            border-color: #ef4444;
          }

          .input-error:focus {
            border-color: #ef4444;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }

          /* Error Messages */
          .form-error {
            margin-top: 0.25rem;
            font-size: 0.75rem;
            color: #ef4444;
          }

          /* Add Button */
          .add-button {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            background: #10b981;
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.15s ease;
          }

          .add-button:hover {
            background: #059669;
          }

          .button-icon {
            font-size: 1rem;
            font-weight: bold;
          }

          /* Items Container */
          .items-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .item-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1rem;
          }

          .item-grid {
            display: grid;
            grid-template-columns: repeat(1, 1fr);
            gap: 1rem;
          }

          @media (min-width: 768px) {
            .item-grid {
              grid-template-columns: 2fr 1fr 1fr auto;
              align-items: end;
            }
          }

          .item-group {
            margin-bottom: 0;
          }

          .product-select {
            grid-column: 1 / -1;
          }

          @media (min-width: 768px) {
            .product-select {
              grid-column: span 1;
            }
          }

          .price-box {
            padding: 0.5rem 0.75rem;
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-weight: 500;
            color: #374151;
          }

          /* Remove Button */
          .remove-btn {
            width: 2.25rem;
            height: 2.25rem;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 0.375rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.15s ease;
            padding: 0;
          }

          .remove-btn:hover {
            background: #dc2626;
          }

          .remove-icon {
            font-size: 1.25rem;
            font-weight: bold;
            line-height: 1;
          }

          .remove-button {
            display: flex;
            align-items: flex-end;
            height: 100%;
          }

          .item-info {
            margin-top: 0.75rem;
            font-size: 0.875rem;
            color: #6b7280;
          }

          .stock-info {
            margin-top: 0.25rem;
            font-size: 0.75rem;
            color: #6b7280;
          }

          /* Order Summary */
          .order-summary {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 0.5rem;
            padding: 1rem;
            margin: 1.5rem 0;
          }

          .summary-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }

          .summary-title {
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
          }

          .summary-subtitle {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0.25rem 0 0;
          }

          .total-amount {
            font-size: 1.5rem;
            font-weight: bold;
            color: #1f2937;
          }

          .summary-details {
            font-size: 0.875rem;
            color: #6b7280;
          }

          /* Form Actions */
          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
          }

          .cancel-button {
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            background: white;
            color: #374151;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .cancel-button:hover {
            background: #f9fafb;
          }

          .cancel-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .submit-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1.5rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.15s ease;
          }

          .submit-button:hover {
            background: #2563eb;
          }

          .submit-button:disabled {
            background: #93c5fd;
            cursor: not-allowed;
          }

          /* Spinner */
          .spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Loading State */
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .loading {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          /* Mobile Optimizations */
          @media (max-width: 768px) {
            .create-order-container {
              padding: 1rem;
            }
            
            .form-content {
              padding: 1rem;
            }
            
            .form-actions {
              flex-direction: column-reverse;
            }
            
            .form-actions button {
              width: 100%;
            }
            
            .item-card {
              padding: 0.75rem;
            }
          }

          @media (max-width: 640px) {
            .form-grid {
              grid-template-columns: 1fr;
            }
            
            .section-header {
              flex-direction: column;
              align-items: stretch;
              gap: 1rem;
            }
            
            .add-button {
              align-self: flex-start;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default CreateOrderPage;