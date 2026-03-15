// utils/ocrDisplay.js
// PROFESSIONAL OCR DISPLAY UTILITIES - Reusable formatting functions
// Industry standard: Consistent display of OCR data across all dashboard components

/**
 * ==================== STATUS CONFIGURATIONS ====================
 * Centralized configurations for consistent display
 */

export const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        shortLabel: 'PND',
        icon: '⏳',
        iconComponent: 'ClockIcon',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        lightBg: 'bg-yellow-100',
        darkBg: 'bg-yellow-200',
        borderColor: 'border-yellow-200',
        dotColor: 'bg-yellow-400',
        progressColor: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        hoverColor: 'hover:bg-yellow-100',
        ringColor: 'ring-yellow-500',
        gradient: 'from-yellow-500 to-yellow-600'
    },
    processing: {
        label: 'Processing',
        shortLabel: 'PRC',
        icon: '🔄',
        iconComponent: 'ArrowPathIcon',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        lightBg: 'bg-blue-100',
        darkBg: 'bg-blue-200',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-400',
        progressColor: 'bg-blue-500',
        textColor: 'text-blue-700',
        hoverColor: 'hover:bg-blue-100',
        ringColor: 'ring-blue-500',
        gradient: 'from-blue-500 to-blue-600'
    },
    verified: {
        label: 'Verified',
        shortLabel: 'VRF',
        icon: '✅',
        iconComponent: 'CheckCircleIcon',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        lightBg: 'bg-green-100',
        darkBg: 'bg-green-200',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-400',
        progressColor: 'bg-green-500',
        textColor: 'text-green-700',
        hoverColor: 'hover:bg-green-100',
        ringColor: 'ring-green-500',
        gradient: 'from-green-500 to-green-600'
    },
    rejected: {
        label: 'Rejected',
        shortLabel: 'REJ',
        icon: '❌',
        iconComponent: 'XCircleIcon',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        lightBg: 'bg-red-100',
        darkBg: 'bg-red-200',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-400',
        progressColor: 'bg-red-500',
        textColor: 'text-red-700',
        hoverColor: 'hover:bg-red-100',
        ringColor: 'ring-red-500',
        gradient: 'from-red-500 to-red-600'
    },
    fraud: {
        label: 'Fraud Alert',
        shortLabel: 'FRD',
        icon: '🚨',
        iconComponent: 'ShieldExclamationIcon',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        lightBg: 'bg-red-200',
        darkBg: 'bg-red-300',
        borderColor: 'border-red-300',
        dotColor: 'bg-red-600',
        progressColor: 'bg-red-700',
        textColor: 'text-red-800',
        hoverColor: 'hover:bg-red-200',
        ringColor: 'ring-red-700',
        gradient: 'from-red-700 to-red-800'
    },
    manual_review: {
        label: 'Manual Review',
        shortLabel: 'MAN',
        icon: '👁️',
        iconComponent: 'MagnifyingGlassIcon',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        lightBg: 'bg-purple-100',
        darkBg: 'bg-purple-200',
        borderColor: 'border-purple-200',
        dotColor: 'bg-purple-400',
        progressColor: 'bg-purple-500',
        textColor: 'text-purple-700',
        hoverColor: 'hover:bg-purple-100',
        ringColor: 'ring-purple-500',
        gradient: 'from-purple-500 to-purple-600'
    }
};

