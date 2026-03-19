// // app/super-admin/companies/create/page.js
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useSession } from 'next-auth/react';
// import {
//   Building2,
//   Mail,
//   Phone,
//   MapPin,
//   User,
//   Lock,
//   CreditCard,
//   Calendar,
//   AlertCircle,
//   CheckCircle2,
//   ArrowLeft,
//   Loader2,
//   Globe,
//   MapPinned,
//   Hash,
//   Briefcase,
//   Copy,
//   Eye,
//   EyeOff,
// } from 'lucide-react';

// export default function CreateCompanyPage() {
//   const router = useRouter();
//   const { data: session, status } = useSession();
  
//   // Form state
//   const [formData, setFormData] = useState({
//     // Company Details
//     companyName: '',
//     companyEmail: '',
//     companyPhone: '',
    
//     // Address
//     address: {
//       street: '',
//       city: '',
//       state: '',
//       pincode: '',
//       country: 'India',
//     },
    
//     // Tax (optional)
//     gstin: '',
//     pan: '',
    
//     // Admin Details
//     adminName: '',
//     adminEmail: '',
//     adminPhone: '',
//     adminPassword: '',
    
//     // Plan Details
//     plan: 'free',
//     expiryDate: '',
//     autoRenew: true,
//     paymentMethod: 'monthly',
    
//     // Optional
//     notes: '',
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
//   const [step, setStep] = useState(1); // 1: Company, 2: Admin, 3: Plan, 4: Review

//   // Form validation errors
//   const [errors, setErrors] = useState({});

//   // Check authentication
//   if (status === 'unauthenticated') {
//     router.push('/login');
//     return null;
//   }

//   if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
//     router.push('/dashboard');
//     return null;
//   }

//   const validateStep = () => {
//     const newErrors = {};

//     if (step === 1) {
//       // Company Details Validation
//       if (!formData.companyName.trim()) {
//         newErrors.companyName = 'Company name is required';
//       }
//       if (!formData.companyEmail.trim()) {
//         newErrors.companyEmail = 'Company email is required';
//       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
//         newErrors.companyEmail = 'Invalid email format';
//       }
//       if (!formData.companyPhone.trim()) {
//         newErrors.companyPhone = 'Company phone is required';
//       } else if (!/^\d{10,12}$/.test(formData.companyPhone.replace(/\D/g, ''))) {
//         newErrors.companyPhone = 'Phone must be 10-12 digits';
//       }
      
//       // Address validation
//       if (!formData.address.street.trim()) {
//         newErrors.street = 'Street address is required';
//       }
//       if (!formData.address.city.trim()) {
//         newErrors.city = 'City is required';
//       }
//       if (!formData.address.state.trim()) {
//         newErrors.state = 'State is required';
//       }
//       if (!formData.address.pincode.trim()) {
//         newErrors.pincode = 'Pincode is required';
//       } else if (!/^\d{6}$/.test(formData.address.pincode)) {
//         newErrors.pincode = 'Pincode must be 6 digits';
//       }

//       // Tax validation (optional)
//       if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
//         newErrors.gstin = 'Invalid GSTIN format';
//       }
//       if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
//         newErrors.pan = 'Invalid PAN format';
//       }
//     }

//     if (step === 2) {
//       // Admin Details Validation
//       if (!formData.adminName.trim()) {
//         newErrors.adminName = 'Admin name is required';
//       }
//       if (!formData.adminEmail.trim()) {
//         newErrors.adminEmail = 'Admin email is required';
//       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
//         newErrors.adminEmail = 'Invalid email format';
//       }
//       if (!formData.adminPhone.trim()) {
//         newErrors.adminPhone = 'Admin phone is required';
//       } else if (!/^\d{10,12}$/.test(formData.adminPhone.replace(/\D/g, ''))) {
//         newErrors.adminPhone = 'Phone must be 10-12 digits';
//       }
//       if (!formData.adminPassword) {
//         newErrors.adminPassword = 'Password is required';
//       } else if (formData.adminPassword.length < 6) {
//         newErrors.adminPassword = 'Password must be at least 6 characters';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (validateStep()) {
//       setStep(step + 1);
//     }
//   };

