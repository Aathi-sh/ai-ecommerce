// import pkg from 'whatsapp-web.js';
// import apiService from "../../services/apiService.js";
// const { MessageMedia } = pkg;

// // User product sessions for pagination
// const productSessions = new Map();

// /**
//  * Levenshtein distance algorithm for fuzzy matching
//  */
// function levenshteinDistance(a, b) {
//     if (a.length === 0) return b.length;
//     if (b.length === 0) return a.length;

//     const matrix = [];
//     for (let i = 0; i <= b.length; i++) {
//         matrix[i] = [i];
//     }
//     for (let j = 0; j <= a.length; j++) {
//         matrix[0][j] = j;
//     }

//     for (let i = 1; i <= b.length; i++) {
//         for (let j = 1; j <= a.length; j++) {
//             if (b.charAt(i - 1) === a.charAt(j - 1)) {
//                 matrix[i][j] = matrix[i - 1][j - 1];
//             } else {
//                 matrix[i][j] = Math.min(
//                     matrix[i - 1][j - 1] + 1,
//                     matrix[i][j - 1] + 1,
//                     matrix[i - 1][j] + 1
//                 );
//             }
//         }
//     }

//     return matrix[b.length][a.length];
// }

// /**
//  * Enhanced search with fuzzy matching - NOW INCLUDES PRODUCT ID SEARCH
//  */
// function findSimilarProducts(products, searchTerm) {
//     const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 1);
//     const results = [];
    
//     products.forEach(product => {
//         const productName = product.productName.toLowerCase();
//         const productWords = productName.split(/\s+/);
//         const category = (product.category || '').toLowerCase();
//         const description = (product.description || '').toLowerCase();
//         const productId = (product._id || product.id || '').toString().toLowerCase();
        
//         let score = 0;
//         let matchedWords = [];
        
//         // FIRST: Check if search term is exactly a Product ID
//         if (productId === searchTerm.toLowerCase()) {
//             score += 1000; // Highest priority for exact ID match
//             matchedWords.push('Product ID Match');
//         }
//         // SECOND: Check if search term contains Product ID
//         else if (productId.includes(searchTerm.toLowerCase())) {
//             score += 500; // High priority for partial ID match
//             matchedWords.push('Product ID Partial Match');
//         }
//         // THIRD: Check for exact product name match
//         else if (productName.includes(searchTerm.toLowerCase())) {
//             score += 100;
//             matchedWords.push(searchTerm);
//         }
        
//         // FOURTH: Regular word-based search
//         searchWords.forEach(searchWord => {
//             if (productWords.some(word => word === searchWord)) {
//                 score += 50;
//                 matchedWords.push(searchWord);
//             }
//             else if (productWords.some(word => word.includes(searchWord))) {
//                 score += 30;
//                 matchedWords.push(searchWord);
//             }
//             else {
//                 productWords.forEach(productWord => {
//                     if (productWord.length > 2 && searchWord.length > 2) {
//                         const distance = levenshteinDistance(searchWord, productWord);
//                         const maxLength = Math.max(searchWord.length, productWord.length);
//                         const similarity = 1 - (distance / maxLength);
                        
//                         if (similarity > 0.7) {
//                             score += Math.floor(similarity * 20);
//                             matchedWords.push(searchWord);
//                         }
//                     }
//                 });
//             }
            
//             if (category.includes(searchWord)) {
//                 score += 25;
//             }
            
//             if (description.includes(searchWord)) {
//                 score += 10;
//             }
//         });
        
//         if (score > 0) {
//             results.push({
//                 product,
//                 score,
//                 matchedWords: [...new Set(matchedWords)],
//                 isExactMatch: productId === searchTerm.toLowerCase() || productName.includes(searchTerm.toLowerCase())
//             });
//         }
//     });
    
//     return results
//         .sort((a, b) => {
//             if (b.score !== a.score) return b.score - a.score;
//             return a.product.productName.localeCompare(b.product.productName);
//         })
//         .map(item => item.product);
// }

// /**
//  * Get search suggestions
//  */
// function getSearchSuggestions(products, searchTerm) {
//     const allWords = new Set();
    
//     products.forEach(product => {
//         const nameWords = product.productName.toLowerCase().split(/\s+/);
//         const categoryWords = (product.category || '').toLowerCase().split(/\s+/);
        
//         nameWords.forEach(word => {
//             if (word.length > 2) allWords.add(word);
//         });
        
//         categoryWords.forEach(word => {
//             if (word.length > 2) allWords.add(word);
//         });
//     });
    
//     const suggestions = Array.from(allWords)
//         .map(word => ({
//             word,
//             similarity: 1 - (levenshteinDistance(searchTerm, word) / Math.max(searchTerm.length, word.length))
//         }))
//         .filter(item => item.similarity > 0.5)
//         .sort((a, b) => b.similarity - a.similarity)
//         .slice(0, 5)
//         .map(item => `• "${item.word}"`)
//         .join('\n');
    
//     return suggestions || `• Check spelling\n• Try shorter words\n• Browse all products with *Products*`;
// }

// /**
//  * Direct Product ID lookup - for when user enters a Product ID directly
//  */
// async function handleDirectProductIdSearch(message, client, productId) {
//     try {
//         console.log(`🔍 Direct Product ID search: "${productId}"`);
        
//         const product = await apiService.getProductById(productId);
        
//         if (!product) {
//             console.log(`❌ No product found with ID: ${productId}`);
//             return false;
//         }

//         console.log(`✅ Product found by ID: ${product.productName}`);
        
//         // Send the product with image
//         await sendProductWithImage(message, client, product, `🔍 Product Found by ID:`);
        
//         await message.reply(
//             `🎯 *Perfect! Found the exact product you're looking for!*\n\n` +
//             `🛒 *To order this product:*\n` +
//             `Type *Order* and I'll guide you through the ordering process!\n\n` +
//             `💡 *Quick Order Process:*\n` +
//             `1. Type *Order*\n` +
//             `2. Enter this Product ID: ${productId}\n` +
//             `3. Choose quantity\n` +
//             `4. Provide shipping details\n` +
//             `5. Complete payment\n\n` +
//             `🎉 *Start now:* Type *Order*`
//         );
        
//         return true;
        
//     } catch (error) {
//         console.error('❌ Direct ID search error:', error);
//         return false;
//     }
// }

// /**
//  * ROBUST IMAGE HANDLER: Handles various image sizes and formats
//  */
// async function sendSingleImageWithDescription(message, imageUrl, productText, productName, productId) {
//     let retryCount = 0;
//     const maxRetries = 2;
    
//     while (retryCount <= maxRetries) {
//         try {
//             console.log(`🖼️ Loading image (attempt ${retryCount + 1}/${maxRetries + 1}): ${productName}`);
            
//             const fullImageUrl = apiService.getProductImageUrl(imageUrl);
//             console.log(`📸 Image URL: ${fullImageUrl}`);
            
//             // Enhanced media loading with better error handling
//             const media = await MessageMedia.fromUrl(fullImageUrl, {
//                 unsafeMime: true,
//                 filename: `product-${productId}.jpg`,
//                 requestOptions: {
//                     timeout: 15000, // Reduced timeout
//                     headers: {
//                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//                     }
//                 }
//             });
            
//             if (!media) {
//                 throw new Error('Media object is null');
//             }
            
//             console.log(`✅ Media loaded successfully: ${media.mimetype}, Size: ${media.data.length} bytes`);
            
//             // Send image with caption
//             await message.reply(media, null, { caption: productText });
//             console.log(`🎯 Single image delivered: ${productName}`);
//             return true;
            
//         } catch (error) {
//             retryCount++;
//             console.error(`❌ Image load failed (attempt ${retryCount}):`, error.message);
            
//             if (retryCount > maxRetries) {
//                 console.error(`💥 All image attempts failed for: ${productName}`);
                
//                 // Final fallback - send text with image link
//                 const fallbackText = productText + 
//                     `\n\n📸 *Image Available:* ${apiService.getProductImageUrl(imageUrl)}` +
//                     `\n💡 *Tip:* If image doesn't load, you can view it via the link above`;
                
//                 await message.reply(fallbackText);
//                 console.log(`📝 Text fallback sent with image link: ${productName}`);
//                 return false;
//             }
            
//             // Wait before retry
//             await new Promise(resolve => setTimeout(resolve, 1000));
//         }
//     }
// }

// /**
//  * Multiple images gallery handler
//  */
// async function sendMultipleImagesGallery(message, imageUrls, productText, productName, productId) {
//     try {
//         const imageCount = imageUrls.length;
//         console.log(`🔄 Creating gallery with ${imageCount} images for: ${productName}`);
        
//         let successfulImages = 0;
//         let failedImages = [];
        
//         // Send images first
//         for (let i = 0; i < imageCount; i++) {
//             try {
//                 const fullImageUrl = apiService.getProductImageUrl(imageUrls[i]);
//                 console.log(`🖼️ Loading gallery image ${i + 1}/${imageCount}`);
                
//                 const media = await MessageMedia.fromUrl(fullImageUrl, {
//                     unsafeMime: true,
//                     filename: `product-${productId}-${i + 1}.jpg`,
//                     requestOptions: { timeout: 15000 }
//                 });
                
//                 await message.reply(media);
//                 successfulImages++;
//                 console.log(`✅ Gallery image ${i + 1} sent`);
                
//                 // Brief pause between images
//                 if (i < imageCount - 1) {
//                     await new Promise(resolve => setTimeout(resolve, 500));
//                 }
                
//             } catch (imageError) {
//                 console.error(`❌ Gallery image ${i + 1} failed:`, imageError.message);
//                 failedImages.push(i + 1);
//             }
//         }

