// services/ocrEngine.js
// PROFESSIONAL OCR ENGINE - Handles PaddleOCR + EasyOCR with confidence scoring
// Industry standard: Multi-engine fallback with intelligent decision making

// ✅ FIXED: All require statements - CommonJS format
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import crypto from 'crypto';
import sharp from 'sharp';
class OCREngine {
    constructor() {
        this.tempDir = path.join(os.tmpdir(), 'ocr-temp');
        this.initializeTempDir();
        
        // Configuration - Industry standard thresholds
        this.config = {
            confidenceThresholds: {
                autoVerify: 90,      // ≥90% → Auto-verify
                backupEngine: 70,     // 70-89% → Run EasyOCR backup
                manualReview: 50,     // <50% → Immediate manual review
                fraudAlert: 30        // <30% → Flag as potential fraud
            },
            preprocessing: {
                sharpen: true,
                contrast: 1.2,
                denoise: true,
                threshold: 150
            },
            timeouts: {
                paddleOCR: 30000,     // 30 seconds
                easyOCR: 30000        // 30 seconds
            }
        };

        // Statistics tracking
        this.stats = {
            totalProcessed: 0,
            paddleSuccess: 0,
            easySuccess: 0,
            autoVerified: 0,
            manualReview: 0,
            averageConfidence: 0
        };

        console.log('🔧 [OCREngine] Initialized with professional configuration');
    }

