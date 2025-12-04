// // // import Product from '../../models/Product.js';
// // // import pkg from 'whatsapp-web.js';
// // // const { MessageMedia } = pkg;
// // // import { readFile } from 'fs/promises';
// // // import path from 'path';

// // // // User product sessions for pagination
// // // const productSessions = new Map();

// // // export async function handleProducts(message, client) { 
// // //     try {
// // //         const userMessage = message.body.trim();
// // //         const from = message.from;
// // //         const lowerMessage = userMessage.toLowerCase();
        
// // //         // Handle search functionality
// // //         if (lowerMessage.startsWith('products ') || lowerMessage.startsWith('product ')) {
// // //             const searchTerm = userMessage.replace(/^(products?)\s+/i, '').trim();
// // //             if (searchTerm.length > 0) {
// // //                 return await handleProductSearch(message, client, searchTerm);
// // //             }
// // //         }

// // //         // Handle pagination commands
// // //         if (lowerMessage === 'next' || lowerMessage === 'more' || lowerMessage === 'more products') {
// // //             return await handleNextPage(message, client);
// // //         }
        
// // //         if (lowerMessage === 'prev' || lowerMessage === 'previous' || lowerMessage === 'back') {
// // //             return await handlePrevPage(message, client);
// // //         }

// // //         // Default products listing with pagination
// // //         return await showProductsPage(message, client, 0);

// // //     } catch (error) {
// // //         console.error('❌ Error showing products:', error);
// // //         await message.reply('❌ Error loading products. Please try again.');
// // //     }
// // // }

// // // // Handle direct product name search (exported for message handler)
// // // export async function handleDirectProductSearch(message, client, productName) {
// // //     try {
// // //         console.log(`🔍 Direct product search: "${productName}"`);
        
// // //         // Clean the product name - remove extra spaces and make case insensitive
// // //         const cleanProductName = productName.replace(/\s+/g, ' ').trim().toLowerCase();
        
// // //         if (cleanProductName.length < 2) {
// // //             return false; // Let main handler handle this
// // //         }

// // //         // First try exact match
// // //         let products = await Product.find({
// // //             isActive: true,
// // //             stock: { $gt: 0 },
// // //             $or: [
// // //                 { productName: { $regex: `^${cleanProductName}$`, $options: 'i' } },
// // //                 { productName: { $regex: cleanProductName, $options: 'i' } }
// // //             ]
// // //         })
// // //         .sort({ productName: 1 })
// // //         .limit(10)
// // //         .lean();

// // //         // If no exact matches, try fuzzy search
// // //         if (products.length === 0) {
// // //             products = await Product.find({
// // //                 isActive: true,
// // //                 stock: { $gt: 0 },
// // //                 $or: [
// // //                     { productName: { $regex: cleanProductName.split(' ').join('.*'), $options: 'i' } },
// // //                     { category: { $regex: cleanProductName, $options: 'i' } },
// // //                     { description: { $regex: cleanProductName, $options: 'i' } },
// // //                     { tags: { $regex: cleanProductName, $options: 'i' } }
// // //                 ]
// // //             })
// // //             .sort({ productName: 1 })
// // //             .limit(10)
// // //             .lean();
// // //         }

// // //         // If still no products, try partial word matching
// // //         if (products.length === 0) {
// // //             const words = cleanProductName.split(' ').filter(word => word.length > 2);
// // //             if (words.length > 0) {
// // //                 const regexPattern = words.join('|');
// // //                 products = await Product.find({
// // //                     isActive: true,
// // //                     stock: { $gt: 0 },
// // //                     $or: [
// // //                         { productName: { $regex: regexPattern, $options: 'i' } },
// // //                         { category: { $regex: regexPattern, $options: 'i' } }
// // //                     ]
// // //                 })
// // //                 .sort({ productName: 1 })
// // //                 .limit(10)
// // //                 .lean();
// // //             }
// // //         }

// // //         if (products.length === 0) {
// // //             // No products found, let main handler continue
// // //             return false;
// // //         }

// // //         // Found matching products!
// // //         if (products.length === 1) {
// // //             // Single product found - show it directly
// // //             const product = products[0];
// // //             await sendSingleProduct(message, product, `🔍 Found product for "${productName}":`);
            
// // //             await message.reply(
// // //                 `💡 *Found exactly what you're looking for!*\n\n` +
// // //                 `🛒 *To order this product:*\n` +
// // //                 `Order ${product._id} 1\n\n` +
// // //                 `📋 *Other options:*\n` +
// // //                 `• Type *Products* to see all products\n` +
// // //                 `• Type *Products ${productName}* for more similar items\n` +
// // //                 `• Search for other product names`
// // //             );
// // //             return true;
// // //         } else {
// // //             // Multiple products found - show as search results
// // //             return await showProductsPage(message, client, 0, cleanProductName, `🔍 Search results for "${productName}":`);
// // //         }

// // //     } catch (error) {
// // //         console.error('❌ Direct search error:', error);
// // //         return false; // Let main handler continue
// // //     }
// // // }

// // // async function showProductsPage(message, client, page = 0, searchTerm = '', customTitle = '') {
// // //     try {
// // //         const from = message.from;
// // //         const limit = 6; // Products per page
// // //         const skip = page * limit;

// // //         // Build query
// // //         let query = { 
// // //             isActive: true, 
// // //             stock: { $gt: 0 } 
// // //         };

// // //         if (searchTerm) {
// // //             const cleanSearchTerm = searchTerm.replace(/\s+/g, ' ').trim();
// // //             const words = cleanSearchTerm.split(' ').filter(word => word.length > 0);
            
// // //             if (words.length > 0) {
// // //                 // Create search conditions for each word
// // //                 const searchConditions = [];
                
// // //                 words.forEach(word => {
// // //                     if (word.length > 2) {
// // //                         searchConditions.push(
// // //                             { productName: { $regex: word, $options: 'i' } },
// // //                             { category: { $regex: word, $options: 'i' } },
// // //                             { description: { $regex: word, $options: 'i' } }
// // //                         );
// // //                     }
// // //                 });

// // //                 query.$or = searchConditions.length > 0 ? searchConditions : [
// // //                     { productName: { $regex: cleanSearchTerm, $options: 'i' } }
// // //                 ];
// // //             }
// // //         }

// // //         const [products, totalCount] = await Promise.all([
// // //             Product.find(query)
// // //                 .sort({ 
// // //                     // Prioritize exact matches first, then partial matches
// // //                     [searchTerm ? 'productName' : 'createdAt']: searchTerm ? 1 : -1 
// // //                 })
// // //                 .skip(skip)
// // //                 .limit(limit)
// // //                 .lean(),
// // //             Product.countDocuments(query)
// // //         ]);

// // //         if (!products || products.length === 0) {
// // //             const noProductsMessage = searchTerm 
// // //                 ? `📭 No products found for "${searchTerm}". Try:\n\n• Different spelling\n• Shorter search term\n• Type *Products* to see all items`
// // //                 : '📭 No products available right now.';
// // //             return await message.reply(noProductsMessage);
// // //         }

// // //         const totalPages = Math.ceil(totalCount / limit);
// // //         const currentPage = page + 1;

// // //         // Store pagination session
// // //         productSessions.set(from, {
// // //             currentPage: page,
// // //             totalPages: totalPages,
// // //             searchTerm: searchTerm,
// // //             lastActivity: Date.now()
// // //         });

// // //         // Send intro message
// // //         let introMessage = customTitle || `🛍️ *Our Products* \n\n`;
        
// // //         if (searchTerm && !customTitle) {
// // //             introMessage += `🔍 Search: "${searchTerm}"\n`;
// // //         }
        
// // //         introMessage += `📄 Page ${currentPage} of ${totalPages}\n`;
// // //         introMessage += `📦 Showing ${products.length} of ${totalCount} products\n\n`;
// // //         introMessage += `📋 *Easy Ordering:*\n`;
// // //         introMessage += `• Copy Product ID from below\n`;
// // //         introMessage += `• Type: Order PRODUCT_ID QUANTITY\n`;
// // //         introMessage += `• Example: Order ${products[0]._id} 1\n\n`;

// // //         if (totalPages > 1) {
// // //             introMessage += `📖 *Navigation:*\n`;
// // //             introMessage += `• Type *Next* for more products\n`;
// // //             if (page > 0) introMessage += `• Type *Prev* for previous page\n`;
// // //             introMessage += `\n`;
// // //         }

// // //         await message.reply(introMessage);

// // //         // Send each product
// // //         for (let i = 0; i < products.length; i++) {
// // //             const product = products[i];
// // //             const productNumber = skip + i + 1;
// // //             await sendProduct(message, product, productNumber);
            
// // //             // Wait between messages
// // //             if (i < products.length - 1) {
// // //                 await new Promise(resolve => setTimeout(resolve, 1500));
// // //             }
// // //         }

// // //         // Send navigation and instructions
// // //         let footerMessage = `📋 *HOW TO ORDER:*\n\n`;
// // //         footerMessage += `1. Copy any Product ID above\n`;
// // //         footerMessage += `2. Type: Order PRODUCT_ID QUANTITY\n\n`;
        