//         // Send description after images
//         await new Promise(resolve => setTimeout(resolve, 800));
        
//         let galleryText = productText;
        
//         if (successfulImages > 0) {
//             galleryText += `\n\n📸 *Image Gallery (${successfulImages}/${imageCount} images loaded)*`;
//             if (failedImages.length > 0) {
//                 galleryText += `\n⚠️ Some images failed to load`;
//             }
//         } else {
//             galleryText += `\n\n📸 *Images available at links below:*`;
//             imageUrls.forEach((url, index) => {
//                 galleryText += `\n• Image ${index + 1}: ${apiService.getProductImageUrl(url)}`;
//             });
//         }
        
//         await message.reply(galleryText);
//         console.log(`✅ Gallery completed: ${successfulImages} images + description`);
//         return successfulImages > 0;
        
//     } catch (error) {
//         console.error(`❌ Gallery creation failed:`, error);
//         await message.reply(productText);
//         return false;
//     }
// }

// /**
//  * ENHANCED SMART PRODUCT DISPLAY: Better image detection and fallback
//  */
// async function sendProductWithImage(message, client, product, title = '') {
//     try {
//         console.log(`\n🎯 PROCESSING PRODUCT: ${product.productName}`);
//         console.log(`📊 Product ID: ${product._id || product.id}`);
        
//         // Enhanced image detection
//         let productImages = [];
//         let imageSource = 'none';
        
//         if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
//             productImages = product.imageUrls.filter(url => url && url.trim() !== '');
//             imageSource = 'imageUrls';
//         } else if (product.imageUrl && product.imageUrl.trim() !== '') {
//             productImages = [product.imageUrl];
//             imageSource = 'imageUrl';
//         }
        
//         const imageCount = productImages.length;
//         console.log(`🖼️ Images detected: ${imageCount} (source: ${imageSource})`);
        
//         // Create product description
//         const productText = 
//             `${title ? title + '\n\n' : ''}` +
//             `🆔 *Product ID:* ${product._id || product.id}\n` +
//             `*${product.productName}*\n\n` +
//             `💰 *Price:* ₹${product.price}\n` +
//             `📦 *Stock:* ${product.stock} available\n` +
//             `🏷️ *Category:* ${product.category || 'General'}\n` +
//             `📝 *Description:* ${product.description || 'Premium quality product'}\n` +
//             (product.options ? `⚙️ *Options:* ${product.options}\n` : '') +
//             `\n────────────────────\n` +
//             `🛒 *Ready to order?* Type *Order* to begin!`;

//         // Handle no images case
//         if (imageCount === 0) {
//             console.log(`📝 No valid images found, sending text only`);
//             await message.reply(productText);
//             return;
//         }

//         console.log(`🎯 Using ${imageCount === 1 ? 'single image' : 'gallery'} strategy`);
        
//         // Choose strategy based on image count
//         if (imageCount === 1) {
//             await sendSingleImageWithDescription(
//                 message, 
//                 productImages[0], 
//                 productText, 
//                 product.productName, 
//                 product._id || product.id
//             );
//         } else {
//             await sendMultipleImagesGallery(
//                 message, 
//                 productImages, 
//                 productText, 
//                 product.productName, 
//                 product._id || product.id
//             );
//         }

//     } catch (error) {
//         console.error(`💥 CRITICAL ERROR in product display:`, error);
//         await sendProductFallback(message, product, title);
//     }
// }

// /**
//  * Reliable fallback function
//  */
// async function sendProductFallback(message, product, title = '') {
//     try {
//         const productText = 
//             `${title ? title + '\n\n' : ''}` +
//             `🆔 *Product ID:* ${product._id || product.id}\n` +
//             `*${product.productName}*\n\n` +
//             `💰 Price: ₹${product.price}\n` +
//             `📦 Stock: ${product.stock} available\n` +
//             `🏷️ Category: ${product.category || 'General'}\n` +
//             `📝 Description: ${product.description || 'Premium quality product'}\n` +
//             (product.imageUrl ? `📸 Image available at: ${apiService.getProductImageUrl(product.imageUrl)}\n` : '') +
//             `\n🛒 Type *Order* to purchase!`;
            
//         await message.reply(productText);
//         console.log(`🔄 Fallback text sent: ${product.productName}`);
        
//     } catch (error) {
//         console.error('❌ Fallback failed:', error);
//         // Ultimate minimal fallback
//         await message.reply(
//             `🛍️ *${product.productName}*\n` +
//             `💰 ₹${product.price} | 📦 ${product.stock}\n` +
//             `🛒 Type *Order* to buy!`
//         );
//     }
// }

// /**
//  * Main products handler
//  */
// export async function handleProducts(message, client) { 
//     try {
//         const userMessage = message.body.trim();
//         const from = message.from;
//         const lowerMessage = userMessage.toLowerCase();
        
//         console.log('🔄 Starting handleProducts...');
        
//         // Get products with debugging
//         const products = await apiService.getProducts();
//         console.log('📦 Products from API:', products);
//         console.log('🔢 Number of products:', products.length);
//         console.log('📊 Products type:', typeof products);
        
//         if (products && products.length > 0) {
//             console.log('🎯 First product sample:', {
//                 id: products[0]._id,
//                 name: products[0].productName,
//                 price: products[0].price,
//                 stock: products[0].stock
//             });
//         }

//         // Handle search functionality
//         if (lowerMessage.startsWith('products ') || lowerMessage.startsWith('product ')) {
//             const searchTerm = userMessage.replace(/^(products?)\s+/i, '').trim();
//             if (searchTerm.length > 0) {
//                 return await handleProductSearch(message, client, searchTerm);
//             }
//         }

//         // Handle pagination commands
//         if (lowerMessage === 'next' || lowerMessage === 'more' || lowerMessage === 'more products') {
//             return await handleNextPage(message, client);
//         }
        
//         if (lowerMessage === 'prev' || lowerMessage === 'previous' || lowerMessage === 'back') {
//             return await handlePrevPage(message, client);
//         }

//         // Default products listing with pagination
//         return await showProductsPage(message, client, 0);

//     } catch (error) {
//         console.error('❌ Error showing products:', error);
//         await message.reply('❌ Error loading products. Please try again.');
//     }
// }

// /**
//  * Enhanced direct product search with smart matching AND PRODUCT ID SUPPORT
//  */
// export async function handleDirectProductSearch(message, client, productName) {
//     try {
//         console.log(`🔍 Smart product search: "${productName}"`);
        
//         const cleanProductName = productName.replace(/\s+/g, ' ').trim().toLowerCase();
        
//         if (cleanProductName.length < 2) {
//             return false;
//         }

//         // FIRST: Check if it's a Product ID and try direct lookup
//         if (/^[0-9a-fA-F]{24}$/.test(cleanProductName)) {
//             console.log(`🔍 Detected Product ID format, attempting direct lookup`);
//             const idResult = await handleDirectProductIdSearch(message, client, cleanProductName);
//             if (idResult) {
//                 return true; // Product found by ID, exit
//             }
//             // If ID lookup failed, continue with smart search
//             console.log(`🔍 Product ID lookup failed, falling back to smart search`);
//         }

//         // SECOND: Get all products for smart search
//         let allProducts = await apiService.getProducts();
        
//         console.log(`🔍 Search debug - Total products: ${allProducts ? allProducts.length : 0}`);
        
//         if (!allProducts || allProducts.length === 0) {
//             console.log('❌ No products available for search');
//             return false;
//         }

//         // THIRD: Use smart search to find similar products
//         const similarProducts = findSimilarProducts(allProducts, cleanProductName);

//         console.log(`🔍 Search results: ${similarProducts.length} products found`);

//         if (similarProducts.length === 0) {
//             // Try to find alternative suggestions
//             const suggestions = getSearchSuggestions(allProducts, cleanProductName);
//             await message.reply(
//                 `🔍 *No products found for "*${productName}*"*\n\n` +
//                 `💡 *Try these suggestions:*\n` +
//                 `${suggestions}\n\n` +
//                 `📋 *Or browse all products:*\n` +
//                 `Type *Products* to see everything available\n\n` +
//                 `🛒 *Ready to order?* Type *Order*`
//             );
//             return true;
//         }

//         // Found matching products
//         if (similarProducts.length === 1) {
//             const product = similarProducts[0];
//             await sendProductWithImage(message, client, product, `🔍 Found product for "${productName}":`);
            
//             await message.reply(
//                 `💡 *Found exactly what you're looking for!*\n\n` +
//                 `🛒 *To order this product:*\n` +
//                 `Type *Order* and I'll guide you through the ordering process!\n\n` +
//                 `📋 *Other options:*\n` +
//                 `• Type *Products* to see all products\n` +
//                 `• Search for other product names`
//             );
//             return true;
//         } else {
//             const exactMatch = similarProducts.find(p => 
//                 p.productName.toLowerCase().includes(cleanProductName)
//             );
            
//             let title = `🔍 Found ${similarProducts.length} products matching "*${productName}*"`;
//             if (exactMatch) {
//                 title += `\n⭐ *Exact match available*`;
//             }
            
//             return await showProductsPage(message, client, 0, cleanProductName, title, similarProducts);
//         }

//     } catch (error) {
//         console.error('❌ Smart search error:', error);
//         return false;
//     }
// }

// /**
//  * Enhanced product search handler
//  */
// async function handleProductSearch(message, client, searchTerm) {
//     try {
//         const cleanSearchTerm = searchTerm.replace(/\s+/g, ' ').trim().toLowerCase();
        