//   const handleBack = () => {
//     setStep(step - 1);
//     setErrors({});
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateStep()) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch('/api/companies', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to create company');
//       }

//       setSuccess(true);
//       setTimeout(() => {
//         router.push('/super-admin/companies');
//       }, 2000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
//           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CheckCircle2 className="w-8 h-8 text-green-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Created!</h2>
//           <p className="text-gray-600 mb-4">
//             The company has been created successfully. Redirecting to companies list...
//           </p>
//           <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
//         </div>
//       </div>
//     );
//   }

//   const steps = [
//     { number: 1, name: 'Company Details', icon: Building2 },
//     { number: 2, name: 'Admin Account', icon: User },
//     { number: 3, name: 'Plan & Subscription', icon: CreditCard },
//     { number: 4, name: 'Review', icon: CheckCircle2 },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8">
//           <button
//             onClick={() => router.back()}
//             className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
//           >
//             <ArrowLeft className="w-4 h-4 mr-1" />
//             Back to Companies
//           </button>
//           <h1 className="text-2xl font-bold text-gray-900">Create New Company</h1>
//           <p className="mt-1 text-sm text-gray-500">
//             Set up a new company with admin account and subscription plan
//           </p>
//         </div>

//         {/* Progress Steps */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             {steps.map((s, index) => (
//               <div key={s.number} className="flex items-center flex-1">
//                 <div className="relative">
//                   <div
//                     className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                       s.number < step
//                         ? 'bg-green-600 text-white'
//                         : s.number === step
//                         ? 'bg-indigo-600 text-white'
//                         : 'bg-gray-200 text-gray-600'
//                     }`}
//                   >
//                     {s.number < step ? (
//                       <CheckCircle2 className="w-5 h-5" />
//                     ) : (
//                       <s.icon className="w-5 h-5" />
//                     )}
//                   </div>
//                   <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
//                     {s.name}
//                   </span>
//                 </div>
//                 {index < steps.length - 1 && (
//                   <div
//                     className={`flex-1 h-1 mx-2 ${
//                       s.number < step ? 'bg-green-600' : 'bg-gray-200'
//                     }`}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
//             <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
//             <p className="text-sm text-red-600">{error}</p>
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200">
//           {/* Step 1: Company Details */}
//           {step === 1 && (
//             <div className="p-6 space-y-6">
//               <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
//                 Company Information
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Company Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.companyName}
//                     onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.companyName ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="Enter company name"
//                   />
//                   {errors.companyName && (
//                     <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Company Email <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="email"
//                     value={formData.companyEmail}
//                     onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.companyEmail ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="company@example.com"
//                   />
//                   {errors.companyEmail && (
//                     <p className="mt-1 text-xs text-red-600">{errors.companyEmail}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Company Phone <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="tel"
//                     value={formData.companyPhone}
//                     onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.companyPhone ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="9876543210"
//                   />
//                   {errors.companyPhone && (
//                     <p className="mt-1 text-xs text-red-600">{errors.companyPhone}</p>
//                   )}
//                 </div>
//               </div>