// // //         if (totalPages > 1) {
// // //             footerMessage += `🔄 *Navigation Commands:*\n`;
// // //             if (page < totalPages - 1) footerMessage += `• *Next* - More products\n`;
// // //             if (page > 0) footerMessage += `• *Prev* - Previous page\n`;
// // //             footerMessage += `\n`;
// // //         }

// // //         footerMessage += `💡 *Quick Commands:*\n`;
// // //         footerMessage += `• !copy PRODUCT_ID - Get ID in copy format\n`;
// // //         footerMessage += `• !order PRODUCT_ID 2 - Quick order\n`;
// // //         footerMessage += `• !allids - See all product IDs\n`;
        
// // //         if (!searchTerm) {
// // //             footerMessage += `• *Type any product name* - Direct search\n`;
// // //             footerMessage += `• *Products [name]* - Search products\n`;
// // //         } else {
// // //             footerMessage += `\n🔍 *Search Tips:*\n`;
// // //             footerMessage += `• Type exact product names\n`;
// // //             footerMessage += `• Try different spellings\n`;
// // //             footerMessage += `• Use *Products* for all items\n`;
// // //         }

// // //         await message.reply(footerMessage);

// // //     } catch (error) {
// // //         console.error('❌ Error showing products page:', error);
// // //         throw error;
// // //     }
// // // }

// // // async function handleProductSearch(message, client, searchTerm) {
// // //     try {
// // //         // Clean up search term - remove extra spaces and make case insensitive
// // //         const cleanSearchTerm = searchTerm.replace(/\s+/g, ' ').trim().toLowerCase();
        
// // //         if (cleanSearchTerm.length < 2) {
// // //             return await message.reply(
// // //                 `🔍 *Search Tip:*\n\n` +
// // //                 `Please use at least 2 characters for search.\n\n` +
// // //                 `Examples:\n` +
// // //                 `• *Products poster*\n` +
// // //                 `• *Products anime*\n` +
// // //                 `• *Products landscape*\n` +
// // //                 `• *Or just type: neem soap* (direct search)`
// // //             );
// // //         }

// // //         return await showProductsPage(message, client, 0, cleanSearchTerm);

// // //     } catch (error) {
// // //         console.error('❌ Search error:', error);
// // //         await message.reply('❌ Search failed. Please try again.');
// // //     }
// // // }

// // // async function sendSingleProduct(message, product, title = '') {
// // //     try {
// // //         const productText = 
// // //             `${title ? title + '\n\n' : ''}` +
// // //             `*${product.productName}*\n\n` +
// // //             `💰 *Price:* ₹${product.price}\n` +
// // //             `📦 *Stock:* ${product.stock} available\n` +
// // //             `🏷️ *Category:* ${product.category || 'General'}\n` +
// // //             `📝 *Description:* ${product.description || 'Premium quality product'}\n` +
// // //             (product.options ? `⚙️ *Options:* ${product.options}\n` : '') +
// // //             `\n────────────────────\n` +
// // //             `📋 *EASY COPY - Tap & hold below:*\n\n` +
// // //             `🆔 PRODUCT_ID:\n` +
// // //             `\`${product._id}\`\n\n` +
// // //             `🛒 *Order Command:*\n` +
// // //             `Order ${product._id} 1\n\n` +
// // //             `💡 Product ID is formatted for easy copying!` +
// // //             `\n────────────────────`;

// // //         // Try to send image using Base64 (NO URLS)
// // //         if (product.imageUrl) {
// // //             try {
// // //                 const imagePath = await getImagePath(product.imageUrl);
// // //                 if (imagePath) {
// // //                     console.log(`🖼️ Reading image file: ${imagePath}`);
// // //                     const media = await createMediaFromFile(imagePath);
// // //                     if (media) {
// // //                         await message.reply(media, null, { caption: productText });
// // //                         console.log(`✅ Image sent via Base64: ${product.productName}`);
// // //                         return;
// // //                     }
// // //                 } else {
// // //                     console.log(`❌ Image path not found for: ${product.imageUrl}`);
// // //                 }
// // //             } catch (imageError) {
// // //                 console.error(`❌ Base64 image failed:`, imageError.message);
// // //             }
// // //         }

// // //         // Fallback to text only
// // //         await message.reply(productText);
// // //         console.log(`📝 Text only sent: ${product.productName}`);

// // //     } catch (error) {
// // //         console.error(`❌ Error with product:`, error);
// // //         await message.reply(
// // //             `🛍️ *${product.productName}*\n` +
// // //             `💰 Price: ₹${product.price}\n` +
// // //             `📦 Stock: ${product.stock}\n\n` +
// // //             `📋 COPY ID: \`${product._id}\`\n\n` +
// // //             `Order ${product._id} 1`
// // //         );
// // //     }
// // // }

// // // async function sendProduct(message, product, index) {
// // //     await sendSingleProduct(message, product, `*${index}. ${product.productName}*`);
// // // }

// // // async function handleNextPage(message, client) {
// // //     const from = message.from;
// // //     const session = productSessions.get(from);
    
// // //     if (!session) {
// // //         return await showProductsPage(message, client, 0);
// // //     }

// // //     const nextPage = session.currentPage + 1;
    
// // //     if (nextPage >= session.totalPages) {
// // //         return await message.reply(
// // //             `📄 You're on the last page (${session.totalPages} of ${session.totalPages}).\n\n` +
// // //             `Type *Prev* to go back or *Products* to start over.`
// // //         );
// // //     }

// // //     return await showProductsPage(message, client, nextPage, session.searchTerm);
// // // }

// // // async function handlePrevPage(message, client) {
// // //     const from = message.from;
// // //     const session = productSessions.get(from);
    
// // //     if (!session) {
// // //         return await showProductsPage(message, client, 0);
// // //     }

// // //     const prevPage = session.currentPage - 1;
    
// // //     if (prevPage < 0) {
// // //         return await message.reply(
// // //             `📄 You're already on the first page.\n\n` +
// // //             `Type *Next* to see more products.`
// // //         );
// // //     }

// // //     return await showProductsPage(message, client, prevPage, session.searchTerm);
// // // }

// // // // Helper function to get image file path
// // // async function getImagePath(imageUrl) {
// // //     try {
// // //         console.log(`🔍 Processing image URL: ${imageUrl}`);
        
// // //         let filename;
        
// // //         if (imageUrl.startsWith('/uploads/')) {
// // //             filename = imageUrl.split('/uploads/')[1];
// // //             console.log(`📁 Extracted filename from /uploads/: ${filename}`);
// // //         } else if (!imageUrl.startsWith('http')) {
// // //             filename = imageUrl; // It's just a filename
// // //             console.log(`📁 Using filename directly: ${filename}`);
// // //         } else {
// // //             console.log(`❌ External URL, skipping: ${imageUrl}`);
// // //             return null; // External URL, not handled here
// // //         }

// // //         const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
// // //         console.log(`📁 Full path: ${fullPath}`);
        
// // //         // Check if file exists
// // //         try {
// // //             await readFile(fullPath);
// // //             console.log(`✅ File exists: ${fullPath}`);
// // //             return fullPath;
// // //         } catch (fileError) {
// // //             console.log(`❌ File not found: ${fullPath}`);
// // //             return null;
// // //         }
        
// // //     } catch (error) {
// // //         console.error('❌ Image path error:', error);
// // //         return null;
// // //     }
// // // }

// // // // Helper function to create Media from file using Base64
// // // async function createMediaFromFile(filePath) {
// // //     try {
// // //         console.log(`📸 Creating media from file: ${filePath}`);
// // //         const fileBuffer = await readFile(filePath);
// // //         const base64Data = fileBuffer.toString('base64');
// // //         const ext = path.extname(filePath).toLowerCase().substring(1); // Remove dot
        
// // //         console.log(`📸 File extension: ${ext}, Size: ${fileBuffer.length} bytes`);
        
// // //         const mimeTypes = {
// // //             'jpg': 'image/jpeg',
// // //             'jpeg': 'image/jpeg',
// // //             'png': 'image/png',
// // //             'webp': 'image/webp',
// // //             'gif': 'image/gif'
// // //         };

// // //         const mimeType = mimeTypes[ext] || 'image/jpeg';
// // //         console.log(`📸 MIME type: ${mimeType}`);
        
// // //         return new MessageMedia(mimeType, base64Data);
// // //     } catch (error) {
// // //         console.error('❌ Create media error:', error);
// // //         return null;
// // //     }
// // // }

// // // // Test if images work
// // // export async function handleTestImage(message, client) {
// // //     try {
// // //         // Test with external image first
// // //         const testUrl = 'https://picsum.photos/400/400';
// // //         console.log(`🖼️ Testing external image: ${testUrl}`);
        