//         if (cleanSearchTerm.length < 2) {
//             return await message.reply(
//                 `🔍 *Search Tip:*\n\n` +
//                 `Please use at least 2 characters for search.\n\n` +
//                 `💡 *Smart Search Features:*\n` +
//                 `• Finds products with similar names\n` +
//                 `• Handles spelling mistakes\n` +
//                 `• Searches categories too\n\n` +
//                 `Examples:\n` +
//                 `• *Products poster*\n` +
//                 `• *Products anime*\n` +
//                 `• *Or type product name directly*\n\n` +
//                 `🛒 *To order:* Just type *Order*`
//             );
//         }

//         return await showProductsPage(message, client, 0, cleanSearchTerm);

//     } catch (error) {
//         console.error('❌ Search error:', error);
//         await message.reply('❌ Search failed. Please try again.');
//     }
// }

// /**
//  * Enhanced showProductsPage with smart search
//  */
// async function showProductsPage(message, client, page = 0, searchTerm = '', customTitle = '', preFilteredProducts = null) {
//     try {
//         const from = message.from;
//         const limit = 6;
//         const skip = page * limit;

//         console.log(`📄 Showing products page ${page}, search: "${searchTerm}"`);

//         let products, totalCount;
        
//         if (searchTerm) {
//             if (preFilteredProducts) {
//                 products = preFilteredProducts;
//                 totalCount = products.length;
//             } else {
//                 const allProducts = await apiService.getProducts();
//                 console.log(`🔍 Search - Total products: ${allProducts ? allProducts.length : 0}`);
//                 products = findSimilarProducts(allProducts, searchTerm);
//                 totalCount = products.length;
//                 console.log(`🔍 Search - Found: ${totalCount} products`);
//             }
//             products = products.slice(skip, skip + limit);
//         } else {
//             products = await apiService.getProducts();
//             console.log(`📦 All products count: ${products ? products.length : 0}`);
//             totalCount = products ? products.length : 0;
//             products = products ? products.slice(skip, skip + limit) : [];
//         }

//         console.log(`📊 Final products to display: ${products ? products.length : 0}`);

//         if (!products || products.length === 0) {
//             console.log('❌ No products to display');
//             let noProductsMessage;
            
//             if (searchTerm) {
//                 const allProducts = await apiService.getProducts();
//                 const suggestions = getSearchSuggestions(allProducts, searchTerm);
                
//                 noProductsMessage = 
//                     `🔍 *No products found for "*${searchTerm}*"*\n\n` +
//                     `💡 *Search Tips:*\n` +
//                     `${suggestions}\n\n` +
//                     `📋 *Better yet, browse all products:*\n` +
//                     `Type *Products* to see everything available\n\n` +
//                     `🛒 *Ready to order?* Type *Order*`;
//             } else {
//                 noProductsMessage = 
//                     '📭 *No Products Available*\n\n' +
//                     'Sorry, there are currently no products available in our store.\n\n' +
//                     '💡 *What to do:*\n' +
//                     '• Check back later for new arrivals\n' +
//                     '• Contact support for assistance\n' +
//                     '• We\'ll be adding more products soon!\n\n' +
//                     'Thank you for your patience! 🙏';
//             }
            
//             return await message.reply(noProductsMessage);
//         }

//         const totalPages = Math.ceil(totalCount / limit);
//         const currentPage = page + 1;

//         // Store pagination session
//         productSessions.set(from, {
//             currentPage: page,
//             totalPages: totalPages,
//             searchTerm: searchTerm,
//             lastActivity: Date.now()
//         });

//         // Send intro message
//         let introMessage = customTitle || `🛍️ *Our Products* \n\n`;
        
//         if (searchTerm && !customTitle) {
//             introMessage += `🔍 Search: "${searchTerm}"\n`;
//         }
        
//         introMessage += `📄 Page ${currentPage} of ${totalPages}\n`;
//         introMessage += `📦 Showing ${products.length} of ${totalCount} products\n\n`;
        
//         // Add search quality indicator for search results
//         if (searchTerm) {
//             const exactMatches = products.filter(p => 
//                 p.productName.toLowerCase().includes(searchTerm.toLowerCase())
//             ).length;
            
//             if (exactMatches > 0) {
//                 introMessage += `✅ *${exactMatches} exact match${exactMatches > 1 ? 'es' : ''} found*\n\n`;
//             } else {
//                 introMessage += `🔍 *Showing similar products*\n\n`;
//             }
//         }
        
//         introMessage += `📋 *Easy Ordering:*\n`;
//         introMessage += `• Type *Order* to start ordering process\n`;
//         introMessage += `• I'll guide you step by step\n`;
//         introMessage += `• No need to remember Product IDs\n\n`;

//         if (totalPages > 1) {
//             introMessage += `📖 *Navigation:*\n`;
//             introMessage += `• Type *Next* for more products\n`;
//             if (page > 0) introMessage += `• Type *Prev* for previous page\n`;
//             introMessage += `\n`;
//         }

//         await message.reply(introMessage);

//         // Send each product with image handling
//         for (let i = 0; i < products.length; i++) {
//             const product = products[i];
//             const productNumber = skip + i + 1;
            
//             console.log(`🎯 Sending product ${productNumber}: ${product.productName}`);
            
//             // Highlight exact matches in search results
//             let title = `*${productNumber}. ${product.productName}*`;
//             if (searchTerm && product.productName.toLowerCase().includes(searchTerm.toLowerCase())) {
//                 title = `⭐ ${title} *- Exact Match!*`;
//             }
            
//             await sendProductWithImage(message, client, product, title);
            
//             // Wait between products
//             if (i < products.length - 1) {
//                 await new Promise(resolve => setTimeout(resolve, 2000));
//             }
//         }

//         // Send navigation and instructions
//         let footerMessage = `🎯 *READY TO ORDER?*\n\n`;
//         footerMessage += `Simply type *Order* and I'll guide you through the ordering process!\n\n`;
        
//         if (totalPages > 1) {
//             footerMessage += `🔄 *Navigation Commands:*\n`;
//             if (page < totalPages - 1) footerMessage += `• *Next* - More products\n`;
//             if (page > 0) footerMessage += `• *Prev* - Previous page\n`;
//             footerMessage += `\n`;
//         }

//         footerMessage += `💡 *Quick Commands:*\n`;
//         footerMessage += `• *Order* - Start ordering process\n`;
//         footerMessage += `• *Products* - Browse all products\n`;
//         footerMessage += `• *MyOrders* - View your orders\n`;
//         footerMessage += `• *Support* - Get help`;

//         await message.reply(footerMessage);

//     } catch (error) {
//         console.error('❌ Error showing products page:', error);
//         await message.reply('❌ Error loading products. Please try again.');
//     }
// }

// /**
//  * Handle next page navigation
//  */
// async function handleNextPage(message, client) {
//     const from = message.from;
//     const session = productSessions.get(from);
    
//     if (!session) {
//         return await showProductsPage(message, client, 0);
//     }

//     const nextPage = session.currentPage + 1;
    
//     if (nextPage >= session.totalPages) {
//         return await message.reply(
//             `📄 You're on the last page.\n\n` +
//             `Type *Products* to start over.\n\n` +
//             `🛒 *Ready to order?* Type *Order* to begin!`
//         );
//     }

//     return await showProductsPage(message, client, nextPage, session.searchTerm);
// }

// /**
//  * Handle previous page navigation
//  */
// async function handlePrevPage(message, client) {
//     const from = message.from;
//     const session = productSessions.get(from);
    
//     if (!session) {
//         return await showProductsPage(message, client, 0);
//     }

//     const prevPage = session.currentPage - 1;
    
//     if (prevPage < 0) {
//         return await message.reply(
//             `📄 You're already on the first page.\n\n` +
//             `Type *Next* to see more products.\n\n` +
//             `🛒 *Ready to order?* Type *Order* to begin!`
//         );
//     }

//     return await showProductsPage(message, client, prevPage, session.searchTerm);
// }

// /**
//  * Enhanced copy command
//  */
// export async function handleCopyCommand(message, client) {
//     try {
//         const args = message.body.split(' ');
//         const productId = args[1];
        
//         if (!productId) {
//             return await message.reply(
//                 `📋 *PRODUCT ORDERING*\n\n` +
//                 `No need to copy Product IDs! 🎉\n\n` +
//                 `💡 *Easy Ordering Process:*\n` +
//                 `1. Type *Order* to start\n` +
//                 `2. I'll guide you step by step\n` +
//                 `3. Select products from menu\n` +
//                 `4. Choose quantity\n` +
//                 `5. Provide shipping details\n\n` +
//                 `🛒 *Start ordering now:* Type *Order*`
//             );
//         }

//         const product = await apiService.getProductById(productId);
//         const productName = product ? product.productName : 'Product';
        
//         await message.reply(
//             `📋 *PRODUCT FOUND!*\n\n` +
//             `🆔 *Product ID:* ${productId}\n` +
//             `*${productName}*\n` +
//             `💰 Price: ₹${product?.price || 'N/A'}\n\n` +
//             `🎯 *Ready to order this product?*\n\n` +
//             `Simply type *Order* and I'll guide you through the complete ordering process!\n\n` +
//             `💡 No need to remember Product IDs - I'll help you select everything step by step!`
//         );

//     } catch (error) {
//         console.error('Copy error:', error);
//         await message.reply(
//             `❌ Product not found!\n\n` +
//             `💡 *Better way to order:*\n` +
//             `Type *Order* and I'll show you all available products to choose from!\n\n` +
//             `No need to remember Product IDs - I'll guide you through everything!`
//         );
//     }
// }

