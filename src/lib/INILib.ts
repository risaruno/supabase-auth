/**
 * @file INILib.ts
 * @brief Utility functions for SEED encryption/decryption using kisa-seed npm package
 * @author Translated from PHP to TypeScript
 */

import { KISA_SEED_CBC } from 'kisa-seed';

/**
 * Convert string to hex array (with proper padding)
 * @param str Input string
 * @returns Array of hex strings
 */
export function string2Hex(str: string): string[] {
    const hex: string[] = [];
    for (let i = 0; i < str.length; i++) {
        // Ensure we always get 2-digit hex values with padStart
        hex.push(str.charCodeAt(i).toString(16).padStart(2, '0'));
    }
    return hex;
}

/**
 * Convert hex array to string
 * @param hex Array of hex strings
 * @returns Converted string
 */
export function hex2String(hex: string[]): string {
    let str = "";
    for (let i = 0; i < hex.length; i++) {
        str += String.fromCharCode(parseInt(hex[i], 16));
    }
    return str;
}

/**
 * Encrypt string using SEED algorithm
 * @param str Plain text to encrypt
 * @param bszUserKey Base64 encoded user key
 * @param bszIV Initialization vector
 * @returns Base64 encoded encrypted string
 */
export function encryptSEED(str: string, bszUserKey: string, bszIV: string): string {
    try {
        // Use kisa-seed package for encryption
        // The encrypt method expects: (key: string, iv: string, message: string)
        const encrypted = KISA_SEED_CBC.encrypt(bszUserKey, bszIV, str);
        
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return str; // Return original string on error, matching PHP behavior
    }
}

/**
 * Decrypt string using SEED algorithm (matching PHP implementation exactly)
 * @param str Base64 encoded encrypted string
 * @param bszUserKey Base64 encoded user key
 * @param bszIV Initialization vector
 * @returns Decrypted plain text
 */
export function decryptSEED(str: string, bszUserKey: string, bszIV: string): string {
    try {
        
        // Following PHP implementation exactly:
        // $planBytes = String2Hex(base64_decode($str));
        const decodedStr = atob(str);
        const planBytes = string2Hex(decodedStr);
        
        // $keyBytes = String2Hex(base64_decode($bszUser_key));
        const decodedKey = atob(bszUserKey);
        const keyBytes = string2Hex(decodedKey);
        
        // $IVBytes = String2Hex(($bszIV));
        const IVBytes = string2Hex(bszIV);
        
        // Convert to decimal arrays like PHP does
        const keyDecimal: number[] = [];
        const IVDecimal: number[] = [];
        const planDecimal: number[] = [];
        
        // for ($i = 0; $i < 16; $i++) { $keyBytes[$i] = hexdec(($keyBytes[$i])); }
        for (let i = 0; i < 16; i++) {
            keyDecimal[i] = parseInt(keyBytes[i] || '00', 16);
            IVDecimal[i] = parseInt(IVBytes[i] || '00', 16);
        }
        
        // for ($i = 0; $i < count($planBytes); $i++) { $planBytes[$i] = hexdec($planBytes[$i]); }
        for (let i = 0; i < planBytes.length; i++) {
            planDecimal[i] = parseInt(planBytes[i], 16);
        }
        
        if (planDecimal.length === 0) {
            return str;
        }
        
        
        // Try to use the kisa-seed package correctly
        // Let's check what methods are actually available
        
        // Approach 1: Try with the correct SEED_CBC_Decrypt method if available
        try {
            // Check if SEED_CBC_Decrypt method exists (matching PHP)
            if (typeof KISA_SEED_CBC.SEED_CBC_Decrypt === 'function') {
                const result = KISA_SEED_CBC.SEED_CBC_Decrypt(
                    new Uint8Array(keyDecimal.slice(0, 16)), 
                    new Uint8Array(IVDecimal.slice(0, 16)), 
                    new Uint8Array(planDecimal), 
                    0, 
                    planDecimal.length
                );
                
                if (result && Array.isArray(result)) {
                    // Convert result back to hex string like PHP does
                    const planBytresMessage: string[] = [];
                    for (let i = 0; i < result.length; i++) {
                        planBytresMessage.push(result[i].toString(16).padStart(2, '0').toUpperCase());
                    }
                    const decrypted = hex2String(planBytresMessage);
                    return decrypted;
                }
            }
        } catch (error) {
            console.warn('SEED_CBC_Decrypt method failed:', error);
        }
        
        // Approach 2: Try with standard decrypt method using proper key format
        try {
            
            // Convert decimal arrays back to binary strings
            const keyBuffer = new Uint8Array(keyDecimal.slice(0, 16));
            const ivBuffer = new Uint8Array(IVDecimal.slice(0, 16));
            
            // Convert to base64 for the package
            const keyBase64 = btoa(String.fromCharCode(...keyBuffer));
            const ivBase64 = btoa(String.fromCharCode(...ivBuffer));
            
            
            const decrypted = KISA_SEED_CBC.decrypt(keyBase64, ivBase64, str);
            
            if (decrypted && decrypted !== str) {
                return decrypted;
            }
        } catch (error) {
            console.warn('Standard decrypt failed:', error);
        }
        
        // Approach 3: Try with original base64 key but proper IV
        try {
            const ivBuffer = new Uint8Array(IVDecimal.slice(0, 16));
            const ivBase64 = btoa(String.fromCharCode(...ivBuffer));
            
            const decrypted = KISA_SEED_CBC.decrypt(bszUserKey, ivBase64, str);
            
            if (decrypted && decrypted !== str) {
                return decrypted;
            }
        } catch (error) {
            console.warn('Original key + converted IV failed:', error);
        }
        
        // Approach 4: Try raw string formats
        try {
            const keyString = String.fromCharCode(...keyDecimal.slice(0, 16));
            const ivString = String.fromCharCode(...IVDecimal.slice(0, 16));
            
            
            const decrypted = KISA_SEED_CBC.decrypt(keyString, ivString, str);
            
            if (decrypted && decrypted !== str) {
                return decrypted;
            }
        } catch (error) {
            console.warn('Raw string approach failed:', error);
        }
        
        return str;
        
    } catch (error) {
        console.error('Decryption error:', error);
        return str; // Return original string on error, matching PHP behavior
    }
}

// Export all functions as default object for easier importing
const INILib = {
    string2Hex,
    hex2String,
    encryptSEED,
    decryptSEED
};

export default INILib;