// // //         try {
// // //             const media = await MessageMedia.fromUrl(testUrl);
// // //             await message.reply(media, null, { 
// // //                 caption: '🖼️ TEST: If you see this, EXTERNAL images work!' 
// // //             });
// // //         } catch (externalError) {
// // //             await message.reply('❌ External images not working: ' + externalError.message);
// // //         }

// // //         // Test with your uploaded images using Base64
// // //         const products = await Product.find({ 
// // //             isActive: true, 
// // //             imageUrl: { $exists: true, $ne: '' } 
// // //         }).limit(1).lean();

// // //         if (products.length > 0 && products[0].imageUrl) {
// // //             const product = products[0];
// // //             console.log(`🖼️ Testing product image: ${product.imageUrl}`);
            
// // //             const imagePath = await getImagePath(product.imageUrl);
            
// // //             if (imagePath) {
// // //                 try {
// // //                     const media = await createMediaFromFile(imagePath);
// // //                     if (media) {
// // //                         await message.reply(media, null, { 
// // //                             caption: `🖼️ TEST: ${product.productName}\nIf you see this, YOUR images work via Base64!` 
// // //                         });
// // //                         return;
// // //                     }
// // //                 } catch (base64Error) {
// // //                     console.error('❌ Base64 test error:', base64Error);
// // //                     await message.reply(`❌ Base64 image failed: ${base64Error.message}`);
// // //                 }
// // //             } else {
// // //                 await message.reply(`❌ Image file not found: ${product.imageUrl}`);
// // //             }
// // //         } else {
// // //             await message.reply('❌ No product images found in database.');
// // //         }
        
// // //     } catch (error) {
// // //         await message.reply('❌ Image test failed: ' + error.message);
// // //     }
// // // }

// // // // Enhanced copy command
// // // export async function handleCopyCommand(message, client) {
// // //     try {
// // //         const args = message.body.split(' ');
// // //         const productId = args[1];
        
// // //         if (!productId) {
// // //             return await message.reply(
// // //                 `📋 *COPY PRODUCT ID*\n\n` +
// // //                 `Usage: *!copy PRODUCT_ID*\n\n` +
// // //                 `Example: *!copy 691548f89ad6e1218602521*\n\n` +
// // //                 `I'll send the ID in easy-to-copy format.`
// // //             );
// // //         }

// // //         const product = await Product.findById(productId).select('productName price').lean();
// // //         const productName = product ? product.productName : 'Product';
        
// // //         await message.reply(
// // //             `📋 *PRODUCT ID READY TO COPY*\n\n` +
// // //             `*${productName}*\n` +
// // //             `💰 Price: ₹${product?.price || 'N/A'}\n\n` +
// // //             `🆔 *Product ID:*\n` +
// // //             `\`${productId}\`\n\n` +
// // //             `💡 *How to copy:*\n` +
// // //             `1. Tap & hold the ID above\n` +
// // //             `2. Select "Copy"\n` +
// // //             `3. Use in your order\n\n` +
// // //             `🛒 *Order Command:*\n` +
// // //             `Order ${productId} 1`
// // //         );

// // //     } catch (error) {
// // //         console.error('Copy error:', error);
// // //         await message.reply('❌ Copy failed. Please check the Product ID.');
// // //     }
// // // }

// // // // Enhanced quick order
// // // export async function handleQuickOrder(message, client) {
// // //     try {
// // //         const args = message.body.split(' ');
// // //         const productId = args[1];
// // //         const quantity = args[2] || '1';
        
// // //         if (!productId) {
// // //             return await message.reply(
// // //                 `🛒 *QUICK ORDER*\n\n` +
// // //                 `Usage: *!order PRODUCT_ID QUANTITY*\n\n` +
// // //                 `Examples:\n` +
// // //                 `• !order 691548f89ad6e1218602521 1\n` +
// // //                 `• !order 691548f89ad6e1218602521 2`
// // //             );
// // //         }

// // //         const product = await Product.findById(productId);
// // //         if (!product) {
// // //             return await message.reply(
// // //                 `❌ Product not found!\n\n` +
// // //                 `Please check the Product ID or use *!products* to see available products.`
// // //             );
// // //         }

// // //         if (product.stock < quantity) {
// // //             return await message.reply(
// // //                 `❌ *Out of Stock*\n\n` +
// // //                 `*${product.productName}*\n` +
// // //                 `Available: ${product.stock}\n` +
// // //                 `Please choose a different quantity.`
// // //             );
// // //         }

// // //         await message.reply(
// // //             `✅ *ORDER PLACED!*\n\n` +
// // //             `🛍️ *Product:* ${product.productName}\n` +
// // //             `💰 *Price:* ₹${product.price} x ${quantity}\n` +
// // //             `💵 *Total:* ₹${product.price * quantity}\n` +
// // //             `📦 *Quantity:* ${quantity}\n\n` +
// // //             `📞 We'll contact you shortly for shipping details!\n\n` +
// // //             `Thank you for your order! 🎉`
// // //         );

// // //     } catch (error) {
// // //         console.error('Order error:', error);
// // //         await message.reply('❌ Order failed. Please try again.');
// // //     }
// // // }

// // // // Get all product IDs for easy copying
// // // export async function handleAllIds(message, client) {
// // //     try {
// // //         const products = await Product.find({ 
// // //             isActive: true, 
// // //             stock: { $gt: 0 } 
// // //         })
// // //         .sort({ productName: 1 })
// // //         .select('productName _id price')
// // //         .lean();

// // //         if (!products || products.length === 0) {
// // //             return await message.reply('📭 No products available.');
// // //         }

// // //         await message.reply(`📋 *${products.length} Products Available*\n\nAll IDs formatted for easy copying:`);

// // //         // Send products in batches
// // //         for (let i = 0; i < products.length; i++) {
// // //             const product = products[i];
            
// // //             const idMessage = 
// // //                 `📋 *${i + 1}. ${product.productName}*\n` +
// // //                 `💰 Price: ₹${product.price}\n\n` +
// // //                 `🆔 *COPY ID:*\n` +
// // //                 `\`${product._id}\`\n\n` +
// // //                 `🛒 Order ${product._id} 1\n` +
// // //                 `────────────────────`;
            
// // //             await message.reply(idMessage);
            
// // //             if (i < products.length - 1) {
// // //                 await new Promise(resolve => setTimeout(resolve, 1000));
// // //             }
// // //         }

// // //         await message.reply(
// // //             `💡 *HOW TO ORDER:*\n\n` +
// // //             `1. Copy any Product ID above\n` +
// // //             `2. Type: Order PRODUCT_ID QUANTITY\n\n` +
// // //             `*Example:*\n` +
// // //             `Order ${products[0]._id} 2\n\n` +
// // //             `Need help? Type *support*`
// // //         );

// // //     } catch (error) {
// // //         console.error('All IDs error:', error);
// // //         await message.reply('❌ Failed to fetch products.');
// // //     }
// // // }

// // // // Simple button response handler (no actual buttons)
// // // export async function handleButtonResponse(message, client) {
// // //     await message.reply(
// // //         `📋 *Copy Feature*\n\n` +
// // //         `To copy Product IDs:\n` +
// // //         `1. Use !products to see all products\n` +
// // //         `2. Tap & hold any Product ID\n` +
// // //         `3. Select "Copy"\n` +
// // //         `4. Use in your order command\n\n` +
// // //         `🛒 *Quick Order:*\n` +
// // //         `!order PRODUCT_ID QUANTITY`
// // //     );
// // // }

// // // // Clean up old product sessions
// // // function cleanupProductSessions() {
// // //     const now = Date.now();
// // //     const oneHour = 60 * 60 * 1000;
    
// // //     for (const [phone, session] of productSessions.entries()) {
// // //         if (now - session.lastActivity > oneHour) {
// // //             productSessions.delete(phone);
// // //             console.log(`🧹 Cleaned up product session for: ${phone}`);
// // //         }
// // //     }
// // // }

// // // // Run cleanup every hour
// // // setInterval(cleanupProductSessions, 60 * 60 * 1000);




// // import Product from '../../models/Product.js';
// // import pkg from 'whatsapp-web.js';
// // const { MessageMedia } = pkg;
// // import { readFile } from 'fs/promises';
// // import path from 'path';

// // // User product sessions for pagination
// // const productSessions = new Map();

// // export async function handleProducts(message, client) { 
// //     try {
// //         const userMessage = message.body.trim();
// //         const from = message.from;
// //         const lowerMessage = userMessage.toLowerCase();
        
// //         // Handle search functionality
// //         if (lowerMessage.startsWith('products ') || lowerMessage.startsWith('product ')) {
// //             const searchTerm = userMessage.replace(/^(products?)\s+/i, '').trim();
// //             if (searchTerm.length > 0) {
// //                 return await handleProductSearch(message, client, searchTerm);
// //             }
// //         }

// //         // Handle pagination commands
// //         if (lowerMessage === 'next' || lowerMessage === 'more' || lowerMessage === 'more products') {
// //             return await handleNextPage(message, client);
// //         }
        
// //         if (lowerMessage === 'prev' || lowerMessage === 'previous' || lowerMessage === 'back') {
// //             return await handlePrevPage(message, client);
// //         }

// //         // Default products listing with pagination
// //         return await showProductsPage(message, client, 0);

// //     } catch (error) {
// //         console.error('❌ Error showing products:', error);
// //         await message.reply('❌ Error loading products. Please try again.');
// //     }
// // }

// // // Handle direct product name search (exported for message handler)
// // export async function handleDirectProductSearch(message, client, productName) {
// //     try {
// //         console.log(`🔍 Direct product search: "${productName}"`);
        
// //         // Clean the product name - remove extra spaces and make case insensitive
// //         const cleanProductName = productName.replace(/\s+/g, ' ').trim().toLowerCase();
        
// //         if (cleanProductName.length < 2) {
// //             return false; // Let main handler handle this
// //         }

// //         // First try exact match
// //         let products = await Product.find({
// //             isActive: true,
// //             stock: { $gt: 0 },
// //             $or: [
// //                 { productName: { $regex: `^${cleanProductName}$`, $options: 'i' } },
// //                 { productName: { $regex: cleanProductName, $options: 'i' } }
// //             ]
// //         })
// //         .sort({ productName: 1 })
// //         .limit(10)
// //         .lean();

// //         // If no exact matches, try fuzzy search
// //         if (products.length === 0) {
// //             products = await Product.find({
// //                 isActive: true,
// //                 stock: { $gt: 0 },
// //                 $or: [
// //                     { productName: { $regex: cleanProductName.split(' ').join('.*'), $options: 'i' } },
// //                     { category: { $regex: cleanProductName, $options: 'i' } },
// //                     { description: { $regex: cleanProductName, $options: 'i' } },
// //                     { tags: { $regex: cleanProductName, $options: 'i' } }
// //                 ]
// //             })
// //             .sort({ productName: 1 })
// //             .limit(10)
// //             .lean();
// //         }

// //         // If still no products, try partial word matching
// //         if (products.length === 0) {
// //             const words = cleanProductName.split(' ').filter(word => word.length > 2);
// //             if (words.length > 0) {
// //                 const regexPattern = words.join('|');
// //                 products = await Product.find({
// //                     isActive: true,
// //                     stock: { $gt: 0 },
// //                     $or: [
// //                         { productName: { $regex: regexPattern, $options: 'i' } },
// //                         { category: { $regex: regexPattern, $options: 'i' } }
// //                     ]
// //                 })
// //                 .sort({ productName: 1 })
// //                 .limit(10)
// //                 .lean();
// //             }
// //         }

// //         if (products.length === 0) {
// //             // No products found, let main handler continue
// //             return false;
// //         }

// //         // Found matching products!
// //         if (products.length === 1) {
// //             // Single product found - show it directly
// //             const product = products[0];
// //             await sendSingleProduct(message, product, `🔍 Found product for "${productName}":`);
            
// //             await message.reply(
// //                 `💡 *Found exactly what you're looking for!*\n\n` +
// //                 `🛒 *To order this product:*\n` +
// //                 `Type *Order* and I'll guide you through the ordering process!\n\n` +
// //                 `📋 *Other options:*\n` +
// //                 `• Type *Products* to see all products\n` +
// //                 `• Type *Products ${productName}* for more similar items\n` +
// //                 `• Search for other product names`
// //             );
// //             return true;
// //         } else {
// //             // Multiple products found - show as search results
// //             return await showProductsPage(message, client, 0, cleanProductName, `🔍 Search results for "${productName}":`);
// //         }

// //     } catch (error) {
// //         console.error('❌ Direct search error:', error);
// //         return false; // Let main handler continue
// //     }
// // }

// // async function showProductsPage(message, client, page = 0, searchTerm = '', customTitle = '') {
// //     try {
// //         const from = message.from;
// //         const limit = 6; // Products per page
// //         const skip = page * limit;

// //         // Build query
// //         let query = { 
// //             isActive: true, 
// //             stock: { $gt: 0 } 
// //         };

// //         if (searchTerm) {
// //             const cleanSearchTerm = searchTerm.replace(/\s+/g, ' ').trim();
// //             const words = cleanSearchTerm.split(' ').filter(word => word.length > 0);
            
// //             if (words.length > 0) {
// //                 // Create search conditions for each word
// //                 const searchConditions = [];
                
// //                 words.forEach(word => {
// //                     if (word.length > 2) {
// //                         searchConditions.push(
// //                             { productName: { $regex: word, $options: 'i' } },
// //                             { category: { $regex: word, $options: 'i' } },
// //                             { description: { $regex: word, $options: 'i' } }
// //                         );
// //                     }
// //                 });

// //                 query.$or = searchConditions.length > 0 ? searchConditions : [
// //                     { productName: { $regex: cleanSearchTerm, $options: 'i' } }
// //                 ];
// //             }
// //         }

// //         const [products, totalCount] = await Promise.all([
// //             Product.find(query)
// //                 .sort({ 
// //                     // Prioritize exact matches first, then partial matches
// //                     [searchTerm ? 'productName' : 'createdAt']: searchTerm ? 1 : -1 
// //                 })
// //                 .skip(skip)
// //                 .limit(limit)
// //                 .lean(),
// //             Product.countDocuments(query)
// //         ]);

// //         if (!products || products.length === 0) {
// //             const noProductsMessage = searchTerm 
// //                 ? `📭 No products found for "${searchTerm}". Try:\n\n• Different spelling\n• Shorter search term\n• Type *Products* to see all items`
// //                 : '📭 No products available right now.';
// //             return await message.reply(noProductsMessage);
// //         }

// //         const totalPages = Math.ceil(totalCount / limit);
// //         const currentPage = page + 1;

// //         // Store pagination session
// //         productSessions.set(from, {
// //             currentPage: page,
// //             totalPages: totalPages,
// //             searchTerm: searchTerm,
// //             lastActivity: Date.now()
// //         });

// //         // Send intro message
// //         let introMessage = customTitle || `🛍️ *Our Products* \n\n`;
        
// //         if (searchTerm && !customTitle) {
// //             introMessage += `🔍 Search: "${searchTerm}"\n`;
// //         }
        
// //         introMessage += `📄 Page ${currentPage} of ${totalPages}\n`;
// //         introMessage += `📦 Showing ${products.length} of ${totalCount} products\n\n`;
// //         introMessage += `📋 *Easy Ordering:*\n`;
// //         introMessage += `• Type *Order* to start ordering process\n`;
// //         introMessage += `• I'll guide you step by step\n`;
// //         introMessage += `• No need to remember Product IDs\n\n`;

// //         if (totalPages > 1) {
// //             introMessage += `📖 *Navigation:*\n`;
// //             introMessage += `• Type *Next* for more products\n`;
// //             if (page > 0) introMessage += `• Type *Prev* for previous page\n`;
// //             introMessage += `\n`;
// //         }

// //         await message.reply(introMessage);

// //         // Send each product
// //         for (let i = 0; i < products.length; i++) {
// //             const product = products[i];
// //             const productNumber = skip + i + 1;
// //             await sendProduct(message, product, productNumber);
            
// //             // Wait between messages
// //             if (i < products.length - 1) {
// //                 await new Promise(resolve => setTimeout(resolve, 1500));
// //             }
// //         }

// //         // Send navigation and instructions
// //         let footerMessage = `🎯 *READY TO ORDER?*\n\n`;
// //         footerMessage += `Simply type *Order* and I'll guide you through:\n\n`;
// //         footerMessage += `1. Product selection\n`;
// //         footerMessage += `2. Quantity choice\n`;
// //         footerMessage += `3. Customization (if available)\n`;
// //         footerMessage += `4. Shipping address\n`;
// //         footerMessage += `5. Payment instructions\n\n`;
        
// //         if (totalPages > 1) {
// //             footerMessage += `🔄 *Navigation Commands:*\n`;
// //             if (page < totalPages - 1) footerMessage += `• *Next* - More products\n`;
// //             if (page > 0) footerMessage += `• *Prev* - Previous page\n`;
// //             footerMessage += `\n`;
// //         }

// //         footerMessage += `💡 *Quick Commands:*\n`;
// //         footerMessage += `• *Order* - Start ordering process\n`;
// //         footerMessage += `• *Products* - Browse all products\n`;
// //         footerMessage += `• *Products [name]* - Search products\n`;
// //         footerMessage += `• *Type product name* - Direct search\n`;

// //         await message.reply(footerMessage);

// //     } catch (error) {
// //         console.error('❌ Error showing products page:', error);
// //         throw error;
// //     }
// // }

// // async function handleProductSearch(message, client, searchTerm) {
// //     try {
// //         // Clean up search term - remove extra spaces and make case insensitive
// //         const cleanSearchTerm = searchTerm.replace(/\s+/g, ' ').trim().toLowerCase();
        
// //         if (cleanSearchTerm.length < 2) {
// //             return await message.reply(
// //                 `🔍 *Search Tip:*\n\n` +
// //                 `Please use at least 2 characters for search.\n\n` +
// //                 `Examples:\n` +
// //                 `• *Products poster*\n` +
// //                 `• *Products anime*\n` +
// //                 `• *Products landscape*\n` +
// //                 `• *Or just type: neem soap* (direct search)\n\n` +
// //                 `💡 *To order:* Just type *Order*`
// //             );
// //         }

// //         return await showProductsPage(message, client, 0, cleanSearchTerm);

// //     } catch (error) {
// //         console.error('❌ Search error:', error);
// //         await message.reply('❌ Search failed. Please try again.');
// //     }
// // }

// // async function sendSingleProduct(message, product, title = '') {
// //     try {
// //         const productText = 
// //             `${title ? title + '\n\n' : ''}` +
// //             `*${product.productName}*\n\n` +
// //             `💰 *Price:* ₹${product.price}\n` +
// //             `📦 *Stock:* ${product.stock} available\n` +
// //             `🏷️ *Category:* ${product.category || 'General'}\n` +
// //             `📝 *Description:* ${product.description || 'Premium quality product'}\n` +
// //             (product.options ? `⚙️ *Options:* ${product.options}\n` : '') +
// //             `\n────────────────────\n` +
// //             `🛒 *Ready to order this product?*\n\n` +
// //             `Simply type *Order* and I'll guide you through the ordering process!\n\n` +
// //             `💡 No need to remember Product ID - I'll help you select everything!` +
// //             `\n────────────────────`;

// //         // Try to send image using Base64 (NO URLS)
// //         if (product.imageUrl) {
// //             try {
// //                 const imagePath = await getImagePath(product.imageUrl);
// //                 if (imagePath) {
// //                     console.log(`🖼️ Reading image file: ${imagePath}`);
// //                     const media = await createMediaFromFile(imagePath);
// //                     if (media) {
// //                         await message.reply(media, null, { caption: productText });
// //                         console.log(`✅ Image sent via Base64: ${product.productName}`);
// //                         return;
// //                     }
// //                 } else {
// //                     console.log(`❌ Image path not found for: ${product.imageUrl}`);
// //                 }
// //             } catch (imageError) {
// //                 console.error(`❌ Base64 image failed:`, imageError.message);
// //             }
// //         }

// //         // Fallback to text only
// //         await message.reply(productText);
// //         console.log(`📝 Text only sent: ${product.productName}`);

// //     } catch (error) {
// //         console.error(`❌ Error with product:`, error);
// //         await message.reply(
// //             `🛍️ *${product.productName}*\n` +
// //             `💰 Price: ₹${product.price}\n` +
// //             `📦 Stock: ${product.stock}\n\n` +
// //             `🛒 *To order:* Type *Order* and I'll guide you!\n\n` +
// //             `No need to remember Product IDs - I'll help you step by step!`
// //         );
// //     }
// // }

// // async function sendProduct(message, product, index) {
// //     await sendSingleProduct(message, product, `*${index}. ${product.productName}*`);
// // }

// // async function handleNextPage(message, client) {
// //     const from = message.from;
// //     const session = productSessions.get(from);
    
// //     if (!session) {
// //         return await showProductsPage(message, client, 0);
// //     }

// //     const nextPage = session.currentPage + 1;
    
// //     if (nextPage >= session.totalPages) {
// //         return await message.reply(
// //             `📄 You're on the last page (${session.totalPages} of ${session.totalPages}).\n\n` +
// //             `Type *Prev* to go back or *Products* to start over.\n\n` +
// //             `🛒 *Ready to order?* Type *Order* to begin!`
// //         );
// //     }

// //     return await showProductsPage(message, client, nextPage, session.searchTerm);
// // }

// // async function handlePrevPage(message, client) {
// //     const from = message.from;
// //     const session = productSessions.get(from);
    
// //     if (!session) {
// //         return await showProductsPage(message, client, 0);
// //     }

// //     const prevPage = session.currentPage - 1;
    
// //     if (prevPage < 0) {
// //         return await message.reply(
// //             `📄 You're already on the first page.\n\n` +
// //             `Type *Next* to see more products.\n\n` +
// //             `🛒 *Ready to order?* Type *Order* to begin!`
// //         );
// //     }

// //     return await showProductsPage(message, client, prevPage, session.searchTerm);
// // }

// // // Helper function to get image file path
// // async function getImagePath(imageUrl) {
// //     try {
// //         console.log(`🔍 Processing image URL: ${imageUrl}`);
        
// //         let filename;
        
// //         if (imageUrl.startsWith('/uploads/')) {
// //             filename = imageUrl.split('/uploads/')[1];
// //             console.log(`📁 Extracted filename from /uploads/: ${filename}`);
// //         } else if (!imageUrl.startsWith('http')) {
// //             filename = imageUrl; // It's just a filename
// //             console.log(`📁 Using filename directly: ${filename}`);
// //         } else {
// //             console.log(`❌ External URL, skipping: ${imageUrl}`);
// //             return null; // External URL, not handled here
// //         }

// //         const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
// //         console.log(`📁 Full path: ${fullPath}`);
        
// //         // Check if file exists
// //         try {
// //             await readFile(fullPath);
// //             console.log(`✅ File exists: ${fullPath}`);
// //             return fullPath;
// //         } catch (fileError) {
// //             console.log(`❌ File not found: ${fullPath}`);
// //             return null;
// //         }
        
// //     } catch (error) {
// //         console.error('❌ Image path error:', error);
// //         return null;
// //     }
// // }

// // // Helper function to create Media from file using Base64
// // async function createMediaFromFile(filePath) {
// //     try {
// //         console.log(`📸 Creating media from file: ${filePath}`);
// //         const fileBuffer = await readFile(filePath);
// //         const base64Data = fileBuffer.toString('base64');
// //         const ext = path.extname(filePath).toLowerCase().substring(1); // Remove dot
        
// //         console.log(`📸 File extension: ${ext}, Size: ${fileBuffer.length} bytes`);
        
// //         const mimeTypes = {
// //             'jpg': 'image/jpeg',
// //             'jpeg': 'image/jpeg',
// //             'png': 'image/png',
// //             'webp': 'image/webp',
// //             'gif': 'image/gif'
// //         };

// //         const mimeType = mimeTypes[ext] || 'image/jpeg';
// //         console.log(`📸 MIME type: ${mimeType}`);
        
// //         return new MessageMedia(mimeType, base64Data);
// //     } catch (error) {
// //         console.error('❌ Create media error:', error);
// //         return null;
// //     }
// // }

// // // Test if images work
// // export async function handleTestImage(message, client) {
// //     try {
// //         // Test with external image first
// //         const testUrl = 'https://picsum.photos/400/400';
// //         console.log(`🖼️ Testing external image: ${testUrl}`);
        
// //         try {
// //             const media = await MessageMedia.fromUrl(testUrl);
// //             await message.reply(media, null, { 
// //                 caption: '🖼️ TEST: If you see this, EXTERNAL images work!' 
// //             });
// //         } catch (externalError) {
// //             await message.reply('❌ External images not working: ' + externalError.message);
// //         }

// //         // Test with your uploaded images using Base64
// //         const products = await Product.find({ 
// //             isActive: true, 
// //             imageUrl: { $exists: true, $ne: '' } 
// //         }).limit(1).lean();

// //         if (products.length > 0 && products[0].imageUrl) {
// //             const product = products[0];
// //             console.log(`🖼️ Testing product image: ${product.imageUrl}`);
            
// //             const imagePath = await getImagePath(product.imageUrl);
            
// //             if (imagePath) {
// //                 try {
// //                     const media = await createMediaFromFile(imagePath);
// //                     if (media) {
// //                         await message.reply(media, null, { 
// //                             caption: `🖼️ TEST: ${product.productName}\nIf you see this, YOUR images work via Base64!` 
// //                         });
// //                         return;
// //                     }
// //                 } catch (base64Error) {
// //                     console.error('❌ Base64 test error:', base64Error);
// //                     await message.reply(`❌ Base64 image failed: ${base64Error.message}`);
// //                 }
// //             } else {
// //                 await message.reply(`❌ Image file not found: ${product.imageUrl}`);
// //             }
// //         } else {
// //             await message.reply('❌ No product images found in database.');
// //         }
        
// //     } catch (error) {
// //         await message.reply('❌ Image test failed: ' + error.message);
// //     }
// // }

// // // Enhanced copy command - Updated to guide users to use "Order"
// // export async function handleCopyCommand(message, client) {
// //     try {
// //         const args = message.body.split(' ');
// //         const productId = args[1];
        
// //         if (!productId) {
// //             return await message.reply(
// //                 `📋 *PRODUCT ORDERING*\n\n` +
// //                 `No need to copy Product IDs! 🎉\n\n` +
// //                 `💡 *Easy Ordering Process:*\n` +
// //                 `1. Type *Order* to start\n` +
// //                 `2. I'll guide you step by step\n` +
// //                 `3. Select products from menu\n` +
// //                 `4. Choose quantity\n` +
// //                 `5. Provide shipping details\n\n` +
// //                 `🛒 *Start ordering now:* Type *Order*`
// //             );
// //         }

// //         const product = await Product.findById(productId).select('productName price').lean();
// //         const productName = product ? product.productName : 'Product';
        
// //         await message.reply(
// //             `📋 *PRODUCT FOUND!*\n\n` +
// //             `*${productName}*\n` +
// //             `💰 Price: ₹${product?.price || 'N/A'}\n\n` +
// //             `🎯 *Ready to order this product?*\n\n` +
// //             `Simply type *Order* and I'll guide you through the complete ordering process!\n\n` +
// //             `💡 No need to remember Product IDs - I'll help you select everything step by step!`
// //         );

// //     } catch (error) {
// //         console.error('Copy error:', error);
// //         await message.reply(
// //             `❌ Product not found!\n\n` +
// //             `💡 *Better way to order:*\n` +
// //             `Type *Order* and I'll show you all available products to choose from!\n\n` +
// //             `No need to remember Product IDs - I'll guide you through everything!`
// //         );
// //     }
// // }

// // // Enhanced quick order - Updated to guide users to use "Order"
// // export async function handleQuickOrder(message, client) {
// //     try {
// //         const args = message.body.split(' ');
// //         const productId = args[1];
        
// //         if (!productId) {
// //             return await message.reply(
// //                 `🛒 *QUICK ORDER GUIDE*\n\n` +
// //                 `Let me help you order easily! 🎯\n\n` +
// //                 `💡 *Simple Ordering Process:*\n` +
// //                 `1. Type *Order* to begin\n` +
// //                 `2. Browse available products\n` +
// //                 `3. Select what you want\n` +
// //                 `4. Choose quantity\n` +
// //                 `5. Provide shipping details\n` +
// //                 `6. Complete payment\n\n` +
// //                 `🎉 *Start ordering:* Type *Order*`
// //             );
// //         }

// //         await message.reply(
// //             `🛒 *ORDERING MADE EASY!*\n\n` +
// //             `No need to use Product IDs! 🎉\n\n` +
// //             `💡 *Better way to order:*\n` +
// //             `Type *Order* and I'll show you all available products with images, prices, and descriptions!\n\n` +
// //             `You can:\n` +
// //             `• Browse all products\n` +
// //             `• See product images\n` +
// //             `• Check availability\n` +
// //             `• Get step-by-step guidance\n\n` +
// //             `🎯 *Start now:* Type *Order*`
// //         );

// //     } catch (error) {
// //         console.error('Order error:', error);
// //         await message.reply(
// //             `❌ Let me help you order properly!\n\n` +
// //             `💡 *Easy Ordering:*\n` +
// //             `Type *Order* and I'll guide you through:\n\n` +
// //             `1. Product selection from menu\n` +
// //             `2. Quantity choice\n` +
// //             `3. Customization options\n` +
// //             `4. Shipping address\n` +
// //             `5. Payment instructions\n\n` +
// //             `🎉 *Start ordering:* Type *Order*`
// //         );
// //     }
// // }

// // // Get all product IDs for easy copying - Updated to guide users to use "Order"
// // export async function handleAllIds(message, client) {
// //     try {
// //         const products = await Product.find({ 
// //             isActive: true, 
// //             stock: { $gt: 0 } 
// //         })
// //         .sort({ productName: 1 })
// //         .select('productName _id price')
// //         .lean();

// //         if (!products || products.length === 0) {
// //             return await message.reply('📭 No products available right now.');
// //         }

// //         await message.reply(`🛍️ *${products.length} Products Available*\n\nBrowse our collection and order easily!`);

// //         // Send products in batches
// //         for (let i = 0; i < products.length; i++) {
// //             const product = products[i];
            
// //             const idMessage = 
// //                 `📋 *${i + 1}. ${product.productName}*\n` +
// //                 `💰 Price: ₹${product.price}\n\n` +
// //                 `🛒 *Ready to order?* Type *Order* and I'll help you select this product!\n` +
// //                 `────────────────────`;
            
// //             await message.reply(idMessage);
            
// //             if (i < products.length - 1) {
// //                 await new Promise(resolve => setTimeout(resolve, 1000));
// //             }
// //         }

// //         await message.reply(
// //             `🎯 *READY TO ORDER? IT'S EASY!*\n\n` +
// //             `Simply type *Order* and I'll guide you through:\n\n` +
// //             `1. Product selection from the menu\n` +
// //             `2. Quantity choice\n` +
// //             `3. Customization (if available)\n` +
// //             `4. Shipping address collection\n` +
// //             `5. Payment instructions\n\n` +
// //             `💡 *Benefits:*\n` +
// //             `• No need to remember Product IDs\n` +
// //             `• See product images\n` +
// //             `• Step-by-step guidance\n` +
// //             `• Easy payment process\n\n` +
// //             `🛒 *Start ordering now:* Type *Order*`
// //         );

// //     } catch (error) {
// //         console.error('All IDs error:', error);
// //         await message.reply('❌ Failed to fetch products. Please try typing *Order* to start the ordering process.');
// //     }
// // }

// // // Simple button response handler (no actual buttons)
// // export async function handleButtonResponse(message, client) {
// //     await message.reply(
// //         `🛒 *EASY ORDERING PROCESS*\n\n` +
// //         `No need for complex commands! 🎉\n\n` +
// //         `💡 *Simple way to order:*\n` +
// //         `1. Type *Order* to begin\n` +
// //         `2. I'll guide you step by step\n` +
// //         `3. Select from available products\n` +
// //         `4. Choose quantity\n` +
// //         `5. Provide shipping details\n` +
// //         `6. Complete payment\n\n` +
// //         `🎯 *Start ordering:* Type *Order*`
// //     );
// // }

// // // Clean up old product sessions
// // function cleanupProductSessions() {
// //     const now = Date.now();
// //     const oneHour = 60 * 60 * 1000;
    
// //     for (const [phone, session] of productSessions.entries()) {
// //         if (now - session.lastActivity > oneHour) {
// //             productSessions.delete(phone);
// //             console.log(`🧹 Cleaned up product session for: ${phone}`);
// //         }
// //     }
// // }

// // // Run cleanup every hour
// // setInterval(cleanupProductSessions, 60 * 60 * 1000);



// import Product from '../../models/Product.js';
// import pkg from 'whatsapp-web.js';
// const { MessageMedia } = pkg;
// import { readFile } from 'fs/promises';
// import path from 'path';
// import sharp from 'sharp';

// // User product sessions for pagination
// const productSessions = new Map();

// export async function handleProducts(message, client) { 
//     try {
//         const userMessage = message.body.trim();
//         const from = message.from;
//         const lowerMessage = userMessage.toLowerCase();
        
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

// // Handle direct product name search (exported for message handler)
// export async function handleDirectProductSearch(message, client, productName) {
//     try {
//         console.log(`🔍 Direct product search: "${productName}"`);
        
//         // Clean the product name - remove extra spaces and make case insensitive
//         const cleanProductName = productName.replace(/\s+/g, ' ').trim().toLowerCase();
        
//         if (cleanProductName.length < 2) {
//             return false; // Let main handler handle this
//         }

//         // First try exact match
//         let products = await Product.find({
//             isActive: true,
//             stock: { $gt: 0 },
//             $or: [
//                 { productName: { $regex: `^${cleanProductName}$`, $options: 'i' } },
//                 { productName: { $regex: cleanProductName, $options: 'i' } }
//             ]
//         })
//         .sort({ productName: 1 })
//         .limit(10)
//         .lean();

//         // If no exact matches, try fuzzy search
//         if (products.length === 0) {
//             products = await Product.find({
//                 isActive: true,
//                 stock: { $gt: 0 },
//                 $or: [
//                     { productName: { $regex: cleanProductName.split(' ').join('.*'), $options: 'i' } },
//                     { category: { $regex: cleanProductName, $options: 'i' } },
//                     { description: { $regex: cleanProductName, $options: 'i' } }
//                 ]
//             })
//             .sort({ productName: 1 })
//             .limit(10)
//             .lean();
//         }

//         // If still no products, try partial word matching
//         if (products.length === 0) {
//             const words = cleanProductName.split(' ').filter(word => word.length > 2);
//             if (words.length > 0) {
//                 const regexPattern = words.join('|');
//                 products = await Product.find({
//                     isActive: true,
//                     stock: { $gt: 0 },
//                     $or: [
//                         { productName: { $regex: regexPattern, $options: 'i' } },
//                         { category: { $regex: regexPattern, $options: 'i' } }
//                     ]
//                 })
//                 .sort({ productName: 1 })
//                 .limit(10)
//                 .lean();
//             }
//         }

//         if (products.length === 0) {
//             // No products found, let main handler continue
//             return false;
//         }

//         // Found matching products!
//         if (products.length === 1) {
//             // Single product found - show it directly
//             const product = products[0];
//             await sendProductSmart(message, client, product, `🔍 Found product for "${productName}":`);
            
