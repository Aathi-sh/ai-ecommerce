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
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        console.error('Failed to fetch products:', data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
        <title>Create New Order | PosterPro</title>
        <meta name="description" content="Create a new order" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create a new customer order manually
            </p>
          </div>

          {/* Form */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.customerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer full name"
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter primary phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="secondaryPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="secondaryPhoneNumber"
                    name="secondaryPhoneNumber"
                    value={formData.secondaryPhoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.secondaryPhoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter secondary phone number"
                  />
                  {errors.secondaryPhoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.secondaryPhoneNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.pincode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter 6-digit pincode"
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address *
                  </label>
                  <textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    required
                    rows={3}
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter complete shipping address with door number, street, area, city, state"
                  />
                  {errors.shippingAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingAddress}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product *
                          </label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`item_${index}_product`] ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_product`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={item.productId ? getAvailableStock(item.productId) : 999}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                          )}
                          {item.productId && (
                            <p className="mt-1 text-xs text-gray-500">
                              Available: {getAvailableStock(item.productId)} units
                            </p>
                          )}
                        </div>

                        <div className="flex items-end space-x-2">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price
                            </label>
                            <div className="px-3 py-2 bg-white rounded-md border border-gray-300 font-medium">
                              ₹{item.price * item.quantity}
                            </div>
                          </div>
                          
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
                              title="Remove item"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {item.productName && (
                        <div className="mt-2 text-sm text-gray-600">
                          Selected: <strong>{item.productName}</strong> • Unit Price: ₹{item.price}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">Order Total</h4>
                    <p className="text-sm text-gray-600">Including all items and quantities</p>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ₹{calculateTotal()}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {formData.items.reduce((total, item) => total + item.quantity, 0)} items • {formData.items.length} product(s)
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Order...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateOrderPage;