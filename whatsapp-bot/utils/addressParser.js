/**
 * Address Parser Utility
 * 
 * Parses combined address strings into structured components
 * Format expected: "Door No, Street, Area/Locality, City, State"
 * 
 * Features:
 * - Handles varying numbers of commas
 * - Extracts door number, street, area, city, state
 * - Provides validation and user-friendly error messages
 * - Fallback parsing for complex addresses
 */

// ==================== MAIN PARSING FUNCTION ====================

/**
 * Parse combined address string into components
 * 
 * @param {string} addressString - Combined address with commas
 * @returns {Object} Parsed address components
 * @throws {Error} If address format is invalid
 * 
 * @example
 * parseCombinedAddress("12, MG Road, Indiranagar, Bangalore, Karnataka")
 * // Returns:
 * // {
 * //   doorNumber: "12",
 * //   streetName: "MG Road",
 * //   areaLocality: "Indiranagar",
 * //   cityDistrict: "Bangalore",
 * //   state: "Karnataka",
 * //   fullAddress: "12, MG Road, Indiranagar, Bangalore, Karnataka"
 * // }
 */
function parseCombinedAddress(addressString) {
    // Input validation
    if (!addressString || typeof addressString !== 'string') {
        throw new Error('Invalid address: Address must be a non-empty string');
    }

    // Trim and clean the input
    const cleanedAddress = addressString.trim().replace(/\s+/g, ' ');
    
    if (cleanedAddress.length < 10) {
        throw new Error('Address is too short. Please provide complete address');
    }

    // Split by commas and trim each part
    const parts = cleanedAddress.split(',').map(part => part.trim());
    
    // Remove empty parts
    const validParts = parts.filter(part => part.length > 0);
    
    // Check minimum parts (door, street, area, city, state = 5 parts)
    if (validParts.length < 5) {
        throw new Error(
            `Address must include at least 5 parts separated by commas.\n` +
            `You provided ${validParts.length} part(s): ${validParts.join(', ')}`
        );
    }

    // Extract components based on number of parts
    let doorNumber, streetName, areaLocality, cityDistrict, state;
    
    if (validParts.length === 5) {
        // Simple case: exactly 5 parts
        [doorNumber, streetName, areaLocality, cityDistrict, state] = validParts;
    } 
    else if (validParts.length === 6) {
        // 6 parts: door, street, area, sub-area, city, state
        // Combine area and sub-area
        [doorNumber, streetName, areaLocality, cityDistrict, state] = [
            validParts[0],
            validParts[1],
            `${validParts[2]}, ${validParts[3]}`,
            validParts[4],
            validParts[5]
        ];
    }
    else if (validParts.length === 7) {
        // 7 parts: door, street, area, sub-area, landmark, city, state
        // Combine area, sub-area, and landmark
        [doorNumber, streetName, areaLocality, cityDistrict, state] = [
            validParts[0],
            validParts[1],
            `${validParts[2]}, ${validParts[3]}, ${validParts[4]}`,
            validParts[5],
            validParts[6]
        ];
    }
    else {
        // More than 7 parts: take first as door, last as state, second last as city
        // Combine everything in between as street + area
        doorNumber = validParts[0];
        state = validParts[validParts.length - 1];
        cityDistrict = validParts[validParts.length - 2];
        
        // Combine all middle parts
        const middleParts = validParts.slice(1, validParts.length - 2);
        streetName = middleParts[0] || '';
        areaLocality = middleParts.slice(1).join(', ') || streetName;
        
        // If no street name separate from area, duplicate
        if (middleParts.length === 1) {
            areaLocality = streetName;
        }
    }

    // Validate each component
    if (!doorNumber || doorNumber.length < 1) {
        throw new Error('Door/Flat number is missing or invalid');
    }
    
    if (!streetName || streetName.length < 2) {
        throw new Error('Street name is missing or too short');
    }
    
    if (!areaLocality || areaLocality.length < 2) {
        throw new Error('Area/Locality is missing or too short');
    }
    
    if (!cityDistrict || cityDistrict.length < 2) {
        throw new Error('City/District is missing or too short');
    }
    
    if (!state || state.length < 2) {
        throw new Error('State is missing or too short');
    }

    // Return parsed object
    return {
        doorNumber,
        streetName,
        areaLocality,
        cityDistrict,
        state,
        fullAddress: cleanedAddress,
        // Also return original parts for reference
        _raw: {
            original: addressString,
            cleaned: cleanedAddress,
            parts: validParts,
            partCount: validParts.length
        }
    };
}

// ==================== VALIDATION FUNCTIONS ====================

/**
 * Validate if a parsed address has all required fields
 * 
 * @param {Object} address - Parsed address object
 * @returns {boolean} True if all required fields are present
 */
function isValidAddress(address) {
    if (!address || typeof address !== 'object') return false;
    
    return !!(
        address.doorNumber && 
        address.streetName && 
        address.areaLocality && 
        address.cityDistrict && 
        address.state &&
        address.doorNumber.length >= 1 &&
        address.streetName.length >= 2 &&
        address.areaLocality.length >= 2 &&
        address.cityDistrict.length >= 2 &&
        address.state.length >= 2
    );
}

/**
 * Quick validation of address string format
 * 
 * @param {string} addressString - Address to validate
 * @returns {boolean} True if format looks correct
 */
function isValidAddressFormat(addressString) {
    if (!addressString || typeof addressString !== 'string') return false;
    
    const trimmed = addressString.trim();
    
    // Must have at least 3 commas
    const commaCount = (trimmed.match(/,/g) || []).length;
    if (commaCount < 4) return false; // Need at least 4 commas for 5 parts
    
    // Split and check each part has content
    const parts = trimmed.split(',').map(p => p.trim());
    const validParts = parts.filter(p => p.length > 0);
    
    return validParts.length >= 5;
}

// ==================== ERROR MESSAGES ====================

/**
 * Get user-friendly address format instructions
 * 
 * @returns {string} Formatted error message for users
 */
function getAddressFormatInstructions() {
    return (
        `❌ *Invalid Address Format*\n\n` +
        `Please enter your complete address in this format:\n\n` +
        `*Door No, Street, Area/Locality, City, State*\n\n` +
        `📝 *Examples:*\n` +
        `• 12, MG Road, Indiranagar, Bangalore, Karnataka\n` +
        `• 45/B, Park Street, Kolkata, West Bengal\n` +
        `• 7, Linking Road, Bandra West, Mumbai, Maharashtra\n\n` +
        `📍 *For apartments with landmarks:*\n` +
        `• A-101, Green Apartments, MG Road, Indiranagar, Bangalore, Karnataka\n\n` +
        `📌 *Important:*\n` +
        `• Separate each part with a comma\n` +
        `• Include door number, street, area, city, and state\n` +
        `• Do NOT include pincode here (will be asked separately)\n` +
        `• Minimum 5 parts separated by commas\n\n` +
        `📝 *Please try again:*`
    );
}

/**
 * Get success message with parsed address preview
 * 
 * @param {Object} parsed - Parsed address object
 * @returns {string} Formatted success message
 */
function getAddressSuccessMessage(parsed) {
    return (
        `✅ *Address Parsed Successfully*\n\n` +
        `📋 *Please verify:*\n` +
        `🏠 Door: ${parsed.doorNumber}\n` +
        `🛣️ Street: ${parsed.streetName}\n` +
        `📍 Area: ${parsed.areaLocality}\n` +
        `🏙️ City: ${parsed.cityDistrict}\n` +
        `🗺️ State: ${parsed.state}\n\n` +
        `📍 *Now enter your 6-digit pincode:*`
    );
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format address object back to string
 * 
 * @param {Object} address - Address object
 * @returns {string} Formatted address string
 */
function formatAddressFromObject(address) {
    if (!address) return '';
    
    const parts = [];
    if (address.doorNumber) parts.push(address.doorNumber);
    if (address.streetName) parts.push(address.streetName);
    if (address.areaLocality) parts.push(address.areaLocality);
    if (address.cityDistrict) parts.push(address.cityDistrict);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    
    return parts.join(', ');
}

/**
 * Try to fix common address format issues
 * 
 * @param {string} addressString - Raw address input
 * @returns {string} Fixed address string
 */
function fixCommonAddressIssues(addressString) {
    if (!addressString) return '';
    
    let fixed = addressString.trim();
    
    // Replace multiple spaces with single space
    fixed = fixed.replace(/\s+/g, ' ');
    
    // Ensure commas have spaces after them
    fixed = fixed.replace(/,\s*/g, ', ');
    
    // Remove trailing commas
    fixed = fixed.replace(/,+$/, '');
    
    // Capitalize first letter of each part (optional)
    const parts = fixed.split(',').map(part => {
        part = part.trim();
        if (part.length > 0) {
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        }
        return part;
    });
    
    return parts.join(', ');
}

// ==================== EXPORTS ====================

export {
    parseCombinedAddress,
    isValidAddress,
    isValidAddressFormat,
    getAddressFormatInstructions,
    getAddressSuccessMessage,
    formatAddressFromObject,
    fixCommonAddressIssues
};

// Also export as default for convenience
export default {
    parseCombinedAddress,
    isValidAddress,
    isValidAddressFormat,
    getAddressFormatInstructions,
    getAddressSuccessMessage,
    formatAddressFromObject,
    fixCommonAddressIssues
};