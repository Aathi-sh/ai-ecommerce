// import pkg from 'whatsapp-web.js';
// const { MessageMedia } = pkg;

// export async function handleWelcome(message, client) {
//     const welcomeText = 
//         `🎉 *Welcome to PosterPro - Premium Poster Store!*\n\n` +
//         `*Transform your spaces with our exclusive poster collection!* 🎨\n\n` +
//         `🌟 *What would you like to do?*\n\n` +
//         `🛍️  *Products* - Browse our amazing collection\n` +
//         `🎯  *Order* - Start a new order\n` +
//         `📦  *MyOrders* - Check your order status\n` +
//         `💬  *Support* - Get help & contact info\n\n` +
//         `*Quick Start:* Type *Products* to explore our gallery!`;

//     await message.reply(welcomeText);
    
//     // Send welcome image if available
//     try {
//         // const media = await MessageMedia.fromFilePath('./assets/welcome-poster.jpg');
//         // await message.reply(media, null, { caption: '🎨 Discover Amazing Posters!' });
//     } catch (error) {
//         console.log('Welcome image not found, continuing without it');
//     }
// }