export const RISK_CONFIG = {
    low: {
        label: 'Low Risk',
        shortLabel: 'LOW',
        icon: '🟢',
        iconComponent: 'ShieldCheckIcon',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        lightBg: 'bg-green-100',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-400',
        textColor: 'text-green-700',
        hoverColor: 'hover:bg-green-100',
        ringColor: 'ring-green-500',
        scoreRange: [0, 25],
        emoji: '✅'
    },
    medium: {
        label: 'Medium Risk',
        shortLabel: 'MED',
        icon: '🟡',
        iconComponent: 'ExclamationTriangleIcon',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        lightBg: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        dotColor: 'bg-yellow-400',
        textColor: 'text-yellow-700',
        hoverColor: 'hover:bg-yellow-100',
        ringColor: 'ring-yellow-500',
        scoreRange: [26, 50],
        emoji: '⚠️'
    },
    high: {
        label: 'High Risk',
        shortLabel: 'HGH',
        icon: '🟠',
        iconComponent: 'ExclamationTriangleIcon',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        lightBg: 'bg-orange-100',
        borderColor: 'border-orange-200',
        dotColor: 'bg-orange-400',
        textColor: 'text-orange-700',
        hoverColor: 'hover:bg-orange-100',
        ringColor: 'ring-orange-500',
        scoreRange: [51, 75],
        emoji: '🔴'
    },
    critical: {
        label: 'Critical Risk',
        shortLabel: 'CRT',
        icon: '🔴',
        iconComponent: 'ShieldExclamationIcon',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        lightBg: 'bg-red-100',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-400',
        textColor: 'text-red-700',
        hoverColor: 'hover:bg-red-100',
        ringColor: 'ring-red-500',
        scoreRange: [76, 100],
        emoji: '💀'
    }
};

export const MATCH_CONFIG = {
    exact: {
        label: 'Exact Match',
        shortLabel: 'EXACT',
        icon: '✓',
        iconComponent: 'CheckCircleIcon',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        lightBg: 'bg-green-100',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-400',
        textColor: 'text-green-700',
        hoverColor: 'hover:bg-green-100',
        ringColor: 'ring-green-500',
        tolerance: 0,
        emoji: '✅',
        description: 'Perfect match with expected amount'
    },
    close: {
        label: 'Close Match',
        shortLabel: 'CLOSE',
        icon: '~',
        iconComponent: 'CheckCircleIcon',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        lightBg: 'bg-blue-100',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-400',
        textColor: 'text-blue-700',
        hoverColor: 'hover:bg-blue-100',
        ringColor: 'ring-blue-500',
        tolerance: 2,
        emoji: '✓',
        description: 'Within ₹2 tolerance'
    },
    near: {
        label: 'Near Match',
        shortLabel: 'NEAR',
        icon: '≈',
        iconComponent: 'ExclamationTriangleIcon',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        lightBg: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        dotColor: 'bg-yellow-400',
        textColor: 'text-yellow-700',
        hoverColor: 'hover:bg-yellow-100',
        ringColor: 'ring-yellow-500',
        tolerance: 10,
        emoji: '⚠️',
        description: 'Within ₹10 tolerance'
    },
    far: {
        label: 'Far Match',
        shortLabel: 'FAR',
        icon: '≠',
        iconComponent: 'XCircleIcon',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        lightBg: 'bg-orange-100',
        borderColor: 'border-orange-200',
        dotColor: 'bg-orange-400',
        textColor: 'text-orange-700',
        hoverColor: 'hover:bg-orange-100',
        ringColor: 'ring-orange-500',
        tolerance: 20,
        emoji: '❌',
        description: 'Significant difference'
    },
    none: {
        label: 'No Match',
        shortLabel: 'NONE',
        icon: '✗',
        iconComponent: 'XCircleIcon',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        lightBg: 'bg-gray-100',
        borderColor: 'border-gray-200',
        dotColor: 'bg-gray-400',
        textColor: 'text-gray-700',
        hoverColor: 'hover:bg-gray-100',
        ringColor: 'ring-gray-500',
        tolerance: Infinity,
        emoji: '❓',
        description: 'Could not match with any order'
    }
};

