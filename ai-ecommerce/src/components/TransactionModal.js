// components/TransactionModal.js
// PROFESSIONAL TRANSACTION DETAIL MODAL - Shows complete payment verification data
// Industry standard: Displays OCR results, extracted text, images, validation, fraud analysis

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

// Icons - Using heroicons or your preferred icon library
import {
    XMarkIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ShieldExclamationIcon,
    DocumentTextIcon,
    PhotoIcon,
    CurrencyRupeeIcon,
    IdentificationIcon,
    ClockIcon,
    CalendarIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClipboardDocumentIcon,
    PrinterIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    UserIcon,
    TagIcon,
    CubeIcon,
    TruckIcon,
    BanknotesIcon,
    CreditCardIcon,
    QrCodeIcon,
    GlobeAltIcon,
    FingerPrintIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon as ShieldExclamationIconSolid
} from '@heroicons/react/24/outline';

// ==================== STATUS CONFIGURATION ====================

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        icon: ClockIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        dotColor: 'bg-yellow-400'
    },
    processing: {
        label: 'Processing',
        icon: ArrowPathIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-400'
    },
    verified: {
        label: 'Verified',
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-400'
    },
    rejected: {
        label: 'Rejected',
        icon: XCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-400'
    },
    fraud: {
        label: 'Fraud Alert',
        icon: ShieldExclamationIcon,
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
        dotColor: 'bg-red-600'
    },
    manual_review: {
        label: 'Manual Review',
        icon: MagnifyingGlassIcon,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        dotColor: 'bg-purple-400'
    }
};

const RISK_CONFIG = {
    low: { 
        label: 'Low Risk', 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: ShieldCheckIcon
    },
    medium: { 
        label: 'Medium Risk', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: ExclamationTriangleIcon
    },
    high: { 
        label: 'High Risk', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: ShieldExclamationIcon
    },
    critical: { 
        label: 'Critical Risk', 
        color: 'text-red-600', 
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: ShieldExclamationIconSolid
    }
};

const MATCH_CONFIG = {
    exact: { 
        label: 'Exact Match', 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        icon: CheckCircleIcon 
    },
    close: { 
        label: 'Close Match', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50',
        icon: CheckCircleIcon 
    },
    near: { 
        label: 'Near Match', 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50',
        icon: ExclamationTriangleIcon 
    },
    far: { 
        label: 'Far Match', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-50',
        icon: XCircleIcon 
    },
    none: { 
        label: 'No Match', 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-50',
        icon: XCircleIcon 
    }
};

const ENGINE_CONFIG = {
    paddle: { 
        label: 'PaddleOCR', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50',
        icon: ComputerDesktopIcon 
    },
    easy: { 
        label: 'EasyOCR', 
        color: 'text-green-600', 
        bgColor: 'bg-green-50',
        icon: ComputerDesktopIcon 
    },
    both: { 
        label: 'Both Engines', 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-50',
        icon: ArrowPathIcon 
    },
    qr: { 
        label: 'QR Code', 
        color: 'text-indigo-600', 
        bgColor: 'bg-indigo-50',
        icon: QrCodeIcon 
    }
};

const PAYMENT_TYPE_CONFIG = {
    qr_code: { label: 'QR Code', icon: QrCodeIcon, color: 'text-indigo-600' },
    screenshot: { label: 'Screenshot', icon: PhotoIcon, color: 'text-blue-600' },
    upi_text: { label: 'UPI Text', icon: IdentificationIcon, color: 'text-green-600' },
    phone_number: { label: 'Phone Number', icon: DevicePhoneMobileIcon, color: 'text-purple-600' }
};

// ==================== MAIN COMPONENT ====================