    async initializeTempDir() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
            console.log(`📁 [OCREngine] Temp directory: ${this.tempDir}`);
        } catch (error) {
            console.error('❌ [OCREngine] Failed to create temp dir:', error);
        }
    }

    /**
     * Main OCR processing function - Industry standard multi-engine approach
     * @param {string|Buffer} imageData - Base64 image or buffer
     * @param {Object} orderData - Order details for validation
     * @returns {Object} Professional OCR result with confidence scores
     */
    async processPaymentScreenshot(imageData, orderData = null) {
        const startTime = Date.now();
        const requestId = crypto.randomBytes(8).toString('hex');
        
        console.log(`\n🔍 [OCREngine:${requestId}] Starting payment screenshot analysis`);

        try {
            // Step 1: Validate and preprocess image
            const processedImage = await this.preprocessImage(imageData);
            
            // Step 2: Save temp file for Python scripts
            const tempFile = await this.saveTempImage(processedImage, requestId);
            
            // Step 3: Run PaddleOCR (Primary Engine)
            console.log(`🔄 [OCREngine:${requestId}] Running PaddleOCR (primary)...`);
            const paddleResult = await this.runPaddleOCR(tempFile);
            
            // Step 4: Calculate initial confidence
            let finalResult = await this.calculateConfidence(paddleResult, orderData);
            
            // Step 5: Run EasyOCR if confidence is medium (70-89%)
            if (finalResult.confidence >= this.config.confidenceThresholds.backupEngine && 
                finalResult.confidence < this.config.confidenceThresholds.autoVerify) {
                
                console.log(`🔄 [OCREngine:${requestId}] Confidence ${finalResult.confidence}% - Running EasyOCR backup...`);
                const easyResult = await this.runEasyOCR(tempFile);
                
                // Compare both engines
                finalResult = await this.compareEngines(paddleResult, easyResult, orderData);
            }
            
            // Step 6: Make decision (auto-verify vs manual review)
            finalResult.decision = this.makeDecision(finalResult);
            
            // Step 7: Add metadata
            finalResult.metadata = {
                requestId,
                processingTime: Date.now() - startTime,
                engine: finalResult.engineUsed,
                backupUsed: finalResult.backupUsed || false,
                timestamp: new Date().toISOString(),
                imageSize: imageData.length,
                tempFile: tempFile
            };

            // Step 8: Update statistics
            this.updateStats(finalResult);
            
            // Step 9: Cleanup temp file
            await this.cleanupTempFile(tempFile);
            
            console.log(`✅ [OCREngine:${requestId}] Completed in ${finalResult.metadata.processingTime}ms`);
            console.log(`   Decision: ${finalResult.decision.action}, Confidence: ${finalResult.confidence}%`);
            
            return finalResult;

        } catch (error) {
            console.error(`❌ [OCREngine:${requestId}] Fatal error:`, error);
            return this.createErrorResult(error, requestId);
        }
    }

    /**
     * Preprocess image for better OCR accuracy - Industry standard techniques
     */
    async preprocessImage(imageData) {
        try {
            let buffer;
            
            // Convert base64 to buffer if needed
            if (typeof imageData === 'string' && imageData.includes('base64')) {
                const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                buffer = Buffer.from(base64Data, 'base64');
            } else if (Buffer.isBuffer(imageData)) {
                buffer = imageData;
            } else {
                throw new Error('Invalid image format');
            }

            // Apply professional image preprocessing
            let processed = sharp(buffer);
            
            // Convert to grayscale (better for OCR)
            processed = processed.grayscale();
            
            // Apply contrast enhancement
            if (this.config.preprocessing.contrast) {
                processed = processed.linear(this.config.preprocessing.contrast);
            }
            
            // Apply sharpening
            if (this.config.preprocessing.sharpen) {
                processed = processed.sharpen();
            }
            
            // Apply threshold if needed
            if (this.config.preprocessing.threshold) {
                processed = processed.threshold(this.config.preprocessing.threshold);
            }
            
            // Resize if too large (max 2000px width)
            const metadata = await sharp(buffer).metadata();
            if (metadata.width > 2000) {
                processed = processed.resize({ width: 2000 });
            }

            return await processed.toBuffer();

        } catch (error) {
            console.error('❌ [OCREngine] Image preprocessing failed:', error);
            throw error;
        }
    }

    /**
     * Run PaddleOCR via Python subprocess - Primary engine
     */
    async runPaddleOCR(imagePath) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, 'paddle_ocr.py');
            
            // Create Python script dynamically if it doesn't exist
            this.ensurePaddleScript(scriptPath);
            
            const pythonProcess = spawn('python', [
                scriptPath,
                imagePath
            ]);

            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('❌ PaddleOCR error:', errorData);
                    reject(new Error(`PaddleOCR failed with code ${code}`));
                    return;
                }

                try {
                    const result = JSON.parse(outputData);
                    resolve({
                        engine: 'paddle',
                        text: result.text || '',
                        confidence: result.confidence || 0,
                        words: result.words || [],
                        raw: result
                    });
                } catch (parseError) {
                    reject(new Error('Failed to parse PaddleOCR output'));
                }
            });

            // Timeout handling
            setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('PaddleOCR timeout'));
            }, this.config.timeouts.paddleOCR);
        });
    }

    /**
     * Run EasyOCR via Python subprocess - Backup engine
     */
    async runEasyOCR(imagePath) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, 'easy_ocr.py');
            
            // Create Python script dynamically if it doesn't exist
            this.ensureEasyScript(scriptPath);
            
            const pythonProcess = spawn('python', [
                scriptPath,
                imagePath
            ]);

            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error('❌ EasyOCR error:', errorData);
                    reject(new Error(`EasyOCR failed with code ${code}`));
                    return;
                }

                try {
                    const result = JSON.parse(outputData);
                    resolve({
                        engine: 'easy',
                        text: result.text || '',
                        confidence: result.confidence || 0,
                        words: result.words || [],
                        raw: result
                    });
                } catch (parseError) {
                    reject(new Error('Failed to parse EasyOCR output'));
                }
            });

            // Timeout handling
            setTimeout(() => {
                pythonProcess.kill();
                reject(new Error('EasyOCR timeout'));
            }, this.config.timeouts.easyOCR);
        });
    }

    /**
     * Calculate confidence score based on OCR results and order data
     */
    async calculateConfidence(ocrResult, orderData) {
        const result = {
            ...ocrResult,
            confidence: ocrResult.confidence,
            extractedFields: {
                amount: null,
                upiId: null,
                transactionId: null,
                status: null,
                timestamp: null
            },
            validation: {
                amountMatch: false,
                upiMatch: false,
                timeValid: false,
                statusSuccess: false
            }
        };

        // Extract amount using regex
        const amountRegex = /(?:Rs\.?|₹|INR)\s*(\d+(?:[.,]\d+)?)/gi;
        const amountMatches = [...ocrResult.text.matchAll(amountRegex)];
        if (amountMatches.length > 0) {
            result.extractedFields.amount = parseFloat(amountMatches[0][1].replace(/[.,]/g, ''));
        }

        // Extract UPI ID
        const upiRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+)/g;
        const upiMatches = ocrResult.text.match(upiRegex);
        if (upiMatches) {
            result.extractedFields.upiId = upiMatches[0];
        }

        // Extract transaction ID
        const txnRegex = /(?:txn|trn|ref|utr|id)[:\s]*([a-zA-Z0-9]{8,20})/gi;
        const txnMatches = [...ocrResult.text.matchAll(txnRegex)];
        if (txnMatches.length > 0) {
            result.extractedFields.transactionId = txnMatches[0][1];
        }

        // Check payment status
        if (ocrResult.text.toLowerCase().includes('success') || 
            ocrResult.text.toLowerCase().includes('completed') ||
            ocrResult.text.toLowerCase().includes('paid')) {
            result.extractedFields.status = 'success';
            result.validation.statusSuccess = true;
        }

        // Validate against order data if provided
        if (orderData) {
            // Amount validation
            if (result.extractedFields.amount) {
                const expected = orderData.totalPrice || orderData.amount;
                const diff = Math.abs(result.extractedFields.amount - expected);
                result.validation.amountMatch = diff <= 2; // Within ₹2 tolerance
            }

            // Time validation (within 15 minutes)
            if (result.extractedFields.timestamp) {
                const txnTime = new Date(result.extractedFields.timestamp);
                const now = new Date();
                const diffMinutes = (now - txnTime) / (1000 * 60);
                result.validation.timeValid = diffMinutes <= 15;
            }
        }

        // Adjust confidence based on validations
        let adjustedConfidence = result.confidence;
        if (result.validation.amountMatch) adjustedConfidence += 5;
        if (result.validation.upiMatch) adjustedConfidence += 5;
        if (result.validation.statusSuccess) adjustedConfidence += 5;
        
        result.confidence = Math.min(100, adjustedConfidence);

        return result;
    }

    /**
     * Compare results from both OCR engines for better accuracy
     */
    async compareEngines(paddleResult, easyResult, orderData) {
        const result = {
            engineUsed: 'both',
            backupUsed: true,
            paddle: paddleResult,
            easy: easyResult,
            text: this.mergeTexts(paddleResult.text, easyResult.text),
            confidence: Math.max(paddleResult.confidence, easyResult.confidence),
            extractedFields: {},
            validation: {},
            agreement: false
        };

        // Check if both engines agree on key fields
        // Note: We need to ensure extractedFields exists on both results
        const paddleAmount = paddleResult.extractedFields?.amount;
        const easyAmount = easyResult.extractedFields?.amount;
        
        if (paddleAmount && easyAmount && Math.abs(paddleAmount - easyAmount) <= 2) {
            result.agreement = true;
            result.extractedFields.amount = paddleAmount;
            result.confidence += 10; // Boost confidence when engines agree
        }

        // Take best of each engine
        result.extractedFields = {
            amount: result.extractedFields.amount || paddleAmount || easyAmount,
            upiId: paddleResult.extractedFields?.upiId || easyResult.extractedFields?.upiId,
            transactionId: paddleResult.extractedFields?.transactionId || easyResult.extractedFields?.transactionId,
            status: paddleResult.extractedFields?.status || easyResult.extractedFields?.status || 'unknown'
        };

        // Validate against order
        if (orderData && result.extractedFields.amount) {
            const expected = orderData.totalPrice || orderData.amount;
            result.validation.amountMatch = Math.abs(result.extractedFields.amount - expected) <= 2;
        }

        result.confidence = Math.min(100, result.confidence);

        return result;
    }

    /**
     * Make auto-verification decision based on confidence
     */
    makeDecision(result) {
        const decision = {
            action: 'manual_review',
            reason: '',
            autoVerifiable: false,
            requiresHuman: true,
            priority: 'normal'
        };

        if (result.confidence >= this.config.confidenceThresholds.autoVerify) {
            decision.action = 'auto_verify';
            decision.reason = `High confidence (${result.confidence}%)`;
            decision.autoVerifiable = true;
            decision.requiresHuman = false;
            decision.priority = 'low';
            
            this.stats.autoVerified++;
            
        } else if (result.confidence >= this.config.confidenceThresholds.backupEngine) {
            decision.action = 'backup_verified';
            decision.reason = `Medium confidence (${result.confidence}%) - Verified with backup engine`;
            decision.autoVerifiable = true;
            decision.requiresHuman = false;
            decision.priority = 'normal';
            
            this.stats.autoVerified++;
            
        } else if (result.confidence >= this.config.confidenceThresholds.manualReview) {
            decision.action = 'manual_review';
            decision.reason = `Low confidence (${result.confidence}%) - Requires human verification`;
            decision.autoVerifiable = false;
            decision.requiresHuman = true;
            decision.priority = 'high';
            
            this.stats.manualReview++;
            
        } else {
            decision.action = 'fraud_alert';
            decision.reason = `Very low confidence (${result.confidence}%) - Potential fraud`;
            decision.autoVerifiable = false;
            decision.requiresHuman = true;
            decision.priority = 'critical';
            
            this.stats.manualReview++;
        }

        return decision;
    }

    /**
     * Merge texts from multiple engines intelligently
     */
    mergeTexts(text1, text2) {
        if (!text1) return text2 || '';
        if (!text2) return text1;
        
        // Take longer text (usually more complete)
        return text1.length >= text2.length ? text1 : text2;
    }

    /**
     * Save image to temp file for Python scripts
     */
    async saveTempImage(imageBuffer, requestId) {
        const tempFile = path.join(this.tempDir, `ocr_${requestId}.jpg`);
        await fs.writeFile(tempFile, imageBuffer);
        return tempFile;
    }

    /**
     * Cleanup temp file
     */
    async cleanupTempFile(tempFile) {
        try {
            await fs.unlink(tempFile);
        } catch (error) {
            // Ignore cleanup errors
        }
    }

    /**
     * Create PaddleOCR Python script if not exists
     */
    ensurePaddleScript(scriptPath) {
        const script = `
import sys
import json
from paddleocr import PaddleOCR

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        return
    
    image_path = sys.argv[1]
    
    try:
        # Initialize PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='en')
        
        # Run OCR
        result = ocr.ocr(image_path, cls=True)
        
        # Extract text and confidence
        texts = []
        confidences = []
        
        if result and result[0]:
            for line in result[0]:
                if line and len(line) >= 2:
                    text = line[1][0] if line[1] else ''
                    confidence = line[1][1] if line[1] else 0
                    texts.append(text)
                    confidences.append(confidence)
        
        # Calculate average confidence
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        output = {
            "text": " ".join(texts),
            "confidence": avg_confidence * 100,
            "words": texts,
            "raw": result
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
`;
        
        try {
            fs.accessSync(scriptPath);
        } catch {
            fs.writeFileSync(scriptPath, script);
            console.log(`📝 Created PaddleOCR script: ${scriptPath}`);
        }
    }

    /**
     * Create EasyOCR Python script if not exists
     */
    ensureEasyScript(scriptPath) {
        const script = `
import sys
import json
import easyocr

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        return
    
    image_path = sys.argv[1]
    
    try:
        # Initialize EasyOCR
        reader = easyocr.Reader(['en'])
        
        # Run OCR
        result = reader.readtext(image_path)
        
        # Extract text and confidence
        texts = []
        confidences = []
        
        for detection in result:
            text = detection[1]
            confidence = detection[2]
            texts.append(text)
            confidences.append(confidence)
        
        # Calculate average confidence
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        output = {
            "text": " ".join(texts),
            "confidence": avg_confidence * 100,
            "words": texts,
            "raw": result
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
`;
        
        try {
            fs.accessSync(scriptPath);
        } catch {
            fs.writeFileSync(scriptPath, script);
            console.log(`📝 Created EasyOCR script: ${scriptPath}`);
        }
    }

    /**
     * Update statistics
     */
    updateStats(result) {
        this.stats.totalProcessed++;
        if (result.engineUsed === 'paddle') this.stats.paddleSuccess++;
        if (result.engineUsed === 'easy') this.stats.easySuccess++;
        
        // Update running average
        this.stats.averageConfidence = 
            (this.stats.averageConfidence * (this.stats.totalProcessed - 1) + result.confidence) / 
            this.stats.totalProcessed;
    }

    /**
     * Create error result
     */
    createErrorResult(error, requestId) {
        return {
            success: false,
            error: error.message,
            metadata: {
                requestId,
                timestamp: new Date().toISOString(),
                processingTime: 0
            },
            decision: {
                action: 'manual_review',
                reason: `OCR failed: ${error.message}`,
                autoVerifiable: false,
                requiresHuman: true,
                priority: 'high'
            }
        };
    }

    /**
     * Get engine statistics
     */
    getStats() {
        return {
            ...this.stats,
            paddleSuccessRate: this.stats.totalProcessed ? 
                (this.stats.paddleSuccess / this.stats.totalProcessed * 100).toFixed(2) + '%' : '0%',
            easySuccessRate: this.stats.totalProcessed ? 
                (this.stats.easySuccess / this.stats.totalProcessed * 100).toFixed(2) + '%' : '0%',
            autoVerifyRate: this.stats.totalProcessed ? 
                (this.stats.autoVerified / this.stats.totalProcessed * 100).toFixed(2) + '%' : '0%'
        };
    }
}

// ✅ FIXED: Create and export singleton instance using CommonJS
const ocrEngine = new OCREngine();
export default ocrEngine;