//               <h3 className="text-md font-medium text-gray-900 mt-4">Address</h3>
//               <div className="grid grid-cols-1 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Street Address <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.address.street}
//                     onChange={(e) => setFormData({
//                       ...formData,
//                       address: { ...formData.address, street: e.target.value }
//                     })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.street ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="123 Business Street"
//                   />
//                   {errors.street && (
//                     <p className="mt-1 text-xs text-red-600">{errors.street}</p>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       City <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.address.city}
//                       onChange={(e) => setFormData({
//                         ...formData,
//                         address: { ...formData.address, city: e.target.value }
//                       })}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                         errors.city ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       placeholder="Mumbai"
//                     />
//                     {errors.city && (
//                       <p className="mt-1 text-xs text-red-600">{errors.city}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       State <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.address.state}
//                       onChange={(e) => setFormData({
//                         ...formData,
//                         address: { ...formData.address, state: e.target.value }
//                       })}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                         errors.state ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       placeholder="Maharashtra"
//                     />
//                     {errors.state && (
//                       <p className="mt-1 text-xs text-red-600">{errors.state}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Pincode <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.address.pincode}
//                       onChange={(e) => setFormData({
//                         ...formData,
//                         address: { ...formData.address, pincode: e.target.value }
//                       })}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                         errors.pincode ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       placeholder="400001"
//                     />
//                     {errors.pincode && (
//                       <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Country
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.address.country}
//                       onChange={(e) => setFormData({
//                         ...formData,
//                         address: { ...formData.address, country: e.target.value }
//                       })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                       placeholder="India"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <h3 className="text-md font-medium text-gray-900 mt-4">Tax Information (Optional)</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     GSTIN
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.gstin}
//                     onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.gstin ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="27ABCDE1234F1Z5"
//                   />
//                   {errors.gstin && (
//                     <p className="mt-1 text-xs text-red-600">{errors.gstin}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     PAN
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.pan}
//                     onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.pan ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="ABCDE1234F"
//                   />
//                   {errors.pan && (
//                     <p className="mt-1 text-xs text-red-600">{errors.pan}</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Admin Details */}
//           {step === 2 && (
//             <div className="p-6 space-y-6">
//               <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <User className="w-5 h-5 mr-2 text-indigo-600" />
//                 Admin Account
//               </h2>
//               <p className="text-sm text-gray-500 mb-4">
//                 This person will be the company administrator and can log in immediately.
//               </p>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Full Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.adminName}
//                     onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.adminName ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="John Doe"
//                   />
//                   {errors.adminName && (
//                     <p className="mt-1 text-xs text-red-600">{errors.adminName}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Email <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="email"
//                     value={formData.adminEmail}
//                     onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.adminEmail ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="admin@company.com"
//                   />
//                   {errors.adminEmail && (
//                     <p className="mt-1 text-xs text-red-600">{errors.adminEmail}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Phone <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="tel"
//                     value={formData.adminPhone}
//                     onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
//                       errors.adminPhone ? 'border-red-500' : 'border-gray-300'
//                     }`}
//                     placeholder="9876543210"
//                   />
//                   {errors.adminPhone && (
//                     <p className="mt-1 text-xs text-red-600">{errors.adminPhone}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Password <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={formData.adminPassword}
//                       onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
//                       className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10 ${
//                         errors.adminPassword ? 'border-red-500' : 'border-gray-300'
//                       }`}
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
//                     >
//                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                     </button>
//                   </div>
//                   {errors.adminPassword && (
//                     <p className="mt-1 text-xs text-red-600">{errors.adminPassword}</p>
//                   )}
//                   <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Plan & Subscription */}
//           {step === 3 && (
//             <div className="p-6 space-y-6">
//               <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
//                 Plan & Subscription
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//                 {['free', 'basic', 'pro', 'enterprise'].map((plan) => (
//                   <div
//                     key={plan}
//                     onClick={() => setFormData({ ...formData, plan })}
//                     className={`border rounded-lg p-4 cursor-pointer transition-all ${
//                       formData.plan === plan
//                         ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
//                         : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <h3 className="font-semibold text-gray-900 capitalize">{plan}</h3>
//                       {formData.plan === plan && (
//                         <CheckCircle2 className="w-5 h-5 text-indigo-600" />
//                       )}
//                     </div>
//                     <ul className="text-xs text-gray-600 space-y-1">
//                       {plan === 'free' && (
//                         <>
//                           <li>• 3 users max</li>
//                           <li>• 100 products</li>
//                           <li>• Basic features</li>
//                         </>
//                       )}
//                       {plan === 'basic' && (
//                         <>
//                           <li>• 10 users max</li>
//                           <li>• 1000 products</li>
//                           <li>• Coupons enabled</li>
//                         </>
//                       )}
//                       {plan === 'pro' && (
//                         <>
//                           <li>• 50 users max</li>
//                           <li>• 5000 products</li>
//                           <li>• API access</li>
//                         </>
//                       )}
//                       {plan === 'enterprise' && (
//                         <>
//                           <li>• Unlimited users</li>
//                           <li>• 100k products</li>
//                           <li>• Custom domain</li>
//                         </>
//                       )}
//                     </ul>
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Expiry Date (Optional)
//                   </label>
//                   <input
//                     type="date"
//                     value={formData.expiryDate}
//                     onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Payment Method
//                   </label>
//                   <select
//                     value={formData.paymentMethod}
//                     onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   >
//                     <option value="monthly">Monthly</option>
//                     <option value="yearly">Yearly</option>
//                     <option value="lifetime">Lifetime</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="autoRenew"
//                   checked={formData.autoRenew}
//                   onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
//                   className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
//                 />
//                 <label htmlFor="autoRenew" className="ml-2 text-sm text-gray-700">
//                   Auto-renew subscription
//                 </label>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Notes (Optional)
//                 </label>
//                 <textarea
//                   value={formData.notes}
//                   onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                   rows={3}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//                   placeholder="Any additional notes about this company..."
//                 />
//               </div>
//             </div>
//           )}