export default function TransactionModal({ isOpen, onClose, transaction, onAction }) {
    const [activeTab, setActiveTab] = useState('ocr');
    const [showFullText, setShowFullText] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        extractedFields: true,
        rawText: true,
        validation: true,
        fraud: true,
        imageAnalysis: true
    });

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !transaction) return null;

    // ==================== DATA EXTRACTION ====================

    const status = transaction.status || 'pending';
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const StatusIcon = statusConfig.icon;

    const riskLevel = transaction.fraudAnalysis?.riskLevel || 'low';
    const riskConfig = RISK_CONFIG[riskLevel] || RISK_CONFIG.low;
    const RiskIcon = riskConfig.icon;

    const matchQuality = transaction.validationResults?.matchQuality || 'none';
    const matchConfig = MATCH_CONFIG[matchQuality] || MATCH_CONFIG.none;
    const MatchIcon = matchConfig.icon;

    const engine = transaction.metadata?.ocrEngine || 'paddle';
    const engineConfig = ENGINE_CONFIG[engine] || ENGINE_CONFIG.paddle;
    const EngineIcon = engineConfig.icon;

    const paymentType = transaction.metadata?.paymentType || 'screenshot';
    const paymentTypeConfig = PAYMENT_TYPE_CONFIG[paymentType] || PAYMENT_TYPE_CONFIG.screenshot;
    const PaymentTypeIcon = paymentTypeConfig.icon;

    // Extracted fields
    const extractedAmount = transaction.ocrAnalysis?.extractedAmount;
    const expectedAmount = transaction.orderDetails?.totalAmount;
    const amountDiff = expectedAmount && extractedAmount ? Math.abs(expectedAmount - extractedAmount) : 0;
    
    const upiId = transaction.ocrAnalysis?.extractedUPI || transaction.detectedPayment?.upiId;
    const matchedUpi = transaction.validationResults?.matchedUpiId;
    
    const transactionId = transaction.ocrAnalysis?.transactionId || transaction.detectedPayment?.transactionId;
    
    const extractedText = transaction.ocrAnalysis?.extractedText || transaction.ocrAnalysis?.rawText || '';
    const wordCount = transaction.ocrAnalysis?.wordCount || 0;
    const confidence = transaction.ocrAnalysis?.confidenceScore || transaction.validationResults?.confidenceScore || 0;
    
    const detectedTime = transaction.ocrAnalysis?.timestamp || transaction.detectedPayment?.timestamp;
    const timeValid = transaction.validationResults?.timeValid;
    const timeDiff = transaction.validationResults?.timeDifferenceMinutes;

    // Order details
    const orderItems = transaction.orderDetails?.items || [];
    const customerName = transaction.orderDetails?.customerName || transaction.customerName;
    const customerPhone = transaction.customerPhone;
    const orderNumber = transaction.orderNumber;

    // Toggle section
    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // ==================== RENDER TABS ====================

    const tabs = [
        { id: 'ocr', label: 'OCR Results', icon: DocumentTextIcon },
        { id: 'order', label: 'Order Details', icon: CubeIcon },
        { id: 'validation', label: 'Validation', icon: CheckCircleIcon },
        { id: 'fraud', label: 'Risk Analysis', icon: ShieldExclamationIcon }
    ];

    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        onClick={onClose}
                    />

                    {/* Modal Panel */}
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl">
                        
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
                                        <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            Payment Verification Details
                                        </h2>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-sm font-medium text-gray-700">
                                                Order #{orderNumber}
                                            </span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-sm text-gray-600">
                                                {customerPhone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                                    data-tooltip-id="close-tooltip"
                                    data-tooltip-content="Close"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Status Badges Row */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {/* Status Badge */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} mr-1.5`}></span>
                                    {statusConfig.label}
                                </span>

                                {/* Risk Badge */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${riskConfig.bgColor} ${riskConfig.color} border ${riskConfig.borderColor}`}>
                                    <RiskIcon className="h-3 w-3 mr-1" />
                                    {riskConfig.label}
                                </span>

                                {/* Match Badge */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${matchConfig.bgColor} ${matchConfig.color} border ${matchConfig.borderColor}`}>
                                    <MatchIcon className="h-3 w-3 mr-1" />
                                    {matchConfig.label}
                                </span>

                                {/* Engine Badge */}
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${engineConfig.bgColor} ${engineConfig.color} border ${engineConfig.borderColor}`}>
                                    <EngineIcon className="h-3 w-3 mr-1" />
                                    {engineConfig.label}
                                    {transaction.metadata?.backupUsed && (
                                        <span className="ml-1 text-xs opacity-75">+Backup</span>
                                    )}
                                </span>

                                {/* Payment Type Badge */}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                    <PaymentTypeIcon className="h-3 w-3 mr-1" />
                                    {paymentTypeConfig.label}
                                </span>

                                {/* Confidence Badge */}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    <span className="mr-1">🎯</span>
                                    Confidence: {confidence}%
                                </span>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 px-6">
                            <nav className="flex space-x-6" aria-label="Tabs">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                                                ${activeTab === tab.id
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }
                                            `}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="bg-gray-50 px-6 py-4 max-h-[60vh] overflow-y-auto">
                            
                            {/* ========== TAB 1: OCR RESULTS ========== */}
                            {activeTab === 'ocr' && (
                                <div className="space-y-4">
                                    {/* Extracted Fields Section */}
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('extractedFields')}
                                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                                                <span className="font-medium text-gray-900">Extracted Fields</span>
                                            </div>
                                            {expandedSections.extractedFields ? (
                                                <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                            )}
                                        </button>
                                        
                                        {expandedSections.extractedFields && (
                                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Amount Field */}
                                                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <CurrencyRupeeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Amount
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-400">
                                                                Conf: {transaction.ocrAnalysis?.extractedAmountConfidence || 0}%
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 flex items-baseline space-x-2">
                                                            <span className="text-lg font-semibold text-gray-900">
                                                                ₹{extractedAmount || 0}
                                                            </span>
                                                            {expectedAmount && (
                                                                <>
                                                                    <span className="text-sm text-gray-500">
                                                                        (Expected: ₹{expectedAmount})
                                                                    </span>
                                                                    {amountDiff > 0 && (
                                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                                            amountDiff <= 2 
                                                                                ? 'bg-green-50 text-green-700' 
                                                                                : 'bg-yellow-50 text-yellow-700'
                                                                        }`}>
                                                                            Diff: ₹{amountDiff}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* UPI ID Field */}
                                                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <IdentificationIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                UPI ID
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-400">
                                                                Conf: {transaction.ocrAnalysis?.extractedUPIConfidence || 0}%
                                                            </span>
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className="text-sm font-medium text-gray-900 break-all">
                                                                {upiId || 'Not detected'}
                                                            </span>
                                                            {matchedUpi && (
                                                                <span className="ml-2 text-xs text-green-600">
                                                                    ✓ Matched: {matchedUpi}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Transaction ID Field */}
                                                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Transaction ID
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-400">
                                                                Conf: {transaction.ocrAnalysis?.transactionIdConfidence || 0}%
                                                            </span>
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className="text-sm font-medium text-gray-900 break-all">
                                                                {transactionId || 'Not detected'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status Field */}
                                                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                    <CheckCircleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Payment Status
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-400">
                                                                Conf: {transaction.ocrAnalysis?.statusConfidence || 0}%
                                                            </span>
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className={`text-sm font-medium capitalize ${
                                                                transaction.ocrAnalysis?.status === 'success' 
                                                                    ? 'text-green-600' 
                                                                    : 'text-red-600'
                                                            }`}>
                                                                {transaction.ocrAnalysis?.status || 'Unknown'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Time Field */}
                                                {detectedTime && (
                                                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Transaction Time
                                                                </span>
                                                                <span className="text-xs font-medium text-gray-400">
                                                                    Conf: {transaction.ocrAnalysis?.timestampConfidence || 0}%
                                                                </span>
                                                            </div>
                                                            <div className="mt-1">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {new Date(detectedTime).toLocaleString('en-IN')}
                                                                </span>
                                                                {timeDiff !== undefined && (
                                                                    <span className={`ml-2 text-xs ${
                                                                        timeValid ? 'text-green-600' : 'text-red-600'
                                                                    }`}>
                                                                        ({timeDiff} min ago)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* App Name Field */}
                                                {transaction.ocrAnalysis?.appName && (
                                                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                                        <div className="flex-1">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Payment App
                                                            </span>
                                                            <div className="mt-1">
                                                                <span className="text-sm font-medium text-gray-900 capitalize">
                                                                    {transaction.ocrAnalysis.appName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Bank Name Field */}
                                                {transaction.ocrAnalysis?.bankName && (
                                                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                                        <div className="flex-1">
                                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Bank
                                                            </span>
                                                            <div className="mt-1">
                                                                <span className="text-sm font-medium text-gray-900 capitalize">
                                                                    {transaction.ocrAnalysis.bankName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Raw Extracted Text Section */}
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('rawText')}
                                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                                                <span className="font-medium text-gray-900">Extracted Text</span>
                                                <span className="text-xs text-gray-500">
                                                    ({wordCount} words, {extractedText.length} chars)
                                                </span>
                                            </div>
                                            {expandedSections.rawText ? (
                                                <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                            )}
                                        </button>
                                        
                                        {expandedSections.rawText && (
                                            <div className="p-4">
                                                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-700 whitespace-pre-wrap break-words max-h-60 overflow-y-auto border border-gray-200">
                                                    {showFullText 
                                                        ? extractedText 
                                                        : extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : '')
                                                    }
                                                </div>
                                                {extractedText.length > 500 && (
                                                    <button
                                                        onClick={() => setShowFullText(!showFullText)}
                                                        className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                    >
                                                        {showFullText ? 'Show less' : 'Show full text'}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Screenshot Preview Section */}
                                    {transaction.paymentProof?.imageData && (
                                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <PhotoIcon className="h-5 w-5 text-gray-600" />
                                                    <span className="font-medium text-gray-900">Payment Screenshot</span>
                                                </div>
                                                <button
                                                    onClick={() => setLightboxOpen(true)}
                                                    className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                    <span>View Full Screen</span>
                                                </button>
                                            </div>
                                            <div className="p-4 flex justify-center">
                                                <div className="relative w-full max-w-md h-64 cursor-pointer overflow-hidden rounded-lg border border-gray-200">
                                                    <img
                                                        src={`data:${transaction.paymentProof.mimeType || 'image/jpeg'};base64,${transaction.paymentProof.imageData}`}
                                                        alt="Payment Screenshot"
                                                        className="object-contain w-full h-full"
                                                        onClick={() => setLightboxOpen(true)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* OCR Engine Info */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            <ComputerDesktopIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-800">OCR Processing Info</h4>
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Primary Engine: <span className="font-medium">{engineConfig.label}</span>
                                                    {transaction.metadata?.backupEngine && (
                                                        <> | Backup: {transaction.metadata.backupEngine}</>
                                                    )}
                                                </p>
                                                <p className="text-xs text-blue-600">
                                                    Processing Time: {transaction.metadata?.processingTime || transaction.ocrAnalysis?.processingTime || 0}ms
                                                </p>
                                                {transaction.ocrAnalysis?.words && (
                                                    <p className="text-xs text-blue-600">
                                                        Words Detected: {transaction.ocrAnalysis.words.length}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ========== TAB 2: ORDER DETAILS ========== */}
                            {activeTab === 'order' && (
                                <div className="space-y-4">
                                    {/* Customer Information */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                            <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                                            Customer Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Name</p>
                                                <p className="text-sm font-medium text-gray-900">{customerName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="text-sm font-medium text-gray-900">{customerPhone || 'N/A'}</p>
                                            </div>
                                            {transaction.orderDetails?.customerEmail && (
                                                <div className="col-span-2">
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="text-sm font-medium text-gray-900">{transaction.orderDetails.customerEmail}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                            <CubeIcon className="h-4 w-4 mr-2 text-gray-500" />
                                            Order Items
                                        </h3>
                                        <div className="space-y-2">
                                            {orderItems.length > 0 ? (
                                                orderItems.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900">₹{item.totalAmount || item.price * item.quantity}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No items found</p>
                                            )}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                                                <span className="text-lg font-semibold text-gray-900">₹{transaction.orderDetails?.totalAmount || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    {transaction.orderDetails?.shippingAddress && (
                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                                <TruckIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                Shipping Address
                                            </h3>
                                            <p className="text-sm text-gray-700">
                                                {typeof transaction.orderDetails.shippingAddress === 'object'
                                                    ? `${transaction.orderDetails.shippingAddress.street || ''}, ${transaction.orderDetails.shippingAddress.city || ''}, ${transaction.orderDetails.shippingAddress.state || ''} - ${transaction.orderDetails.shippingAddress.pincode || ''}`
                                                    : transaction.orderDetails.shippingAddress
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ========== TAB 3: VALIDATION RESULTS ========== */}
                            {activeTab === 'validation' && (
                                <div className="space-y-4">
                                    {/* Amount Validation */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                            <CurrencyRupeeIcon className="h-4 w-4 mr-2 text-gray-500" />
                                            Amount Validation
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500">Expected</p>
                                                <p className="text-lg font-semibold text-gray-900">₹{expectedAmount || 0}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500">Detected</p>
                                                <p className="text-lg font-semibold text-gray-900">₹{extractedAmount || 0}</p>
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-xs text-gray-500">Difference</p>
                                                <p className={`text-lg font-semibold ${amountDiff <= 2 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ₹{amountDiff}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center">
                                            <span className="text-sm text-gray-600 mr-2">Match Quality:</span>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${matchConfig.bgColor} ${matchConfig.color}`}>
                                                <MatchIcon className="h-3 w-3 mr-1" />
                                                {matchConfig.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* UPI Validation */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                            <IdentificationIcon className="h-4 w-4 mr-2 text-gray-500" />
                                            UPI Validation
                                        </h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Detected UPI:</span>
                                                <span className="text-sm font-medium text-gray-900">{upiId || 'Not detected'}</span>
                                            </div>
                                            {matchedUpi && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Matched Company UPI:</span>
                                                    <span className="text-sm font-medium text-green-600">{matchedUpi}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center mt-2">
                                                <span className="text-sm text-gray-600 mr-2">Status:</span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    transaction.validationResults?.upiMatch 
                                                        ? 'bg-green-50 text-green-700' 
                                                        : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {transaction.validationResults?.upiMatch ? '✓ Valid' : '✗ Invalid'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Validation */}
                                    {detectedTime && (
                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                                <ClockIcon className="h-4 w-4 mr-2 text-gray-500" />
                                                Time Validation
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Detected Time</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date(detectedTime).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Current Time</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {new Date().toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center">
                                                <span className="text-sm text-gray-600 mr-2">Status:</span>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    timeValid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {timeValid ? '✓ Recent' : `✗ Old (${timeDiff} min ago)`}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Validation Errors/Warnings */}
                                    {transaction.validationResults?.validationErrors?.length > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {transaction.validationResults.validationErrors.map((error, idx) => (
                                                    <li key={idx} className="text-xs text-red-700">{error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {transaction.validationResults?.validationWarnings?.length > 0 && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-yellow-800 mb-2">Validation Warnings</h4>
                                            <ul className="list-disc list-inside space-y-1">
                                                {transaction.validationResults.validationWarnings.map((warning, idx) => (
                                                    <li key={idx} className="text-xs text-yellow-700">{warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ========== TAB 4: FRAUD ANALYSIS ========== */}
                            {activeTab === 'fraud' && (
                                <div className="space-y-4">
                                    {/* Risk Level */}
                                    <div className={`${riskConfig.bgColor} border ${riskConfig.borderColor} rounded-lg p-4`}>
                                        <div className="flex items-start space-x-3">
                                            <RiskIcon className={`h-6 w-6 ${riskConfig.color}`} />
                                            <div>
                                                <h3 className={`text-sm font-medium ${riskConfig.color}`}>
                                                    {riskConfig.label}
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Fraud Score: {transaction.fraudAnalysis?.fraudScore || 0}/100
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fraud Reasons */}
                                    {transaction.fraudAnalysis?.reasons?.length > 0 && (
                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Risk Factors</h4>
                                            <ul className="space-y-2">
                                                {transaction.fraudAnalysis.reasons.map((reason, idx) => (
                                                    <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                                                        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                        <span>{reason}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Fraud Flags */}
                                    {transaction.fraudAnalysis?.flags?.length > 0 && (
                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-3">Fraud Flags</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {transaction.fraudAnalysis.flags.map((flag, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                                                        {flag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Suspicious Indicators */}
                                    {transaction.fraudAnalysis?.isSuspicious && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2">
                                                <ShieldExclamationIconSolid className="h-5 w-5 text-red-600" />
                                                <span className="text-sm font-medium text-red-800">
                                                    This transaction is flagged as suspicious
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                    Verification ID: {transaction._id?.slice(-12)}
                                </span>
                                <button
                                    onClick={() => navigator.clipboard.writeText(transaction._id)}
                                    className="text-gray-400 hover:text-gray-600"
                                    data-tooltip-id="copy-tooltip"
                                    data-tooltip-content="Copy ID"
                                >
                                    <ClipboardDocumentIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="flex space-x-3">
                                {transaction.status !== 'verified' && (
                                    <button
                                        onClick={() => onAction('verify', transaction._id)}
                                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                                    >
                                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                                        Verify
                                    </button>
                                )}
                                {transaction.status !== 'rejected' && (
                                    <button
                                        onClick={() => onAction('reject', transaction._id)}
                                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                                    >
                                        <XCircleIcon className="h-4 w-4 mr-1.5" />
                                        Reject
                                    </button>
                                )}
                                {transaction.status !== 'fraud' && (
                                    <button
                                        onClick={() => onAction('fraud', transaction._id)}
                                        className="inline-flex items-center px-3 py-1.5 bg-red-800 text-white text-sm font-medium rounded-lg hover:bg-red-900"
                                    >
                                        <ShieldExclamationIcon className="h-4 w-4 mr-1.5" />
                                        Mark Fraud
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox for full-screen image */}
            {lightboxOpen && transaction.paymentProof?.imageData && (
                <Lightbox
                    mainSrc={`data:${transaction.paymentProof.mimeType || 'image/jpeg'};base64,${transaction.paymentProof.imageData}`}
                    onCloseRequest={() => setLightboxOpen(false)}
                    imageTitle={`Payment Screenshot - Order #${orderNumber}`}
                    imageCaption={`Customer: ${customerPhone} | Amount: ₹${extractedAmount || expectedAmount || 0}`}
                />
            )}

            {/* Tooltips */}
            <Tooltip id="close-tooltip" />
            <Tooltip id="copy-tooltip" />
        </>
    );
}