export const ENGINE_CONFIG = {
    paddle: {
        label: 'PaddleOCR',
        shortLabel: 'PAD',
        icon: '🌊',
        iconComponent: 'ComputerDesktopIcon',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        lightBg: 'bg-blue-100',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-400',
        textColor: 'text-blue-700',
        hoverColor: 'hover:bg-blue-100',
        ringColor: 'ring-blue-500',
        description: 'Primary OCR engine (97% accuracy)',
        accuracy: 97,
        speed: '300ms'
    },
    easy: {
        label: 'EasyOCR',
        shortLabel: 'EASY',
        icon: '📝',
        iconComponent: 'ComputerDesktopIcon',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        lightBg: 'bg-green-100',
        borderColor: 'border-green-200',
        dotColor: 'bg-green-400',
        textColor: 'text-green-700',
        hoverColor: 'hover:bg-green-100',
        ringColor: 'ring-green-500',
        description: 'Backup OCR engine (92% accuracy)',
        accuracy: 92,
        speed: '200ms'
    },
    both: {
        label: 'Both Engines',
        shortLabel: 'DUAL',
        icon: '🔄',
        iconComponent: 'ArrowPathIcon',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        lightBg: 'bg-purple-100',
        borderColor: 'border-purple-200',
        dotColor: 'bg-purple-400',
        textColor: 'text-purple-700',
        hoverColor: 'hover:bg-purple-100',
        ringColor: 'ring-purple-500',
        description: 'Verified with both OCR engines',
        accuracy: 98,
        speed: '500ms'
    },
    qr: {
        label: 'QR Code',
        shortLabel: 'QR',
        icon: '📱',
        iconComponent: 'QrCodeIcon',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        lightBg: 'bg-indigo-100',
        borderColor: 'border-indigo-200',
        dotColor: 'bg-indigo-400',
        textColor: 'text-indigo-700',
        hoverColor: 'hover:bg-indigo-100',
        ringColor: 'ring-indigo-500',
        description: 'Direct QR code decoding',
        accuracy: 99,
        speed: '50ms'
    }
};

export const PAYMENT_TYPE_CONFIG = {
    qr_code: {
        label: 'QR Code',
        shortLabel: 'QR',
        icon: '📱',
        iconComponent: 'QrCodeIcon',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        description: 'Payment via QR code scan'
    },
    screenshot: {
        label: 'Screenshot',
        shortLabel: 'SS',
        icon: '📸',
        iconComponent: 'PhotoIcon',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        description: 'Payment screenshot analyzed with OCR'
    },
    upi_text: {
        label: 'UPI Text',
        shortLabel: 'UPI',
        icon: '💳',
        iconComponent: 'IdentificationIcon',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        description: 'UPI ID provided in text message'
    },
    phone_number: {
        label: 'Phone Number',
        shortLabel: 'PH',
        icon: '📞',
        iconComponent: 'DevicePhoneMobileIcon',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        description: 'Phone number provided for payment'
    }
};

export const CONFIDENCE_LEVELS = {
    excellent: { min: 90, label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50', icon: '🌟🌟🌟' },
    good: { min: 75, label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '🌟🌟' },
    fair: { min: 60, label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: '🌟' },
    poor: { min: 40, label: 'Poor', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: '⚠️' },
    bad: { min: 0, label: 'Unreliable', color: 'text-red-600', bgColor: 'bg-red-50', icon: '❌' }
};

/**
 * ==================== STATUS BADGE FUNCTIONS ====================
 */

/**
 * Get status badge configuration
 * @param {string} status - Status string
 * @returns {Object} Status configuration
 */
export function getStatusBadge(status) {
    return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
}

/**
 * Get status badge JSX with icon
 * @param {string} status - Status string
 * @param {boolean} showIcon - Whether to show icon
 * @param {boolean} short - Use short label
 * @returns {Object} Badge props and classes
 */
export function getStatusBadgeProps(status, showIcon = true, short = false) {
    const config = getStatusBadge(status);
    return {
        label: short ? config.shortLabel : config.label,
        icon: showIcon ? config.icon : null,
        className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} border ${config.borderColor}`,
        dotColor: config.dotColor,
        gradient: config.gradient
    };
}

/**
 * ==================== RISK BADGE FUNCTIONS ====================
 */

/**
 * Get risk badge configuration
 * @param {string} riskLevel - Risk level (low/medium/high/critical)
 * @returns {Object} Risk configuration
 */
export function getRiskBadge(riskLevel) {
    return RISK_CONFIG[riskLevel] || RISK_CONFIG.low;
}

/**
 * Get risk badge based on fraud score
 * @param {number} score - Fraud score (0-100)
 * @returns {Object} Risk configuration
 */
export function getRiskFromScore(score) {
    if (score <= 25) return RISK_CONFIG.low;
    if (score <= 50) return RISK_CONFIG.medium;
    if (score <= 75) return RISK_CONFIG.high;
    return RISK_CONFIG.critical;
}

/**
 * Get risk badge props
 * @param {string|number} risk - Risk level or fraud score
 * @returns {Object} Badge props and classes
 */
export function getRiskBadgeProps(risk) {
    const config = typeof risk === 'number' ? getRiskFromScore(risk) : getRiskBadge(risk);
    return {
        label: config.label,
        shortLabel: config.shortLabel,
        icon: config.icon,
        className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`,
        dotColor: config.dotColor,
        emoji: config.emoji
    };
}