//           {/* Step 4: Review */}
//           {step === 4 && (
//             <div className="p-6 space-y-6">
//               <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                 <CheckCircle2 className="w-5 h-5 mr-2 text-indigo-600" />
//                 Review & Confirm
//               </h2>

//               <div className="bg-gray-50 rounded-lg p-4 space-y-4">
//                 <div>
//                   <h3 className="font-medium text-gray-900 mb-2">Company Details</h3>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <span className="text-gray-600">Name:</span>
//                     <span className="font-medium">{formData.companyName}</span>
//                     <span className="text-gray-600">Email:</span>
//                     <span className="font-medium">{formData.companyEmail}</span>
//                     <span className="text-gray-600">Phone:</span>
//                     <span className="font-medium">{formData.companyPhone}</span>
//                     <span className="text-gray-600">Address:</span>
//                     <span className="font-medium">
//                       {formData.address.street}, {formData.address.city}, {formData.address.state} - {formData.address.pincode}
//                     </span>
//                     {formData.gstin && (
//                       <>
//                         <span className="text-gray-600">GSTIN:</span>
//                         <span className="font-medium">{formData.gstin}</span>
//                       </>
//                     )}
//                     {formData.pan && (
//                       <>
//                         <span className="text-gray-600">PAN:</span>
//                         <span className="font-medium">{formData.pan}</span>
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-200 pt-4">
//                   <h3 className="font-medium text-gray-900 mb-2">Admin Account</h3>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <span className="text-gray-600">Name:</span>
//                     <span className="font-medium">{formData.adminName}</span>
//                     <span className="text-gray-600">Email:</span>
//                     <span className="font-medium">{formData.adminEmail}</span>
//                     <span className="text-gray-600">Phone:</span>
//                     <span className="font-medium">{formData.adminPhone}</span>
//                   </div>
//                 </div>

//                 <div className="border-t border-gray-200 pt-4">
//                   <h3 className="font-medium text-gray-900 mb-2">Plan Details</h3>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <span className="text-gray-600">Plan:</span>
//                     <span className="font-medium capitalize">{formData.plan}</span>
//                     <span className="text-gray-600">Payment:</span>
//                     <span className="font-medium capitalize">{formData.paymentMethod}</span>
//                     <span className="text-gray-600">Auto-renew:</span>
//                     <span className="font-medium">{formData.autoRenew ? 'Yes' : 'No'}</span>
//                     {formData.expiryDate && (
//                       <>
//                         <span className="text-gray-600">Expires:</span>
//                         <span className="font-medium">{new Date(formData.expiryDate).toLocaleDateString()}</span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <p className="text-sm text-gray-500">
//                 By clicking Create Company, you confirm that all information is correct and you have permission to create this company.
//               </p>
//             </div>
//           )}

//           {/* Form Actions */}
//           <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-between">
//             {step > 1 ? (
//               <button
//                 type="button"
//                 onClick={handleBack}
//                 className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//               >
//                 Back
//               </button>
//             ) : (
//               <div></div>
//             )}
            
//             {step < 4 ? (
//               <button
//                 type="button"
//                 onClick={handleNext}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//               >
//                 Next
//               </button>
//             ) : (
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   'Create Company'
//                 )}
//               </button>
//             )}
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

















// app/super-admin/companies/create/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Lock,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Globe,
  MapPinned,
  Hash,
  Briefcase,
  Copy,
  Eye,
  EyeOff,
  Smartphone,
  Wifi,
  Plus,
  Trash2,
  MessageSquare,
  QrCode,
} from 'lucide-react';