//             await message.reply(
//                 `💡 *Found exactly what you're looking for!*\n\n` +
//                 `🛒 *To order this product:*\n` +
//                 `Type *Order* and I'll guide you through the ordering process!\n\n` +
//                 `📋 *Other options:*\n` +
//                 `• Type *Products* to see all products\n` +
//                 `• Type *Products ${productName}* for more similar items\n` +
//                 `• Search for other product names`
//             );
//             return true;
//         } else {
//             // Multiple products found - show as search results
//             return await showProductsPage(message, client, 0, cleanProductName, `🔍 Search results for "${productName}":`);
//         }

//     } catch (error) {
//         console.error('❌ Direct search error:', error);
//         return false; // Let main handler continue
//     }
// }

// async function showProductsPage(message, client, page = 0, searchTerm = '', customTitle = '') {
//     try {
//         const from = message.from;
//         const limit = 6; // Products per page
//         const skip = page * limit;

//         // Build query
//         let query = { 
//             isActive: true, 
//             stock: { $gt: 0 } 
//         };

//         if (searchTerm) {
//             const cleanSearchTerm = searchTerm.replace(/\s+/g, ' ').trim();
//             const words = cleanSearchTerm.split(' ').filter(word => word.length > 0);
            
//             if (words.length > 0) {
//                 // Create search conditions for each word
//                 const searchConditions = [];
                
//                 words.forEach(word => {
//                     if (word.length > 2) {
//                         searchConditions.push(
//                             { productName: { $regex: word, $options: 'i' } },
//                             { category: { $regex: word, $options: 'i' } },
//                             { description: { $regex: word, $options: 'i' } }
//                         );
//                     }
//                 });

//                 query.$or = searchConditions.length > 0 ? searchConditions : [
//                     { productName: { $regex: cleanSearchTerm, $options: 'i' } }
//                 ];
//             }
//         }

//         const [products, totalCount] = await Promise.all([
//             Product.find(query)
//                 .sort({ 
//                     [searchTerm ? 'productName' : 'createdAt']: searchTerm ? 1 : -1 
//                 })
//                 .skip(skip)
//                 .limit(limit)
//                 .lean(),
//             Product.countDocuments(query)
//         ]);

//         if (!products || products.length === 0) {
//             const noProductsMessage = searchTerm 
//                 ? `📭 No products found for "${searchTerm}". Try:\n\n• Different spelling\n• Shorter search term\n• Type *Products* to see all items`
//                 : '📭 No products available right now.';
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

//         // Send each product with smart image handling
//         for (let i = 0; i < products.length; i++) {
//             const product = products[i];
//             const productNumber = skip + i + 1;
//             await sendProductSmart(message, client, product, `*${productNumber}. ${product.productName}*`);
            
//             // Wait between product sets
//             if (i < products.length - 1) {
//                 await new Promise(resolve => setTimeout(resolve, 2000));
//             }
//         }

//         // Send navigation and instructions
//         let footerMessage = `🎯 *READY TO ORDER?*\n\n`;
//         footerMessage += `Simply type *Order* and I'll guide you through:\n\n`;
//         footerMessage += `1. Product selection\n`;
//         footerMessage += `2. Quantity choice\n`;
//         footerMessage += `3. Customization (if available)\n`;
//         footerMessage += `4. Shipping address\n`;
//         footerMessage += `5. Payment instructions\n\n`;
        
//         if (totalPages > 1) {
//             footerMessage += `🔄 *Navigation Commands:*\n`;
//             if (page < totalPages - 1) footerMessage += `• *Next* - More products\n`;
//             if (page > 0) footerMessage += `• *Prev* - Previous page\n`;
//             footerMessage += `\n`;
//         }

//         footerMessage += `💡 *Quick Commands:*\n`;
//         footerMessage += `• *Order* - Start ordering process\n`;
//         footerMessage += `• *Products* - Browse all products\n`;
//         footerMessage += `• *Products [name]* - Search products\n`;
//         footerMessage += `• *Type product name* - Direct search\n`;

//         await message.reply(footerMessage);

//     } catch (error) {
//         console.error('❌ Error showing products page:', error);
//         throw error;
//     }
// }

// // SMART FUNCTION: Intelligently handles single vs multiple images
// async function sendProductSmart(message, client, product, title = '') {
//     try {
//         const productImages = product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
//         const imageCount = productImages.length;
        
//         // Create product description WITH PRODUCT ID
//         const productText = 
//             `${title ? title + '\n\n' : ''}` +
//             `🆔 *Product ID:* ${product._id}\n` +
//             `*${product.productName}*\n\n` +
//             `💰 *Price:* ₹${product.price}\n` +
//             `📦 *Stock:* ${product.stock} available\n` +
//             `🏷️ *Category:* ${product.category || 'General'}\n` +
//             `📝 *Description:* ${product.description || 'Premium quality product'}\n` +
//             (product.options ? `⚙️ *Options:* ${product.options}\n` : '') +
//             `\n────────────────────\n` +
//             `🛒 *Ready to order?* Type *Order* to begin!`;

//         // If no images, send text only
//         if (imageCount === 0) {
//             await message.reply(productText);
//             console.log(`📝 Text only sent: ${product.productName} (ID: ${product._id})`);
//             return;
//         }

//         console.log(`🖼️ Smart handling ${imageCount} image(s) for: ${product.productName} (ID: ${product._id})`);

//         // STRATEGY 1: Single image - send in one message with caption
//         if (imageCount === 1) {
//             await sendSingleImageWithDescription(message, productImages[0], productText, product.productName, product._id);
//         } 
//         // STRATEGY 2: Multiple images - create swipe gallery
//         else {
//             await sendMultipleImagesGallery(message, client, productImages, productText, product.productName, product._id);
//         }

//     } catch (error) {
//         console.error(`❌ Error sending product:`, error);
//         await sendProductFallback(message, client, product, title);
//     }
// }

// // STRATEGY 1: Single image with description as caption
// async function sendSingleImageWithDescription(message, imageUrl, productText, productName, productId) {
//     try {
//         const imagePath = await getImagePath(imageUrl);
//         if (imagePath) {
//             const optimizedPath = await optimizeImageForWhatsApp(imagePath);
//             const media = await createMediaFromFile(optimizedPath);
            
//             if (media) {
//                 // Single image: Send image with full description as caption
//                 await message.reply(media, null, { caption: productText });
//                 console.log(`✅ Single image sent with description: ${productName} (ID: ${productId})`);
//                 return;
//             }
//         }
        
//         // Fallback: Send text only if image fails
//         await message.reply(productText);
//         console.log(`📝 Text only (image failed): ${productName} (ID: ${productId})`);
        
//     } catch (error) {
//         console.error(`❌ Single image failed:`, error);
//         await message.reply(productText);
//     }
// }

// // STRATEGY 2: Multiple images - images first, then description
// async function sendMultipleImagesGallery(message, client, productImages, productText, productName, productId) {
//     try {
//         const imageCount = productImages.length;
        
//         console.log(`🔄 Creating gallery with ${imageCount} images for: ${productName} (ID: ${productId})`);
        
//         // STEP 1: Send all images quickly for swipe gallery
//         let successfulImages = 0;
        
//         for (let i = 0; i < imageCount; i++) {
//             const imagePath = await getImagePath(productImages[i]);
//             if (imagePath) {
//                 try {
//                     const optimizedPath = await optimizeImageForWhatsApp(imagePath);
//                     const media = await createMediaFromFile(optimizedPath);
                    
//                     if (media) {
//                         // Send image without caption for clean gallery
//                         await message.reply(media);
//                         successfulImages++;
//                         console.log(`✅ Gallery image ${i + 1}/${imageCount} sent: ${productName} (ID: ${productId})`);
                        
//                         // Perfect timing for WhatsApp grouping
//                         if (i < imageCount - 1) {
//                             await new Promise(resolve => setTimeout(resolve, 200));
//                         }
//                     }
//                 } catch (imageError) {
//                     console.error(`❌ Gallery image ${i + 1} failed:`, imageError.message);
//                 }
//             }
//         }

//         // STEP 2: Wait then send product description with gallery info
//         await new Promise(resolve => setTimeout(resolve, 300));
        
//         if (successfulImages > 0) {
//             const galleryText = productText + 
//                 `\n\n📸 *Image Gallery (${successfulImages} views):*\n` +
//                 `• Tap any image above to open gallery\n` +
//                 `• Swipe left/right to view all images\n` +
//                 `• Shows different angles of the product`;
                
//             await message.reply(galleryText);
//             console.log(`✅ Gallery created with ${successfulImages} images + description: ${productName} (ID: ${productId})`);
//         } else {
//             // Fallback if no images sent
//             await message.reply(productText);
//         }

//     } catch (error) {
//         console.error(`❌ Gallery creation failed:`, error);
//         throw error;
//     }
// }

// // Image optimization function
// async function optimizeImageForWhatsApp(imagePath) {
//     try {
//         const optimizedPath = imagePath.replace(/(\.\w+)$/, '_optimized$1');
        