/**
 * ==================== MATCH BADGE FUNCTIONS ====================
 */

/**
 * Get match badge configuration
 * @param {string} matchQuality - Match quality (exact/close/near/far/none)
 * @returns {Object} Match configuration
 */
export function getMatchBadge(matchQuality) {
    return MATCH_CONFIG[matchQuality] || MATCH_CONFIG.none;
}

/**
 * Get match quality from amount difference
 * @param {number} difference - Amount difference
 * @returns {Object} Match configuration
 */
export function getMatchFromDifference(difference) {
    if (difference === 0) return MATCH_CONFIG.exact;
    if (difference <= 2) return MATCH_CONFIG.close;
    if (difference <= 10) return MATCH_CONFIG.near;
    if (difference <= 20) return MATCH_CONFIG.far;
    return MATCH_CONFIG.none;
}

/**
 * Get match badge props
 * @param {string|number} match - Match quality or amount difference
 * @returns {Object} Badge props and classes
 */
export function getMatchBadgeProps(match) {
    const config = typeof match === 'number' ? getMatchFromDifference(match) : getMatchBadge(match);
    return {
        label: config.label,
        shortLabel: config.shortLabel,
        icon: config.icon,
        description: config.description,
        className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`,
        dotColor: config.dotColor,
        emoji: config.emoji
    };
}

/**
 * ==================== ENGINE BADGE FUNCTIONS ====================
 */

/**
 * Get engine badge configuration
 * @param {string} engine - Engine name (paddle/easy/both/qr)
 * @returns {Object} Engine configuration
 */
export function getEngineBadge(engine) {
    return ENGINE_CONFIG[engine] || ENGINE_CONFIG.paddle;
}

/**
 * Get engine badge props
 * @param {string} engine - Engine name
 * @param {boolean} showDetails - Show additional details
 * @returns {Object} Badge props and classes
 */
export function getEngineBadgeProps(engine, showDetails = false) {
    const config = getEngineBadge(engine);
    return {
        label: config.label,
        shortLabel: config.shortLabel,
        icon: config.icon,
        description: showDetails ? config.description : null,
        accuracy: showDetails ? config.accuracy : null,
        speed: showDetails ? config.speed : null,
        className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`,
        dotColor: config.dotColor
    };
}

/**
 * ==================== PAYMENT TYPE BADGE FUNCTIONS ====================
 */

/**
 * Get payment type configuration
 * @param {string} type - Payment type
 * @returns {Object} Payment type configuration
 */
export function getPaymentTypeBadge(type) {
    return PAYMENT_TYPE_CONFIG[type] || PAYMENT_TYPE_CONFIG.screenshot;
}