// /**
//  * Enhanced quick order
//  */
// export async function handleQuickOrder(message, client) {
//     try {
//         const args = message.body.split(' ');
//         const productId = args[1];
        
//         if (!productId) {
//             return await message.reply(
//                 `🛒 *QUICK ORDER GUIDE*\n\n` +
//                 `Let me help you order easily! 🎯\n\n` +
//                 `💡 *Simple Ordering Process:*\n` +
//                 `1. Type *Order* to begin\n` +
//                 `2. Browse available products\n` +
//                 `3. Select what you want\n` +
//                 `4. Choose quantity\n` +
//                 `5. Provide shipping details\n` +
//                 `6. Complete payment\n\n` +
//                 `🎉 *Start ordering:* Type *Order*`
//             );
//         }

//         await message.reply(
//             `🛒 *ORDERING MADE EASY!*\n\n` +
//             `No need to use Product IDs! 🎉\n\n` +
//             `💡 *Better way to order:*\n` +
//             `Type *Order* and I'll show you all available products with images, prices, and descriptions!\n\n` +
//             `You can:\n` +
//             `• Browse all products\n` +
//             `• See product images\n` +
//             `• Check availability\n` +
//             `• Get step-by-step guidance\n\n` +
//             `🎯 *Start now:* Type *Order*`
//         );

//     } catch (error) {
//         console.error('Order error:', error);
//         await message.reply(
//             `❌ Let me help you order properly!\n\n` +
//             `💡 *Easy Ordering:*\n` +
//             `Type *Order* and I'll guide you through:\n\n` +
//             `1. Product selection from menu\n` +
//             `2. Quantity choice\n` +
//             `3. Customization options\n` +
//             `4. Shipping address\n` +
//             `5. Payment instructions\n\n` +
//             `🎉 *Start ordering:* Type *Order*`
//         );
//     }
// }

// /**
//  * Get all product IDs
//  */
// export async function handleAllIds(message, client) {
//     try {
//         const products = await apiService.getProducts();

//         console.log(`📦 All IDs - Products count: ${products ? products.length : 0}`);

//         if (!products || products.length === 0) {
//             return await message.reply(
//                 '📭 *No Products Available*\n\n' +
//                 'There are currently no products in our store.\n\n' +
//                 'Please check back later or contact support.'
//             );
//         }

//         await message.reply(`🛍️ *${products.length} Products Available*\n\nBrowse our collection and order easily!`);

//         // Send products with image handling
//         for (let i = 0; i < products.length; i++) {
//             const product = products[i];
//             await sendProductWithImage(message, client, product, `*${i + 1}. ${product.productName}*`);
            
//             if (i < products.length - 1) {
//                 await new Promise(resolve => setTimeout(resolve, 2000));
//             }
//         }

//         await message.reply(
//             `🎯 *READY TO ORDER? IT'S EASY!*\n\n` +
//             `Simply type *Order* and I'll guide you through the complete ordering process!\n\n` +
//             `💡 *Benefits:*\n` +
//             `• No need to remember Product IDs\n` +
//             `• See product images\n` +
//             `• Step-by-step guidance\n` +
//             `• Easy payment process\n\n` +
//             `🛒 *Start ordering now:* Type *Order*`
//         );

//     } catch (error) {
//         console.error('All IDs error:', error);
//         await message.reply('❌ Failed to fetch products. Please try typing *Order* to start the ordering process.');
//     }
// }

// /**
//  * Simple button response handler
//  */
// export async function handleButtonResponse(message, client) {
//     await message.reply(
//         `🛒 *EASY ORDERING PROCESS*\n\n` +
//         `No need for complex commands! 🎉\n\n` +
//         `💡 *Simple way to order:*\n` +
//         `1. Type *Order* to begin\n` +
//         `2. I'll guide you step by step\n` +
//         `3. Select from available products\n` +
//         `4. Choose quantity\n` +
//         `5. Provide shipping details\n` +
//         `6. Complete payment\n\n` +
//         `🎯 *Start ordering:* Type *Order*`
//     );
// }

// /**
//  * Clean up old product sessions
//  */
// function cleanupProductSessions() {
//     const now = Date.now();
//     const oneHour = 60 * 60 * 1000;
    
//     for (const [phone, session] of productSessions.entries()) {
//         if (now - session.lastActivity > oneHour) {
//             productSessions.delete(phone);
//         }
//     }
// }

// // Run cleanup every hour
// setInterval(cleanupProductSessions, 60 * 60 * 1000);



import pkg from 'whatsapp-web.js';
import apiService from "../../services/apiService.js";
const { MessageMedia } = pkg;

// User product sessions for pagination
const productSessions = new Map();

/**
 * Safe number formatter utility
 */
function safeNumber(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

function safeToFixed(value, digits = 2) {
    const num = safeNumber(value);
    return num.toFixed(digits);
}

/**
 * Format custom ID to 5-digit format (00123)
 */
function formatCustomId(id) {
    if (!id && id !== 0) return null;
    return String(id).padStart(5, '0');
}

/**
 * Levenshtein distance algorithm for fuzzy matching
 */
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Enhanced search with fuzzy matching - INCLUDES CUSTOM ID
 */
function findSimilarProducts(products, searchTerm) {
    const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    const results = [];
    
    products.forEach(product => {
        const productName = product.productName?.toLowerCase() || '';
        const productWords = productName.split(/\s+/);
        
        // ✅ PROFESSIONAL FIX: Handle category whether it's string, object, or null
        let categoryText = '';
        if (product.category) {
            if (typeof product.category === 'string') {
                categoryText = product.category.toLowerCase();
            } else if (typeof product.category === 'object') {
                // Try to get name from category object, fallback to string representation
                categoryText = (product.category.name || product.category._id || '').toString().toLowerCase();
            }
        }
        
        const description = (product.description || '').toLowerCase();
        const shortDescription = (product.shortDescription || '').toLowerCase();
        const sku = (product.sku || '').toLowerCase();
        const hsnCode = (product.hsnCode || '').toLowerCase();
        const brand = (product.brand || '').toLowerCase();
        const productId = (product._id || product.id || '').toString().toLowerCase();
        const customId = product.customId ? String(product.customId) : '';
        const formattedId = product.customId ? formatCustomId(product.customId) : '';
        
        let score = 0;
        let matchedWords = [];
        
        // ===== HIGH PRIORITY MATCHES (1000-1500 points) =====
        
        // Check if search term matches custom ID (exact)
        if (customId && customId === searchTerm) {
            score += 1500;
            matchedWords.push('Custom ID Exact Match');
        }
        // Check if search term matches formatted ID (00123)
        else if (formattedId && formattedId === searchTerm) {
            score += 1400;
            matchedWords.push('Formatted ID Exact Match');
        }
        // Check if search term contains custom ID
        else if (customId && customId.includes(searchTerm)) {
            score += 700;
            matchedWords.push('Custom ID Partial Match');
        }
        // Check if search term contains formatted ID
        else if (formattedId && formattedId.includes(searchTerm)) {
            score += 600;
            matchedWords.push('Formatted ID Partial Match');
        }
        // Check if search term is exactly a MongoDB Product ID
        else if (productId === searchTerm.toLowerCase()) {
            score += 1000;
            matchedWords.push('MongoDB ID Match');
        }
        // Check if search term contains MongoDB Product ID
        else if (productId.includes(searchTerm.toLowerCase())) {
            score += 500;
            matchedWords.push('MongoDB ID Partial Match');
        }
        // Check SKU match
        else if (sku && sku.includes(searchTerm.toLowerCase())) {
            score += 400;
            matchedWords.push('SKU Match');
        }
        // Check HSN match
        else if (hsnCode && hsnCode.includes(searchTerm.toLowerCase())) {
            score += 300;
            matchedWords.push('HSN Code Match');
        }
        // Check brand match
        else if (brand && brand.includes(searchTerm.toLowerCase())) {
            score += 200;
            matchedWords.push('Brand Match');
        }
        // Check for exact product name match
        else if (productName.includes(searchTerm.toLowerCase())) {
            score += 100;
            matchedWords.push(searchTerm);
        }
        
        // ===== WORD-BASED SEARCH (10-50 points) =====
        searchWords.forEach(searchWord => {
            // Exact word match in product name
            if (productWords.some(word => word === searchWord)) {
                score += 50;
                matchedWords.push(searchWord);
            }
            // Partial word match in product name
            else if (productWords.some(word => word.includes(searchWord))) {
                score += 30;
                matchedWords.push(searchWord);
            }
            // Fuzzy match
            else {
                productWords.forEach(productWord => {
                    if (productWord.length > 2 && searchWord.length > 2) {
                        const distance = levenshteinDistance(searchWord, productWord);
                        const maxLength = Math.max(searchWord.length, productWord.length);
                        const similarity = 1 - (distance / maxLength);
                        
                        if (similarity > 0.7) {
                            score += Math.floor(similarity * 20);
                            matchedWords.push(searchWord);
                        }
                    }
                });
            }
            
            // ===== SEARCH IN OTHER FIELDS (5-25 points) =====
            
            // Category search (now safe with null check)
            if (categoryText && categoryText.includes(searchWord)) {
                score += 25;
                if (!matchedWords.includes(searchWord)) matchedWords.push(searchWord);
            }
            
            // Description search
            if (description.includes(searchWord)) {
                score += 10;
                if (!matchedWords.includes(searchWord)) matchedWords.push(searchWord);
            }
            
            // Short description search
            if (shortDescription.includes(searchWord)) {
                score += 8;
                if (!matchedWords.includes(searchWord)) matchedWords.push(searchWord);
            }
            
            // Brand search (additional check beyond the earlier brand match)
            if (brand && brand.includes(searchWord) && !matchedWords.includes('Brand Match')) {
                score += 15;
                if (!matchedWords.includes(searchWord)) matchedWords.push(searchWord);
            }
            
            // SKU search (additional check)
            if (sku && sku.includes(searchWord) && !matchedWords.includes('SKU Match')) {
                score += 20;
                if (!matchedWords.includes(searchWord)) matchedWords.push(searchWord);
            }
            
            // HSN search (additional check)
            if (hsnCode && hsnCode.includes(searchWord) && !matchedWords.includes('HSN Code Match')) {
                score += 15;
                if (!matchedWords.includes(searchWord)) matchedWords.push(searchWord);
            }
        });
        
        // ===== BONUS POINTS FOR MULTIPLE MATCHES =====
        if (matchedWords.length > 1) {
            // Bonus for having multiple matching words
            score += matchedWords.length * 5;
        }
        
        // ===== INCLUDE PRODUCT IF IT HAS ANY MATCH =====
        if (score > 0) {
            results.push({
                product,
                score,
                matchedWords: [...new Set(matchedWords)],
                isExactMatch: (customId && customId === searchTerm) || 
                             (formattedId && formattedId === searchTerm) ||
                             productId === searchTerm.toLowerCase() || 
                             productName.includes(searchTerm.toLowerCase()) ||
                             (sku && sku.includes(searchTerm.toLowerCase()))
            });
        }
    });
    
    // ===== SORT RESULTS BY SCORE (HIGHEST FIRST) =====
    return results
        .sort((a, b) => {
            // First by score (descending)
            if (b.score !== a.score) return b.score - a.score;
            
            // Then by product name (alphabetical)
            const nameA = a.product.productName || '';
            const nameB = b.product.productName || '';
            return nameA.localeCompare(nameB);
        })
        .map(item => item.product);
}

/**
 * Get search suggestions
 */
function getSearchSuggestions(products, searchTerm) {
    const allWords = new Set();
    
    products.forEach(product => {
        // Product name words
        const nameWords = (product.productName || '').toLowerCase().split(/\s+/);
        
        // ✅ PROFESSIONAL FIX: Handle category whether it's string, object, or null
        let categoryText = '';
        if (product.category) {
            if (typeof product.category === 'string') {
                categoryText = product.category.toLowerCase();
            } else if (typeof product.category === 'object') {
                // Extract name from category object, fallback to empty string
                categoryText = (product.category.name || '').toLowerCase();
            }
        }
        const categoryWords = categoryText.split(/\s+/);
        
        // Brand words
        const brandWords = (product.brand || '').toLowerCase().split(/\s+/);
        
        // ✅ ADDED: Description words for better suggestions
        const descriptionWords = (product.description || '').toLowerCase().split(/\s+/);
        
        // Custom ID handling
        const customId = product.customId ? String(product.customId) : '';
        const formattedId = product.customId ? formatCustomId(product.customId) : '';
        
        // Add IDs to suggestions
        if (customId && customId.length > 0) allWords.add(customId);
        if (formattedId && formattedId.length > 0) allWords.add(formattedId);
        
        // Add product name words (minimum 3 characters)
        nameWords.forEach(word => {
            if (word && word.length > 2) allWords.add(word);
        });
        
        // Add category words (minimum 3 characters)
        categoryWords.forEach(word => {
            if (word && word.length > 2) allWords.add(word);
        });

        // Add brand words (minimum 3 characters)
        brandWords.forEach(word => {
            if (word && word.length > 2) allWords.add(word);
        });
        
        // ✅ ADDED: Add description words for better suggestions
        descriptionWords.forEach(word => {
            if (word && word.length > 3) allWords.add(word); // Longer threshold for descriptions
        });
    });
    
    // Convert Set to Array and filter out empty/invalid words
    const validWords = Array.from(allWords).filter(word => word && word.length > 0);
    
    // If no valid words found, return default suggestions
    if (validWords.length === 0) {
        return `• Check spelling\n• Try shorter words\n• Browse all products with *Products*`;
    }
    
    // Calculate similarity and get best matches
    const suggestions = validWords
        .map(word => {
            // Avoid division by zero
            const maxLength = Math.max(searchTerm.length, word.length);
            const similarity = maxLength > 0 
                ? 1 - (levenshteinDistance(searchTerm, word) / maxLength)
                : 0;
            
            return { word, similarity };
        })
        .filter(item => item.similarity > 0.4) // Slightly lower threshold for more suggestions
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 6) // Show 6 suggestions instead of 5
        .map(item => `• "${item.word}"`)
        .join('\n');
    
    // Return suggestions or default message
    return suggestions || `• Check spelling\n• Try shorter words\n• Browse all products with *Products*`;
}