//         await sharp(imagePath)
//             .resize(1200, 1200, {
//                 fit: 'inside',
//                 withoutEnlargement: true
//             })
//             .jpeg({ 
//                 quality: 80,
//                 progressive: true 
//             })
//             .toFile(optimizedPath);
            
//         console.log(`✅ Image optimized: ${optimizedPath}`);
//         return optimizedPath;
//     } catch (error) {
//         console.error('❌ Image optimization failed, using original:', error);
//         return imagePath;
//     }
// }

// // Fallback function
// async function sendProductFallback(message, client, product, title = '') {
//     try {
//         const productText = 
//             `${title ? title + '\n\n' : ''}` +
//             `🆔 *Product ID:* ${product._id}\n` +
//             `*${product.productName}*\n\n` +
//             `💰 Price: ₹${product.price}\n` +
//             `📦 Stock: ${product.stock} available\n` +
//             `🏷️ Category: ${product.category || 'General'}\n` +
//             `📝 Description: ${product.description || 'Premium quality product'}\n` +
//             (product.options ? `⚙️ Options: ${product.options}\n` : '') +
//             `\n🛒 Type *Order* to purchase!`;
            
//         await message.reply(productText);
        
//     } catch (error) {
//         console.error('❌ Fallback failed:', error);
//         await message.reply(
//             `🛍️ *${product.productName}*\n` +
//             `🆔 Product ID: ${product._id}\n` +
//             `💰 Price: ₹${product.price}\n` +
//             `📦 Stock: ${product.stock}\n\n` +
//             `🛒 Type *Order* to purchase!`
//         );
//     }
// }

// async function handleProductSearch(message, client, searchTerm) {
//     try {
//         // Clean up search term - remove extra spaces and make case insensitive
//         const cleanSearchTerm = searchTerm.replace(/\s+/g, ' ').trim().toLowerCase();
        
//         if (cleanSearchTerm.length < 2) {
//             return await message.reply(
//                 `🔍 *Search Tip:*\n\n` +
//                 `Please use at least 2 characters for search.\n\n` +
//                 `Examples:\n` +
//                 `• *Products poster*\n` +
//                 `• *Products anime*\n` +
//                 `• *Products landscape*\n` +
//                 `• *Or just type: neem soap* (direct search)\n\n` +
//                 `💡 *To order:* Just type *Order*`
//             );
//         }

//         return await showProductsPage(message, client, 0, cleanSearchTerm);

//     } catch (error) {
//         console.error('❌ Search error:', error);
//         await message.reply('❌ Search failed. Please try again.');
//     }
// }

// async function handleNextPage(message, client) {
//     const from = message.from;
//     const session = productSessions.get(from);
    
//     if (!session) {
//         return await showProductsPage(message, client, 0);
//     }

//     const nextPage = session.currentPage + 1;
    
//     if (nextPage >= session.totalPages) {
//         return await message.reply(
//             `📄 You're on the last page (${session.totalPages} of ${session.totalPages}).\n\n` +
//             `Type *Prev* to go back or *Products* to start over.\n\n` +
//             `🛒 *Ready to order?* Type *Order* to begin!`
//         );
//     }

//     return await showProductsPage(message, client, nextPage, session.searchTerm);
// }

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

// // Helper function to get image file path
// async function getImagePath(imageUrl) {
//     try {
//         console.log(`🔍 Processing image URL: ${imageUrl}`);
        
//         let filename;
        
//         if (imageUrl.startsWith('/uploads/')) {
//             filename = imageUrl.split('/uploads/')[1];
//             console.log(`📁 Extracted filename from /uploads/: ${filename}`);
//         } else if (!imageUrl.startsWith('http')) {
//             filename = imageUrl; // It's just a filename
//             console.log(`📁 Using filename directly: ${filename}`);
//         } else {
//             console.log(`❌ External URL, skipping: ${imageUrl}`);
//             return null;
//         }

//         const fullPath = path.join(process.cwd(), 'public', 'uploads', filename);
//         console.log(`📁 Full path: ${fullPath}`);
        
//         // Check if file exists
//         try {
//             await readFile(fullPath);
//             console.log(`✅ File exists: ${fullPath}`);
//             return fullPath;
//         } catch (fileError) {
//             console.log(`❌ File not found: ${fullPath}`);
//             return null;
//         }
        
//     } catch (error) {
//         console.error('❌ Image path error:', error);
//         return null;
//     }
// }

// // Helper function to create Media from file using Base64
// async function createMediaFromFile(filePath) {
//     try {
//         console.log(`📸 Creating media from file: ${filePath}`);
//         const fileBuffer = await readFile(filePath);
//         const base64Data = fileBuffer.toString('base64');
//         const ext = path.extname(filePath).toLowerCase().substring(1);
        
//         console.log(`📸 File extension: ${ext}, Size: ${fileBuffer.length} bytes`);
        
//         const mimeTypes = {
//             'jpg': 'image/jpeg',
//             'jpeg': 'image/jpeg',
//             'png': 'image/png',
//             'webp': 'image/webp',
//             'gif': 'image/gif'
//         };

//         const mimeType = mimeTypes[ext] || 'image/jpeg';
//         console.log(`📸 MIME type: ${mimeType}`);
        
//         return new MessageMedia(mimeType, base64Data);
//     } catch (error) {
//         console.error('❌ Create media error:', error);
//         return null;
//     }
// }

// // Test smart image handling
// export async function handleTestSmart(message, client) {
//     try {
//         const products = await Product.find({ 
//             isActive: true,
//             $or: [
//                 { imageUrls: { $exists: true, $ne: [] } },
//                 { imageUrl: { $exists: true, $ne: null } }
//             ]
//         }).limit(2).lean();

//         if (products.length > 0) {
//             for (const product of products) {
//                 const imageCount = (product.imageUrls?.length || (product.imageUrl ? 1 : 0));
//                 console.log(`🧪 Testing product with ${imageCount} image(s): ${product.productName} (ID: ${product._id})`);
//                 await sendProductSmart(message, client, product, `🧪 TEST: ${imageCount} Image(s)`);
//                 await new Promise(resolve => setTimeout(resolve, 3000));
//             }
//             return;
//         } else {
//             await message.reply('❌ No products with images found for testing.');
//         }
        
//     } catch (error) {
//         await message.reply('❌ Smart test failed: ' + error.message);
//     }
// }

// // Enhanced copy command
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

//         const product = await Product.findById(productId).select('productName price imageUrls').lean();
//         const productName = product ? product.productName : 'Product';
        
//         await message.reply(
//             `📋 *PRODUCT FOUND!*\n\n` +
//             `🆔 *Product ID:* ${productId}\n` +
//             `*${productName}*\n` +
//             `💰 Price: ₹${product?.price || 'N/A'}\n` +
//             `📸 Images: ${product?.imageUrls?.length || 0} views available\n\n` +
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

// // Enhanced quick order
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

// // Get all product IDs
// export async function handleAllIds(message, client) {
//     try {
//         const products = await Product.find({ 
//             isActive: true, 
//             stock: { $gt: 0 } 
//         })
//         .sort({ productName: 1 })
//         .select('productName _id price imageUrls')
//         .lean();

//         if (!products || products.length === 0) {
//             return await message.reply('📭 No products available right now.');
//         }

//         await message.reply(`🛍️ *${products.length} Products Available*\n\nBrowse our collection and order easily!`);

//         // Send products with smart image handling
//         for (let i = 0; i < products.length; i++) {
//             const product = products[i];
//             await sendProductSmart(message, client, product, `*${i + 1}. ${product.productName}*`);
            
//             if (i < products.length - 1) {
//                 await new Promise(resolve => setTimeout(resolve, 2000));
//             }
//         }

//         await message.reply(
//             `🎯 *READY TO ORDER? IT'S EASY!*\n\n` +
//             `Simply type *Order* and I'll guide you through:\n\n` +
//             `1. Product selection from the menu\n` +
//             `2. Quantity choice\n` +
//             `3. Customization (if available)\n` +
//             `4. Shipping address collection\n` +
//             `5. Payment instructions\n\n` +
//             `💡 *Benefits:*\n` +
//             `• No need to remember Product IDs\n` +
//             `• See product images (single or gallery)\n` +
//             `• Step-by-step guidance\n` +
//             `• Easy payment process\n\n` +
//             `🛒 *Start ordering now:* Type *Order*`
//         );

//     } catch (error) {
//         console.error('All IDs error:', error);
//         await message.reply('❌ Failed to fetch products. Please try typing *Order* to start the ordering process.');
//     }
// }

// // Simple button response handler
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

// // Clean up old product sessions
// function cleanupProductSessions() {
//     const now = Date.now();
//     const oneHour = 60 * 60 * 1000;
    
//     for (const [phone, session] of productSessions.entries()) {
//         if (now - session.lastActivity > oneHour) {
//             productSessions.delete(phone);
//             console.log(`🧹 Cleaned up product session for: ${phone}`);
//         }
//     }
// }

// // Run cleanup every hour
// setInterval(cleanupProductSessions, 60 * 60 * 1000);