/**
 * Get payment type badge props
 * @param {string} type - Payment type
 * @returns {Object} Badge props and classes
 */
export function getPaymentTypeBadgeProps(type) {
    const config = getPaymentTypeBadge(type);
    return {
        label: config.label,
        shortLabel: config.shortLabel,
        icon: config.icon,
        description: config.description,
        className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`,
        dotColor: config.dotColor || 'bg-gray-400'
    };
}

/**
 * ==================== CONFIDENCE FORMATTING FUNCTIONS ====================
 */

/**
 * Get confidence level based on score
 * @param {number} score - Confidence score (0-100)
 * @returns {Object} Confidence level configuration
 */
export function getConfidenceLevel(score) {
    if (score >= 90) return CONFIDENCE_LEVELS.excellent;
    if (score >= 75) return CONFIDENCE_LEVELS.good;
    if (score >= 60) return CONFIDENCE_LEVELS.fair;
    if (score >= 40) return CONFIDENCE_LEVELS.poor;
    return CONFIDENCE_LEVELS.bad;
}

/**
 * Format confidence score with color and icon
 * @param {number} score - Confidence score (0-100)
 * @param {boolean} showIcon - Whether to show icon
 * @returns {Object} Formatted confidence object
 */
export function formatConfidence(score, showIcon = true) {
    const level = getConfidenceLevel(score);
    return {
        score: Math.round(score),
        level: level.label,
        color: level.color,
        bgColor: level.bgColor,
        icon: showIcon ? level.icon : null,
        className: `${level.color} font-medium`,
        badgeClass: `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${level.bgColor} ${level.color}`,
        progressColor: score >= 90 ? 'bg-green-500' : 
                      score >= 75 ? 'bg-blue-500' :
                      score >= 60 ? 'bg-yellow-500' :
                      score >= 40 ? 'bg-orange-500' : 'bg-red-500'
    };
}

/**
 * Get confidence progress bar props
 * @param {number} score - Confidence score
 * @returns {Object} Progress bar props
 */
export function getConfidenceProgress(score) {
    const rounded = Math.round(score);
    const level = getConfidenceLevel(score);
    return {
        width: `${rounded}%`,
        color: level.color,
        bgColor: level.bgColor,
        label: `${rounded}%`,
        className: `h-2 rounded-full ${level.color.replace('text', 'bg')}`
    };
}

/**
 * ==================== AMOUNT FORMATTING FUNCTIONS ====================
 */

/**
 * Format amount with ₹ symbol
 * @param {number} amount - Amount to format
 * @param {boolean} showSymbol - Show ₹ symbol
 * @returns {string} Formatted amount
 */
export function formatAmount(amount, showSymbol = true) {
    if (amount === null || amount === undefined) return showSymbol ? '₹0' : '0';
    const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
    return showSymbol ? `₹${formatted}` : formatted;
}

/**
 * Format amount difference with color
 * @param {number} expected - Expected amount
 * @param {number} detected - Detected amount
 * @returns {Object} Formatted difference
 */
export function formatAmountDifference(expected, detected) {
    if (!expected || !detected) {
        return { text: 'N/A', color: 'text-gray-500', className: '' };
    }
    const diff = Math.abs(expected - detected);
    const match = getMatchFromDifference(diff);
    return {
        diff,
        percent: expected ? ((diff / expected) * 100).toFixed(1) : 0,
        text: `₹${diff}`,
        color: match.color,
        className: match.color,
        badge: getMatchBadgeProps(diff)
    };
}

/**
 * ==================== PHONE NUMBER FORMATTING ====================
 */

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phone) {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        const number = cleaned.slice(2);
        return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return phone;
}

/**
 * Format phone number for WhatsApp
 * @param {string} phone - Phone number
 * @returns {string} WhatsApp formatted number
 */
export function formatWhatsAppNumber(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `91${cleaned}`;
    }
    return cleaned;
}

/**
 * ==================== DATE/TIME FORMATTING ====================
 */

/**
 * Format date in Indian format
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Include time
 * @returns {string} Formatted date
 */
export function formatIndianDate(date, includeTime = false) {
    if (!date) return 'N/A';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...(includeTime && {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
        };
        return d.toLocaleString('en-IN', options);
    } catch (error) {
        return 'Invalid Date';
    }
}

/**
 * Get time ago string
 * @param {string|Date} date - Date to compare
 * @returns {string} Time ago string
 */
export function getTimeAgo(date) {
    if (!date) return '';
    try {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return formatIndianDate(date);
    } catch (error) {
        return 'Invalid Date';
    }
}

/**
 * ==================== TEXT FORMATTING ====================
 */

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Highlight matching text
 * @param {string} text - Original text
 * @param {string} search - Search term
 * @param {string} highlightClass - CSS class for highlighting
 * @returns {string} HTML with highlights
 */
export function highlightText(text, search, highlightClass = 'bg-yellow-200') {
    if (!text || !search) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
}

/**
 * ==================== OCR DATA EXTRACTION ====================
 */

/**
 * Extract and format OCR fields from transaction
 * @param {Object} transaction - Transaction object
 * @returns {Object} Formatted OCR fields
 */
export function extractOcrFields(transaction) {
    const ocr = transaction.ocrAnalysis || {};
    const detected = transaction.detectedPayment || {};
    const validation = transaction.validationResults || {};
    
    return {
        amount: {
            value: ocr.extractedAmount || detected.amount,
            confidence: ocr.extractedAmountConfidence || validation.confidenceScore || 0,
            formatted: formatAmount(ocr.extractedAmount || detected.amount),
            expected: transaction.orderDetails?.totalAmount,
            match: validation.amountMatch || false,
            difference: validation.amountDifference || 0
        },
        upiId: {
            value: ocr.extractedUPI || detected.upiId,
            confidence: ocr.extractedUPIConfidence || 0,
            matched: validation.matchedUpiId,
            isValid: validation.upiMatch || false
        },
        transactionId: {
            value: ocr.transactionId || detected.transactionId,
            confidence: ocr.transactionIdConfidence || 0
        },
        status: {
            value: ocr.status || detected.status || 'unknown',
            confidence: ocr.statusConfidence || 0,
            isSuccess: (ocr.status || detected.status) === 'success'
        },
        timestamp: {
            value: ocr.timestamp || detected.timestamp,
            confidence: ocr.timestampConfidence || 0,
            formatted: formatIndianDate(ocr.timestamp || detected.timestamp, true),
            timeAgo: getTimeAgo(ocr.timestamp || detected.timestamp),
            isValid: validation.timeValid || false
        },
        appName: ocr.appName || detected.appName,
        bankName: ocr.bankName || detected.bankName,
        rawText: ocr.extractedText || ocr.rawText || '',
        wordCount: ocr.wordCount || 0,
        processingTime: ocr.processingTime || transaction.metadata?.processingTime || 0
    };
}

/**
 * Get validation summary text
 * @param {Object} transaction - Transaction object
 * @returns {Object} Validation summary
 */
export function getValidationSummary(transaction) {
    const validation = transaction.validationResults || {};
    const fields = extractOcrFields(transaction);
    
    const issues = [];
    const warnings = [];
    
    if (!fields.amount.match) {
        issues.push(`Amount mismatch: Expected ${fields.amount.formatted}, Found ${formatAmount(fields.amount.value)}`);
    }
    if (!fields.upiId.isValid) {
        issues.push('UPI ID not recognized');
    }
    if (!fields.status.isSuccess) {
        issues.push('Payment status not successful');
    }
    if (!fields.timestamp.isValid) {
        warnings.push(`Payment is ${fields.timestamp.timeAgo}`);
    }
    if (fields.amount.confidence < 70) {
        warnings.push(`Low confidence in amount detection (${fields.amount.confidence}%)`);
    }
    
    return {
        isValid: validation.amountMatch && validation.upiMatch && fields.status.isSuccess,
        issues,
        warnings,
        score: validation.confidenceScore || 0,
        matchQuality: validation.matchQuality || 'none'
    };
}

/**
 * Get fraud analysis summary
 * @param {Object} transaction - Transaction object
 * @returns {Object} Fraud summary
 */
export function getFraudSummary(transaction) {
    const fraud = transaction.fraudAnalysis || {};
    const risk = getRiskBadge(fraud.riskLevel);
    const fields = extractOcrFields(transaction);
    
    const reasons = fraud.reasons || [];
    const flags = fraud.flags || [];
    
    // Auto-detect fraud indicators
    if (fields.amount.confidence < 40) {
        reasons.push('Very low OCR confidence');
    }
    if (!fields.timestamp.isValid && fields.timestamp.timeAgo.includes('hour')) {
        reasons.push('Payment is too old');
    }
    if (fields.amount.difference > 100) {
        reasons.push(`Large amount difference (₹${fields.amount.difference})`);
    }
    
    return {
        riskLevel: fraud.riskLevel || 'low',
        riskConfig: risk,
        score: fraud.fraudScore || 0,
        isSuspicious: fraud.isSuspicious || false,
        reasons: [...new Set([...reasons, ...(fraud.reasons || [])])],
        flags: [...new Set([...flags, ...(fraud.flags || [])])],
        analysisPerformed: fraud.analysisPerformedAt || transaction.updatedAt
    };
}

/**
 * ==================== UI HELPER FUNCTIONS ====================
 */

/**
 * Get color classes for confidence score
 * @param {number} score - Confidence score
 * @returns {string} CSS classes
 */
export function getConfidenceColorClasses(score) {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
}

/**
 * Get gradient background based on confidence
 * @param {number} score - Confidence score
 * @returns {string} CSS gradient
 */
export function getConfidenceGradient(score) {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 75) return 'from-blue-500 to-blue-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    if (score >= 40) return 'from-orange-500 to-orange-600';
    return 'from-red-500 to-red-600';
}

/**
 * Get icon for field type
 * @param {string} field - Field name
 * @returns {string} Icon emoji
 */
export function getFieldIcon(field) {
    const icons = {
        amount: '💰',
        upiId: '💳',
        transactionId: '🔢',
        status: '✅',
        timestamp: '⏰',
        appName: '📱',
        bankName: '🏦',
        confidence: '🎯',
        match: '✓',
        risk: '⚠️'
    };
    return icons[field] || '📌';
}

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted size
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * ==================== EXPORT ALL CONFIGURATIONS ====================
 */

export default {
    // Configurations
    STATUS_CONFIG,
    RISK_CONFIG,
    MATCH_CONFIG,
    ENGINE_CONFIG,
    PAYMENT_TYPE_CONFIG,
    CONFIDENCE_LEVELS,
    
    // Badge functions
    getStatusBadge,
    getStatusBadgeProps,
    getRiskBadge,
    getRiskFromScore,
    getRiskBadgeProps,
    getMatchBadge,
    getMatchFromDifference,
    getMatchBadgeProps,
    getEngineBadge,
    getEngineBadgeProps,
    getPaymentTypeBadge,
    getPaymentTypeBadgeProps,
    
    // Confidence functions
    getConfidenceLevel,
    formatConfidence,
    getConfidenceProgress,
    getConfidenceColorClasses,
    getConfidenceGradient,
    
    // Amount functions
    formatAmount,
    formatAmountDifference,
    
    // Phone functions
    formatPhoneNumber,
    formatWhatsAppNumber,
    
    // Date functions
    formatIndianDate,
    getTimeAgo,
    
    // Text functions
    truncateText,
    highlightText,
    getFieldIcon,
    formatBytes,
    
    // OCR extraction
    extractOcrFields,
    getValidationSummary,
    getFraudSummary
};