/**
 * Direct Product ID lookup (supports both MongoDB ID and custom ID)
 */
async function handleDirectProductIdSearch(message, client, productId) {
    try {
        console.log(`🔍 Direct Product ID search: "${productId}"`);
        
        // Try to find by MongoDB ID first
        let product = await apiService.getProductById(productId);
        
        // If not found, try to find by custom ID (if it's a number)
        if (!product && /^\d+$/.test(productId)) {
            // This would require a new API method to search by custom ID
            // For now, we'll just log and continue
            console.log(`🔍 Attempting to search by custom ID: ${productId}`);
            // You might want to add a new API method for custom ID search
        }
        
        if (!product) {
            console.log(`❌ No product found with ID: ${productId}`);
            return false;
        }

        console.log(`✅ Product found by ID: ${product.productName}`);
        
        await sendProductWithImage(message, client, product, `🔍 Product Found by ID:`);
        
        const customIdDisplay = product.customId ? formatCustomId(product.customId) : 'N/A';
        
        await message.reply(
            `🎯 *Perfect! Found the exact product you're looking for!*\n\n` +
            `🆔 *Product ID:* \`${product._id}\`\n` +
            (product.customId ? `🔢 *Custom ID:* \`${customIdDisplay}\`\n` : '') +
            `📦 *Product:* ${product.productName}\n` +
            `💰 *Price:* ₹${safeToFixed(product.discountPrice || product.price)}\n\n` +
            `🛒 *To order this product:*\n` +
            `Type *Order* and I'll guide you through the ordering process!\n\n` +
            `💡 *Quick Order Process:*\n` +
            `1. Type *Order*\n` +
            `2. Enter this Product ID: ${productId}\n` +
            `3. Choose quantity\n` +
            `4. Provide shipping details\n` +
            `5. Complete payment\n\n` +
            `🎉 *Start now:* Type *Order*`
        );
        
        return true;
        
    } catch (error) {
        console.error('❌ Direct ID search error:', error);
        return false;
    }
}

/**
 * ROBUST IMAGE HANDLER
 */