export default function CreateCompanyPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Form state
  const [formData, setFormData] = useState({
    // Company Details
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    
    // WhatsApp Configuration - CRITICAL for multi-tenant
    whatsappNumber: '', // Primary WhatsApp number customers will message
    additionalWhatsAppNumbers: [], // Additional routing numbers
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    
    // Tax (optional)
    gstin: '',
    pan: '',
    
    // Admin Details
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    
    // Plan Details
    plan: 'free',
    expiryDate: '',
    autoRenew: true,
    paymentMethod: 'monthly',
    
    // Optional
    notes: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Company, 2: WhatsApp, 3: Admin, 4: Plan, 5: Review
  
  // New WhatsApp number input
  const [newWhatsAppNumber, setNewWhatsAppNumber] = useState('');
  const [newWhatsAppDesc, setNewWhatsAppDesc] = useState('');
  const [newWhatsAppPrimary, setNewWhatsAppPrimary] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Check authentication
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (status === 'authenticated' && (session?.user?.role !== 'admin' || session?.user?.adminType !== 'super')) {
    router.push('/dashboard');
    return null;
  }

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      // Company Details Validation
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!formData.companyEmail.trim()) {
        newErrors.companyEmail = 'Company email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
        newErrors.companyEmail = 'Invalid email format';
      }
      if (!formData.companyPhone.trim()) {
        newErrors.companyPhone = 'Company phone is required';
      } else if (!/^\d{10,12}$/.test(formData.companyPhone.replace(/\D/g, ''))) {
        newErrors.companyPhone = 'Phone must be 10-12 digits';
      }
      
      // Address validation
      if (!formData.address.street.trim()) {
        newErrors.street = 'Street address is required';
      }
      if (!formData.address.city.trim()) {
        newErrors.city = 'City is required';
      }
      if (!formData.address.state.trim()) {
        newErrors.state = 'State is required';
      }
      if (!formData.address.pincode.trim()) {
        newErrors.pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(formData.address.pincode)) {
        newErrors.pincode = 'Pincode must be 6 digits';
      }

      // Tax validation (optional)
      if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
        newErrors.gstin = 'Invalid GSTIN format';
      }
      if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
        newErrors.pan = 'Invalid PAN format';
      }
    }

    if (step === 2) {
      // WhatsApp Configuration Validation
      if (!formData.whatsappNumber.trim()) {
        newErrors.whatsappNumber = 'Primary WhatsApp number is required';
      } else if (!/^\d{10,12}$/.test(formData.whatsappNumber.replace(/\D/g, ''))) {
        newErrors.whatsappNumber = 'WhatsApp number must be 10-12 digits';
      }

      // Validate additional numbers if any
      formData.additionalWhatsAppNumbers.forEach((num, index) => {
        if (!/^\d{10,12}$/.test(num.number.replace(/\D/g, ''))) {
          newErrors[`whatsapp_${index}`] = `Invalid number format for ${num.number}`;
        }
      });
    }

    if (step === 3) {
      // Admin Details Validation
      if (!formData.adminName.trim()) {
        newErrors.adminName = 'Admin name is required';
      }
      if (!formData.adminEmail.trim()) {
        newErrors.adminEmail = 'Admin email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
        newErrors.adminEmail = 'Invalid email format';
      }
      if (!formData.adminPhone.trim()) {
        newErrors.adminPhone = 'Admin phone is required';
      } else if (!/^\d{10,12}$/.test(formData.adminPhone.replace(/\D/g, ''))) {
        newErrors.adminPhone = 'Phone must be 10-12 digits';
      }
      if (!formData.adminPassword) {
        newErrors.adminPassword = 'Password is required';
      } else if (formData.adminPassword.length < 6) {
        newErrors.adminPassword = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddWhatsAppNumber = () => {
    if (!newWhatsAppNumber.trim()) return;
    
    const cleanNumber = newWhatsAppNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10 || cleanNumber.length > 12) {
      alert('Please enter a valid 10-12 digit WhatsApp number');
      return;
    }

    setFormData({
      ...formData,
      additionalWhatsAppNumbers: [
        ...formData.additionalWhatsAppNumbers,
        {
          number: cleanNumber,
          description: newWhatsAppDesc || `WhatsApp number ${formData.additionalWhatsAppNumbers.length + 2}`,
          isPrimary: newWhatsAppPrimary,
        }
      ]
    });

    // Reset inputs
    setNewWhatsAppNumber('');
    setNewWhatsAppDesc('');
    setNewWhatsAppPrimary(false);
  };

  const handleRemoveWhatsAppNumber = (index) => {
    setFormData({
      ...formData,
      additionalWhatsAppNumbers: formData.additionalWhatsAppNumbers.filter((_, i) => i !== index)
    });
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      // Clean phone numbers before sending
      const submissionData = {
        ...formData,
        companyPhone: formData.companyPhone.replace(/\D/g, ''),
        adminPhone: formData.adminPhone.replace(/\D/g, ''),
        whatsappNumber: formData.whatsappNumber.replace(/\D/g, ''),
        additionalWhatsAppNumbers: formData.additionalWhatsAppNumbers.map(num => ({
          ...num,
          number: num.number.replace(/\D/g, '')
        }))
      };

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create company');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/super-admin/companies');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Created!</h2>
          <p className="text-gray-600 mb-4">
            WhatsApp number registered. Company admin can now connect their WhatsApp.
          </p>
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, name: 'Company Details', icon: Building2 },
    { number: 2, name: 'WhatsApp Setup', icon: Smartphone },
    { number: 3, name: 'Admin Account', icon: User },
    { number: 4, name: 'Plan', icon: CreditCard },
    { number: 5, name: 'Review', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Companies
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Company</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set up a new company with WhatsApp integration for multi-tenant messaging
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      s.number < step
                        ? 'bg-green-600 text-white'
                        : s.number === step
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s.number < step ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600 whitespace-nowrap">
                    {s.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s.number < step ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Step 1: Company Details */}
          {step === 1 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                Company Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.companyEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="company@example.com"
                  />
                  {errors.companyEmail && (
                    <p className="mt-1 text-xs text-red-600">{errors.companyEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.companyPhone}
                    onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.companyPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="9876543210"
                  />
                  {errors.companyPhone && (
                    <p className="mt-1 text-xs text-red-600">{errors.companyPhone}</p>
                  )}
                </div>
              </div>

              <h3 className="text-md font-medium text-gray-900 mt-4">Address</h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => setFormData({
                      ...formData,
                      address: { ...formData.address, street: e.target.value }
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Business Street"
                  />
                  {errors.street && (
                    <p className="mt-1 text-xs text-red-600">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Mumbai"
                    />
                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Maharashtra"
                    />
                    {errors.state && (
                      <p className="mt-1 text-xs text-red-600">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address.pincode}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, pincode: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.pincode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="400001"
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        address: { ...formData.address, country: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>

              <h3 className="text-md font-medium text-gray-900 mt-4">Tax Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.gstin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="27ABCDE1234F1Z5"
                  />
                  {errors.gstin && (
                    <p className="mt-1 text-xs text-red-600">{errors.gstin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PAN
                  </label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.pan ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ABCDE1234F"
                  />
                  {errors.pan && (
                    <p className="mt-1 text-xs text-red-600">{errors.pan}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: WhatsApp Configuration */}
          {step === 2 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Smartphone className="w-5 h-5 mr-2 text-indigo-600" />
                WhatsApp Configuration
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Configure WhatsApp numbers for this company. Customers will message these numbers to interact with the business.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Important: WhatsApp Routing</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      The primary WhatsApp number is what customers will message. Additional numbers can be used for different departments or purposes. Each company gets a separate WhatsApp session.
                    </p>
                  </div>
                </div>
              </div>

              {/* Primary WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="919876543210 (with country code)"
                  />
                </div>
                {errors.whatsappNumber && (
                  <p className="mt-1 text-xs text-red-600">{errors.whatsappNumber}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Include country code (e.g., 91 for India). This number will be used for company identification.
                </p>
              </div>

              {/* Additional WhatsApp Numbers */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Additional Routing Numbers</h3>
                
                {/* List of added numbers */}
                {formData.additionalWhatsAppNumbers.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.additionalWhatsAppNumbers.map((num, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Smartphone className="w-4 h-4 text-gray-500 mr-2" />
                          <div>
                            <span className="text-sm font-medium">{num.number}</span>
                            {num.description && (
                              <span className="text-xs text-gray-500 ml-2">({num.description})</span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWhatsAppNumber(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new number form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <input
                      type="tel"
                      value={newWhatsAppNumber}
                      onChange={(e) => setNewWhatsAppNumber(e.target.value)}
                      placeholder="WhatsApp number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <input
                      type="text"
                      value={newWhatsAppDesc}
                      onChange={(e) => setNewWhatsAppDesc(e.target.value)}
                      placeholder="Description (e.g., Support)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newWhatsAppPrimary}
                        onChange={(e) => setNewWhatsAppPrimary(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Make Primary</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddWhatsAppNumber}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Add additional WhatsApp numbers for different departments or purposes.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Admin Details */}
          {step === 3 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-600" />
                Admin Account
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                This person will be the company administrator and can log in to manage WhatsApp and settings.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.adminName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.adminName && (
                    <p className="mt-1 text-xs text-red-600">{errors.adminName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.adminEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="admin@company.com"
                  />
                  {errors.adminEmail && (
                    <p className="mt-1 text-xs text-red-600">{errors.adminEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.adminPhone}
                    onChange={(e) => setFormData({ ...formData, adminPhone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.adminPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="9876543210"
                  />
                  {errors.adminPhone && (
                    <p className="mt-1 text-xs text-red-600">{errors.adminPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 pr-10 ${
                        errors.adminPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.adminPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.adminPassword}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Plan & Subscription */}
          {step === 4 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                Plan & Subscription
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {['free', 'basic', 'pro', 'enterprise'].map((plan) => (
                  <div
                    key={plan}
                    onClick={() => setFormData({ ...formData, plan })}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.plan === plan
                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 capitalize">{plan}</h3>
                      {formData.plan === plan && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {plan === 'free' && (
                        <>
                          <li>• 3 users max</li>
                          <li>• 100 products</li>
                          <li>• 1 WhatsApp number</li>
                        </>
                      )}
                      {plan === 'basic' && (
                        <>
                          <li>• 10 users max</li>
                          <li>• 1000 products</li>
                          <li>• 3 WhatsApp numbers</li>
                        </>
                      )}
                      {plan === 'pro' && (
                        <>
                          <li>• 50 users max</li>
                          <li>• 5000 products</li>
                          <li>• 10 WhatsApp numbers</li>
                        </>
                      )}
                      {plan === 'enterprise' && (
                        <>
                          <li>• Unlimited users</li>
                          <li>• 100k products</li>
                          <li>• Unlimited WhatsApp numbers</li>
                        </>
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={formData.autoRenew}
                  onChange={(e) => setFormData({ ...formData, autoRenew: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="autoRenew" className="ml-2 text-sm text-gray-700">
                  Auto-renew subscription
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Any additional notes about this company..."
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-indigo-600" />
                Review & Confirm
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Company Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.companyName}</span>
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.companyEmail}</span>
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.companyPhone}</span>
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">
                      {formData.address.street}, {formData.address.city}, {formData.address.state} - {formData.address.pincode}
                    </span>
                    {formData.gstin && (
                      <>
                        <span className="text-gray-600">GSTIN:</span>
                        <span className="font-medium">{formData.gstin}</span>
                      </>
                    )}
                    {formData.pan && (
                      <>
                        <span className="text-gray-600">PAN:</span>
                        <span className="font-medium">{formData.pan}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">WhatsApp Configuration</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Smartphone className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Primary: {formData.whatsappNumber}</span>
                    </div>
                    {formData.additionalWhatsAppNumbers.length > 0 && (
                      <div className="ml-6 space-y-1">
                        <p className="text-xs text-gray-500">Additional numbers:</p>
                        {formData.additionalWhatsAppNumbers.map((num, idx) => (
                          <div key={idx} className="flex items-center text-sm">
                            <span className="text-gray-600 mr-2">•</span>
                            <span>{num.number}</span>
                            {num.description && (
                              <span className="text-xs text-gray-500 ml-2">({num.description})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Admin Account</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.adminName}</span>
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{formData.adminEmail}</span>
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.adminPhone}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Plan Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium capitalize">{formData.plan}</span>
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium capitalize">{formData.paymentMethod}</span>
                    <span className="text-gray-600">Auto-renew:</span>
                    <span className="font-medium">{formData.autoRenew ? 'Yes' : 'No'}</span>
                    {formData.expiryDate && (
                      <>
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-medium">{new Date(formData.expiryDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                By clicking Create Company, you confirm that all information is correct. The company admin will receive login credentials and can configure WhatsApp settings.
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Company'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}