async function sendSingleImageWithDescription(message, imageUrl, productText, productName, productId) {
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
        try {
            console.log(`🖼️ Loading image (attempt ${retryCount + 1}/${maxRetries + 1}): ${productName}`);
            
            const fullImageUrl = apiService.getProductImageUrl(imageUrl);
            console.log(`📸 Image URL: ${fullImageUrl}`);
            
            const media = await MessageMedia.fromUrl(fullImageUrl, {
                unsafeMime: true,
                filename: `product-${productId}.jpg`,
                requestOptions: {
                    timeout: 15000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            });
            
            if (!media) {
                throw new Error('Media object is null');
            }
            
            console.log(`✅ Media loaded successfully: ${media.mimetype}, Size: ${media.data.length} bytes`);
            
            await message.reply(media, null, { caption: productText });
            console.log(`🎯 Single image delivered: ${productName}`);
            return true;
            
        } catch (error) {
            retryCount++;
            console.error(`❌ Image load failed (attempt ${retryCount}):`, error.message);
            
            if (retryCount > maxRetries) {
                console.error(`💥 All image attempts failed for: ${productName}`);
                
                const fallbackText = productText + 
                    `\n\n📸 *Image Available:* ${apiService.getProductImageUrl(imageUrl)}` +
                    `\n💡 *Tip:* If image doesn't load, you can view it via the link above`;
                
                await message.reply(fallbackText);
                console.log(`📝 Text fallback sent with image link: ${productName}`);
                return false;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

/**
 * Multiple images gallery handler
 */
async function sendMultipleImagesGallery(message, imageUrls, productText, productName, productId) {
    try {
        const imageCount = imageUrls.length;
        console.log(`🔄 Creating gallery with ${imageCount} images for: ${productName}`);
        
        let successfulImages = 0;
        let failedImages = [];
        
        for (let i = 0; i < imageCount; i++) {
            try {
                const fullImageUrl = apiService.getProductImageUrl(imageUrls[i]);
                console.log(`🖼️ Loading gallery image ${i + 1}/${imageCount}`);
                
                const media = await MessageMedia.fromUrl(fullImageUrl, {
                    unsafeMime: true,
                    filename: `product-${productId}-${i + 1}.jpg`,
                    requestOptions: { timeout: 15000 }
                });
                
                await message.reply(media);
                successfulImages++;
                console.log(`✅ Gallery image ${i + 1} sent`);
                
                if (i < imageCount - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
            } catch (imageError) {
                console.error(`❌ Gallery image ${i + 1} failed:`, imageError.message);
                failedImages.push(i + 1);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        
        let galleryText = productText;
        
        if (successfulImages > 0) {
            galleryText += `\n\n📸 *Image Gallery (${successfulImages}/${imageCount} images loaded)*`;
            if (failedImages.length > 0) {
                galleryText += `\n⚠️ Some images failed to load`;
            }
        } else {
            galleryText += `\n\n📸 *Images available at links below:*`;
            imageUrls.forEach((url, index) => {
                galleryText += `\n• Image ${index + 1}: ${apiService.getProductImageUrl(url)}`;
            });
        }
        
        await message.reply(galleryText);
        console.log(`✅ Gallery completed: ${successfulImages} images + description`);
        return successfulImages > 0;
        
    } catch (error) {
        console.error(`❌ Gallery creation failed:`, error);
        await message.reply(productText);
        return false;
    }
}

/**
 * ENHANCED SMART PRODUCT DISPLAY with new product fields and custom ID
 */
async function sendProductWithImage(message, client, product, title = '') {
    try {
        console.log(`\n🎯 PROCESSING PRODUCT: ${product.productName}`);
        console.log(`📊 MongoDB ID: ${product._id || product.id}`);
        console.log(`🔢 Custom ID: ${product.customId || 'Not set'}`);
        
        // Safe number values
        const mrp = safeNumber(product.mrp);
        const discountPrice = safeNumber(product.discountPrice);
        const price = discountPrice || safeNumber(product.price);
        const stock = safeNumber(product.stock);
        const gstRate = safeNumber(product.gstRate);
        const discountPercentage = mrp > discountPrice ? Math.round(((mrp - discountPrice) / mrp) * 100) : 0;
        
        // Format custom ID for display
        const customIdDisplay = product.customId ? formatCustomId(product.customId) : null;
        
        // Enhanced image detection
        let productImages = [];
        
        if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
            productImages = product.imageUrls.filter(url => url && url.trim() !== '');
        } else if (product.imageUrl && product.imageUrl.trim() !== '') {
            productImages = [product.imageUrl];
        }
        
        const imageCount = productImages.length;
        console.log(`🖼️ Images detected: ${imageCount}`);

        // Create enhanced product description with all new fields
        let productText = `${title ? title + '\n\n' : ''}`;

          // Show custom ID if available (without backticks to make it clickable)
           if (customIdDisplay) {
               productText += `🔢 *Product Code:* ${customIdDisplay}\n`;  // ← REMOVED BACKTICKS
          }
        
        productText += `*${product.productName}*\n\n` +
            `💰 *Price:* ₹${safeToFixed(price)}`;
        
        // Show MRP and discount if applicable
        if (mrp > discountPrice) {
            productText += ` ~~₹${safeToFixed(mrp)}~~ *${discountPercentage}% OFF!*\n`;
        } else {
            productText += `\n`;
        }
        
        // Stock status
        if (stock > 0) {
            const stockEmoji = stock > 10 ? '✅' : (stock > 0 ? '⚠️' : '❌');
            productText += `📦 *Stock:* ${stockEmoji} ${stock} available`;
            if (stock <= 5) productText += ` (Low stock!)`;
            productText += `\n`;
        } else {
            productText += `📦 *Stock:* ❌ Out of Stock\n`;
        }
        
        // Additional product details
        productText += 
            `🏷️ *Category:* ${product.category || 'General'}\n` +
            (product.brand ? `🏭 *Brand:* ${product.brand}\n` : '') +
            `\n📝 *Description:*\n${product.description || 'Premium quality product'}\n`;
        
        // SKU and HSN if available
        if (product.sku || product.hsnCode) {
            productText += `\n🔍 *Product Details:*\n`;
            if (product.sku) productText += `📌 SKU: \`${product.sku}\`\n`;
            if (product.hsnCode) productText += `🔢 HSN: \`${product.hsnCode}\`\n`;
        }
        
        // GST information
        if (gstRate > 0) {
            productText += `💵 *GST:* ${gstRate}% (${product.gstIncluded ? 'Inclusive' : 'Exclusive'})\n`;
        }
        
        // Product options if available
        if (product.options) {
            productText += `⚙️ *Options:* ${product.options}\n`;
        }
        
        // Product flags
        const flags = [];
        if (product.isFeatured) flags.push('⭐ Featured');
        if (product.isOnSale) flags.push('🔥 On Sale');
        if (product.isNewArrival) flags.push('🆕 New');
        if (product.isBestSeller) flags.push('🏆 Bestseller');
        
        if (flags.length > 0) {
            productText += `\n${flags.join(' • ')}\n`;
        }
        
        productText += 
            `\n────────────────────\n` +
            `🛒 *Ready to order?* Type *Order* to begin!`;

        // Handle no images case
        if (imageCount === 0) {
            console.log(`📝 No valid images found, sending text only`);
            await message.reply(productText);
            return;
        }

        console.log(`🎯 Using ${imageCount === 1 ? 'single image' : 'gallery'} strategy`);
        
        if (imageCount === 1) {
            await sendSingleImageWithDescription(
                message, 
                productImages[0], 
                productText, 
                product.productName, 
                product._id || product.id
            );
        } else {
            await sendMultipleImagesGallery(
                message, 
                productImages, 
                productText, 
                product.productName, 
                product._id || product.id
            );
        }

    } catch (error) {
        console.error(`💥 CRITICAL ERROR in product display:`, error);
        await sendProductFallback(message, product, title);
    }
}

/**
 * Reliable fallback function
 */
async function sendProductFallback(message, product, title = '') {
    try {
        const price = safeNumber(product.discountPrice) || safeNumber(product.price);
        const stock = safeNumber(product.stock);
        const customIdDisplay = product.customId ? formatCustomId(product.customId) : null;
        
        let productText = 
            `${title ? title + '\n\n' : ''}` +
            `🆔 *MongoDB ID:* \`${(product._id || product.id).slice(-8)}\`\n`;
        
        if (customIdDisplay) {
            productText += `🔢 *Product Code:* \`${customIdDisplay}\`\n`;
        }
        
        productText += `*${product.productName}*\n\n` +
            `💰 Price: ₹${safeToFixed(price)}\n` +
            `📦 Stock: ${stock} available\n` +
            `🏷️ Category: ${product.category || 'General'}\n` +
            (product.sku ? `📌 SKU: ${product.sku}\n` : '') +
            `\n🛒 Type *Order* to purchase!`;
            
        await message.reply(productText);
        console.log(`🔄 Fallback text sent: ${product.productName}`);
        
    } catch (error) {
        console.error('❌ Fallback failed:', error);
        await message.reply(
            `🛍️ *${product.productName || 'Product'}*\n` +
            `💰 ₹${safeToFixed(product.discountPrice || product.price)}\n` +
            `🛒 Type *Order* to buy!`
        );
    }
}

/**
 * Main products handler
 */
export async function handleProducts(message, client) { 
    try {
        const userMessage = message.body.trim();
        const from = message.from;
        const lowerMessage = userMessage.toLowerCase();
        
        console.log('🔄 Starting handleProducts...');
        
        const products = await apiService.getProducts();
        console.log('📦 Products from API:', products?.length || 0);
        
        if (products && products.length > 0) {
            console.log('🎯 First product sample:', {
                id: products[0]._id,
                customId: products[0].customId,
                name: products[0].productName,
                price: products[0].discountPrice || products[0].price,
                stock: products[0].stock
            });
        }

        // Handle search functionality
        if (lowerMessage.startsWith('products ') || lowerMessage.startsWith('product ')) {
            const searchTerm = userMessage.replace(/^(products?)\s+/i, '').trim();
            if (searchTerm.length > 0) {
                return await handleProductSearch(message, client, searchTerm);
            }
        }

        // Handle pagination commands
        if (lowerMessage === 'next' || lowerMessage === 'more' || lowerMessage === 'more products') {
            return await handleNextPage(message, client);
        }
        
        if (lowerMessage === 'prev' || lowerMessage === 'previous' || lowerMessage === 'back') {
            return await handlePrevPage(message, client);
        }

        // Default products listing with pagination
        return await showProductsPage(message, client, 0);

    } catch (error) {
        console.error('❌ Error showing products:', error);
        await message.reply('❌ Error loading products. Please try again.');
    }
}

/**
 * Enhanced direct product search with smart matching
 */
// Add this at the top of your file with other state management
const processingSearches = new Map(); // Track ongoing searches per user
const searchCooldown = 2000; // 2 seconds cooldown between searches

export async function handleDirectProductSearch(message, client, productName) {
    const from = message.from;
    const now = Date.now();
    
    // ===== PREVENT DUPLICATE PROCESSING =====
    // Check if already processing a search for this user
    if (processingSearches.has(from)) {
        const lastSearchTime = processingSearches.get(from);
        if (now - lastSearchTime < searchCooldown) {
            console.log(`⏳ Search cooldown for ${from}, ignoring duplicate (${now - lastSearchTime}ms)`);
            return true;
        } else {
            // Remove stale entry
            processingSearches.delete(from);
        }
    }
    
    // Mark as processing
    processingSearches.set(from, now);
    
    try {
        console.log(`🔍 Smart product search: "${productName}"`);
        
        const cleanProductName = productName.replace(/\s+/g, ' ').trim().toLowerCase();
        
        if (cleanProductName.length < 2) {
            processingSearches.delete(from);
            return false;
        }

        // ===== CHECK FOR PRODUCT ID MATCHES =====
        // Check if it's a MongoDB ObjectId (24 characters hex)
        if (/^[0-9a-fA-F]{24}$/.test(cleanProductName)) {
            console.log(`🔍 Detected MongoDB ID format, attempting direct lookup`);
            const idResult = await handleDirectProductIdSearch(message, client, cleanProductName);
            if (idResult) {
                processingSearches.delete(from);
                return true;
            }
        }
        
        // Check if it's a custom ID (numeric 3-5 digits)
        if (/^\d{3,5}$/.test(cleanProductName)) {
            console.log(`🔍 Detected custom ID format: ${cleanProductName}`);
            // Try to find by custom ID directly
            const allProducts = await apiService.getProducts();
            const productByCustomId = allProducts.find(p => 
                p.customId && String(p.customId) === cleanProductName
            );
            
            if (productByCustomId) {
                console.log(`✅ Found product by custom ID: ${productByCustomId.productName}`);
                await sendProductWithImage(message, client, productByCustomId, `🔍 Found product by ID ${cleanProductName}:`);
                await message.reply(
                    `💡 *Product found by ID!*\n\n` +
                    `🛒 *To order:* Type *Order* and I'll guide you!`
                );
                processingSearches.delete(from);
                return true;
            }
        }

        // ===== GET ALL PRODUCTS FOR SMART SEARCH =====
        let allProducts = await apiService.getProducts();
        
        console.log(`🔍 Search debug - Total products: ${allProducts?.length || 0}`);
        
        if (!allProducts || allProducts.length === 0) {
            console.log('❌ No products available for search');
            processingSearches.delete(from);
            return false;
        }

        // ===== REMOVE DUPLICATES FROM PRODUCT LIST =====
        // Ensure we don't have duplicate products in the list
        const uniqueProducts = [];
        const seenProductIds = new Set();
        
        allProducts.forEach(product => {
            const productId = product._id || product.id;
            if (!seenProductIds.has(productId)) {
                seenProductIds.add(productId);
                uniqueProducts.push(product);
            }
        });
        
        if (uniqueProducts.length !== allProducts.length) {
            console.log(`📊 Removed ${allProducts.length - uniqueProducts.length} duplicate products from search`);
            allProducts = uniqueProducts;
        }

        // ===== FIND SIMILAR PRODUCTS =====
        const similarProducts = findSimilarProducts(allProducts, cleanProductName);
        console.log(`🔍 Search results: ${similarProducts.length} unique products found`);

        if (similarProducts.length === 0) {
            const suggestions = getSearchSuggestions(allProducts, cleanProductName);
            await message.reply(
                `🔍 *No products found for "*${productName}*"*\n\n` +
                `💡 *Try these suggestions:*\n` +
                `${suggestions}\n\n` +
                `📋 *Or browse all products:*\n` +
                `Type *Products* to see everything available\n\n` +
                `🛒 *Ready to order?* Type *Order*`
            );
            processingSearches.delete(from);
            return true;
        }

        // ===== GET OR CREATE USER SESSION =====
        let session = productSessions.get(from) || {
            currentPage: 0,
            totalPages: 1,
            searchTerm: cleanProductName,
            lastActivity: now,
            sentProductIds: new Set()
        };

        // ===== FILTER OUT ALREADY SENT PRODUCTS =====
        const unsentProducts = [];
        const alreadySent = [];
        
        similarProducts.forEach(product => {
            const productId = product._id || product.id;
            if (session.sentProductIds && session.sentProductIds.has(productId)) {
                alreadySent.push(product.productName);
            } else {
                unsentProducts.push(product);
            }
        });

        if (alreadySent.length > 0) {
            console.log(`⏭️ Skipping ${alreadySent.length} already sent products`);
        }

        // ===== HANDLE CASE WHERE ALL PRODUCTS WERE ALREADY SENT =====
        if (unsentProducts.length === 0) {
            // Reset the sent products after 5 minutes or if user searches again
            const sessionAge = now - (session.lastActivity || 0);
            if (sessionAge > 5 * 60 * 1000) { // 5 minutes
                console.log(`🔄 Session expired, resetting sent products for ${from}`);
                session.sentProductIds = new Set();
                unsentProducts.push(...similarProducts);
            } else {
                await message.reply(
                    `✅ You've already seen all matching products for "*${productName}*"\n\n` +
                    `Try a different search term or type *Products* to browse all.`
                );
                processingSearches.delete(from);
                return true;
            }
        }

        // ===== UPDATE SESSION WITH NEWLY SENT PRODUCTS =====
        unsentProducts.forEach(product => {
            const productId = product._id || product.id;
            if (!session.sentProductIds) {
                session.sentProductIds = new Set();
            }
            session.sentProductIds.add(productId);
        });
        
        session.lastActivity = now;
        session.searchTerm = cleanProductName;
        productSessions.set(from, session);

        // ===== HANDLE SINGLE PRODUCT RESULT =====
        if (unsentProducts.length === 1) {
            const product = unsentProducts[0];
            await sendProductWithImage(message, client, product, `🔍 Found product for "${productName}":`);
            
            await message.reply(
                `💡 *Found exactly what you're looking for!*\n\n` +
                `🛒 *To order this product:*\n` +
                `Type *Order* and I'll guide you through the ordering process!\n\n` +
                `📋 *Other options:*\n` +
                `• Type *Products* to see all products\n` +
                `• Search for other product names`
            );
            processingSearches.delete(from);
            return true;
        } 
        
        // ===== HANDLE MULTIPLE PRODUCT RESULTS =====
        else {
            const exactMatch = unsentProducts.find(p => 
                p.productName.toLowerCase().includes(cleanProductName) ||
                (p.customId && String(p.customId) === cleanProductName) ||
                (p.customId && formatCustomId(p.customId) === cleanProductName)
            );
            
            let title = `🔍 Found ${unsentProducts.length} products matching "*${productName}*"`;
            if (exactMatch) {
                title += `\n⭐ *Exact match available*`;
            }
            
            // Update session with current page info
            session.currentPage = 0;
            session.totalPages = Math.ceil(unsentProducts.length / 6); // Assuming 6 per page
            productSessions.set(from, session);
            
            const result = await showProductsPage(message, client, 0, cleanProductName, title, unsentProducts);
            processingSearches.delete(from);
            return result;
        }

    } catch (error) {
        console.error('❌ Smart search error:', error);
        processingSearches.delete(from);
        
        // Send user-friendly error message
        await message.reply(
            `❌ *Search Error*\n\n` +
            `Something went wrong while searching. Please try again.\n\n` +
            `💡 *Try:*\n` +
            `• Type *Products* to browse all\n` +
            `• Use fewer words\n` +
            `• Check spelling`
        );
        return false;
    }
}

/**
 * Enhanced product search handler
 */
async function handleProductSearch(message, client, searchTerm) {
    try {
        const cleanSearchTerm = searchTerm.replace(/\s+/g, ' ').trim().toLowerCase();
        
        if (cleanSearchTerm.length < 2) {
            return await message.reply(
                `🔍 *Search Tip:*\n\n` +
                `Please use at least 2 characters for search.\n\n` +
                `💡 *Smart Search Features:*\n` +
                `• Finds products by name, custom ID, SKU, HSN code\n` +
                `• Searches by brand and category\n` +
                `• Handles spelling mistakes\n\n` +
                `Examples:\n` +
                `• *Products poster*\n` +
                `• *Products 00123* (search by custom ID)\n` +
                `• *Products anime*\n` +
                `• *Or type product name directly*\n\n` +
                `🛒 *To order:* Just type *Order*`
            );
        }

        return await showProductsPage(message, client, 0, cleanSearchTerm);

    } catch (error) {
        console.error('❌ Search error:', error);
        await message.reply('❌ Search failed. Please try again.');
    }
}

/**
 * Enhanced showProductsPage with smart search
 */
async function showProductsPage(message, client, page = 0, searchTerm = '', customTitle = '', preFilteredProducts = null) {
    try {
        const from = message.from;
        const limit = 6;
        const skip = page * limit;

        console.log(`📄 Showing products page ${page}, search: "${searchTerm}"`);

        let products, totalCount;
        
        if (searchTerm) {
            if (preFilteredProducts) {
                products = preFilteredProducts;
                totalCount = products.length;
            } else {
                const allProducts = await apiService.getProducts();
                console.log(`🔍 Search - Total products: ${allProducts?.length || 0}`);
                products = findSimilarProducts(allProducts, searchTerm);
                totalCount = products.length;
                console.log(`🔍 Search - Found: ${totalCount} products`);
            }
            products = products.slice(skip, skip + limit);
        } else {
            const allProducts = await apiService.getProducts();
            console.log(`📦 All products count: ${allProducts?.length || 0}`);
            totalCount = allProducts?.length || 0;
            products = allProducts ? allProducts.slice(skip, skip + limit) : [];
        }

        console.log(`📊 Final products to display: ${products?.length || 0}`);

        if (!products || products.length === 0) {
            console.log('❌ No products to display');
            let noProductsMessage;
            
            if (searchTerm) {
                const allProducts = await apiService.getProducts();
                const suggestions = getSearchSuggestions(allProducts, searchTerm);
                
                noProductsMessage = 
                    `🔍 *No products found for "*${searchTerm}*"*\n\n` +
                    `💡 *Search Tips:*\n` +
                    `${suggestions}\n\n` +
                    `📋 *Browse all products:*\n` +
                    `Type *Products* to see everything available\n\n` +
                    `🛒 *Ready to order?* Type *Order*`;
            } else {
                noProductsMessage = 
                    '📭 *No Products Available*\n\n' +
                    'Sorry, there are currently no products available.\n\n' +
                    '💡 *What to do:*\n' +
                    '• Check back later for new arrivals\n' +
                    '• Contact support for assistance\n' +
                    '• We\'ll be adding more products soon!\n\n' +
                    'Thank you for your patience! 🙏';
            }
            
            return await message.reply(noProductsMessage);
        }

        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = page + 1;

        // Store pagination session
        productSessions.set(from, {
            currentPage: page,
            totalPages: totalPages,
            searchTerm: searchTerm,
            lastActivity: Date.now()
        });

        // Send intro message
        let introMessage = customTitle || `🛍️ *Our Products* \n\n`;
        
        if (searchTerm && !customTitle) {
            introMessage += `🔍 Search: "${searchTerm}"\n`;
        }
        
        introMessage += `📄 Page ${currentPage} of ${totalPages}\n`;
        introMessage += `📦 Showing ${products.length} of ${totalCount} products\n\n`;
        
        if (searchTerm) {
            const exactMatches = products.filter(p => 
                p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.customId && String(p.customId) === searchTerm) ||
                (p.customId && formatCustomId(p.customId) === searchTerm)
            ).length;
            
            if (exactMatches > 0) {
                introMessage += `✅ *${exactMatches} exact match${exactMatches > 1 ? 'es' : ''} found*\n\n`;
            } else {
                introMessage += `🔍 *Showing similar products*\n\n`;
            }
        }
        
        introMessage += `📋 *Easy Ordering:*\n`;
        introMessage += `• Type *Order* to start ordering process\n`;
        introMessage += `• I'll guide you step by step\n`;
        introMessage += `• No need to remember Product IDs\n\n`;

        if (totalPages > 1) {
            introMessage += `📖 *Navigation:*\n`;
            introMessage += `• Type *Next* for more products\n`;
            if (page > 0) introMessage += `• Type *Prev* for previous page\n`;
            introMessage += `\n`;
        }

        await message.reply(introMessage);

        // Send each product with image handling
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const productNumber = skip + i + 1;
            
            console.log(`🎯 Sending product ${productNumber}: ${product.productName}`);
            
            let title = `*${productNumber}. ${product.productName}*`;
            if (searchTerm) {
                const isExactMatch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    (product.customId && String(product.customId) === searchTerm) ||
                                    (product.customId && formatCustomId(product.customId) === searchTerm);
                if (isExactMatch) {
                    title = `⭐ ${title} *- Exact Match!*`;
                }
            }
            
            await sendProductWithImage(message, client, product, title);
            
            if (i < products.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Send navigation and instructions
        let footerMessage = `🎯 *READY TO ORDER?*\n\n`;
        footerMessage += `Simply type *Order* and I'll guide you through the ordering process!\n\n`;
        
        if (totalPages > 1) {
            footerMessage += `🔄 *Navigation Commands:*\n`;
            if (page < totalPages - 1) footerMessage += `• *Next* - More products\n`;
            if (page > 0) footerMessage += `• *Prev* - Previous page\n`;
            footerMessage += `\n`;
        }

        footerMessage += `💡 *Quick Commands:*\n`;
        footerMessage += `• *Order* - Start ordering process\n`;
        footerMessage += `• *Products* - Browse all products\n`;
        footerMessage += `• *MyOrders* - View your orders\n`;
        footerMessage += `• *Support* - Get help`;

        await message.reply(footerMessage);

    } catch (error) {
        console.error('❌ Error showing products page:', error);
        await message.reply('❌ Error loading products. Please try again.');
    }
}

/**
 * Handle next page navigation
 */
async function handleNextPage(message, client) {
    const from = message.from;
    const session = productSessions.get(from);
    
    if (!session) {
        return await showProductsPage(message, client, 0);
    }

    const nextPage = session.currentPage + 1;
    
    if (nextPage >= session.totalPages) {
        return await message.reply(
            `📄 You're on the last page.\n\n` +
            `Type *Products* to start over.\n\n` +
            `🛒 *Ready to order?* Type *Order* to begin!`
        );
    }

    return await showProductsPage(message, client, nextPage, session.searchTerm);
}

/**
 * Handle previous page navigation
 */
async function handlePrevPage(message, client) {
    const from = message.from;
    const session = productSessions.get(from);
    
    if (!session) {
        return await showProductsPage(message, client, 0);
    }

    const prevPage = session.currentPage - 1;
    
    if (prevPage < 0) {
        return await message.reply(
            `📄 You're already on the first page.\n\n` +
            `Type *Next* to see more products.\n\n` +
            `🛒 *Ready to order?* Type *Order* to begin!`
        );
    }

    return await showProductsPage(message, client, prevPage, session.searchTerm);
}

/**
 * Enhanced copy command
 */
export async function handleCopyCommand(message, client) {
    try {
        const args = message.body.split(' ');
        const productId = args[1];
        
        if (!productId) {
            return await message.reply(
                `📋 *PRODUCT ORDERING*\n\n` +
                `No need to copy Product IDs! 🎉\n\n` +
                `💡 *Easy Ordering Process:*\n` +
                `1. Type *Order* to start\n` +
                `2. I'll guide you step by step\n` +
                `3. Select products from menu\n` +
                `4. Choose quantity\n` +
                `5. Provide shipping details\n\n` +
                `🛒 *Start ordering now:* Type *Order*`
            );
        }

        const product = await apiService.getProductById(productId);
        const productName = product ? product.productName : 'Product';
        const price = safeNumber(product?.discountPrice || product?.price);
        const customIdDisplay = product?.customId ? formatCustomId(product.customId) : null;
        
        let replyText = 
            `📋 *PRODUCT FOUND!*\n\n` +
            `🆔 *MongoDB ID:* \`${productId}\`\n`;
        
        if (customIdDisplay) {
            replyText += `🔢 *Product Code:* \`${customIdDisplay}\`\n`;
        }
        
        replyText += `*${productName}*\n` +
            `💰 Price: ₹${safeToFixed(price)}\n\n` +
            `🎯 *Ready to order this product?*\n\n` +
            `Simply type *Order* and I'll guide you through the complete ordering process!\n\n` +
            `💡 No need to remember Product IDs - I'll help you select everything step by step!`;
        
        await message.reply(replyText);

    } catch (error) {
        console.error('Copy error:', error);
        await message.reply(
            `❌ Product not found!\n\n` +
            `💡 *Better way to order:*\n` +
            `Type *Order* and I'll show you all available products to choose from!\n\n` +
            `No need to remember Product IDs - I'll guide you through everything!`
        );
    }
}

/**
 * Enhanced quick order
 */
export async function handleQuickOrder(message, client) {
    try {
        const args = message.body.split(' ');
        const productId = args[1];
        
        if (!productId) {
            return await message.reply(
                `🛒 *QUICK ORDER GUIDE*\n\n` +
                `Let me help you order easily! 🎯\n\n` +
                `💡 *Simple Ordering Process:*\n` +
                `1. Type *Order* to begin\n` +
                `2. Browse available products\n` +
                `3. Select what you want\n` +
                `4. Choose quantity\n` +
                `5. Provide shipping details\n` +
                `6. Complete payment\n\n` +
                `🎉 *Start ordering:* Type *Order*`
            );
        }

        await message.reply(
            `🛒 *ORDERING MADE EASY!*\n\n` +
            `No need to use Product IDs! 🎉\n\n` +
            `💡 *Better way to order:*\n` +
            `Type *Order* and I'll show you all available products with images, prices, and descriptions!\n\n` +
            `You can:\n` +
            `• Browse all products\n` +
            `• See product images\n` +
            `• Check availability\n` +
            `• Get step-by-step guidance\n\n` +
            `🎯 *Start now:* Type *Order*`
        );

    } catch (error) {
        console.error('Order error:', error);
        await message.reply(
            `❌ Let me help you order properly!\n\n` +
            `💡 *Easy Ordering:*\n` +
            `Type *Order* and I'll guide you through:\n\n` +
            `1. Product selection from menu\n` +
            `2. Quantity choice\n` +
            `3. Customization options\n` +
            `4. Shipping address\n` +
            `5. Payment instructions\n\n` +
            `🎉 *Start ordering:* Type *Order*`
        );
    }
}

/**
 * Get all product IDs
 */
export async function handleAllIds(message, client) {
    try {
        const products = await apiService.getProducts();

        console.log(`📦 All IDs - Products count: ${products?.length || 0}`);

        if (!products || products.length === 0) {
            return await message.reply(
                '📭 *No Products Available*\n\n' +
                'There are currently no products in our store.\n\n' +
                'Please check back later or contact support.'
            );
        }

        await message.reply(`🛍️ *${products.length} Products Available*\n\nBrowse our collection and order easily!`);

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            await sendProductWithImage(message, client, product, `*${i + 1}. ${product.productName}*`);
            
            if (i < products.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        await message.reply(
            `🎯 *READY TO ORDER? IT'S EASY!*\n\n` +
            `Simply type *Order* and I'll guide you through the complete ordering process!\n\n` +
            `💡 *Benefits:*\n` +
            `• No need to remember Product IDs\n` +
            `• See product images\n` +
            `• Step-by-step guidance\n` +
            `• Easy payment process\n\n` +
            `🛒 *Start ordering now:* Type *Order*`
        );

    } catch (error) {
        console.error('All IDs error:', error);
        await message.reply('❌ Failed to fetch products. Please try typing *Order* to start the ordering process.');
    }
}

/**
 * Simple button response handler
 */
export async function handleButtonResponse(message, client) {
    await message.reply(
        `🛒 *EASY ORDERING PROCESS*\n\n` +
        `No need for complex commands! 🎉\n\n` +
        `💡 *Simple way to order:*\n` +
        `1. Type *Order* to begin\n` +
        `2. I'll guide you step by step\n` +
        `3. Select from available products\n` +
        `4. Choose quantity\n` +
        `5. Provide shipping details\n` +
        `6. Complete payment\n\n` +
        `🎯 *Start ordering:* Type *Order*`
    );
}

/**
 * Clean up old product sessions
 */
function cleanupProductSessions() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [phone, session] of productSessions.entries()) {
        if (now - session.lastActivity > oneHour) {
            productSessions.delete(phone);
        }
    }
}

// Run cleanup every hour
setInterval(cleanupProductSessions, 60 * 60 * 1000);