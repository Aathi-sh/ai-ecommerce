
// // whatsapp-bot/whatsapp/handlers/welcomeHandler.js - UPDATED with booking
// import pkg from 'whatsapp-web.js';
// const { MessageMedia } = pkg;

// export async function handleWelcome(message, client) {
//     const welcomeText = 
//         `🎉 *Welcome to PosterPro - Premium Poster Store!*\n\n` +
//         `*Transform your spaces with our exclusive poster collection!* 🎨\n\n` +
//         `🌟 *What would you like to do?*\n\n` +
//         `🛍️  *Products* - Browse our amazing collection\n` +
//         `📅  *Book* - Book appointments/services\n` + 
//         `🎯  *Order* - Start a new order\n` +
//         `📦  *MyOrders* - Check your order status\n` +
//         `📞  *MyBookings* - View your appointments\n` +
//         `💬  *Support* - Get help & contact info\n\n` +
//         `*Quick Start:* Type *Products* to explore our gallery!\n` +
//         `*Book Now:* Type *Book* to schedule appointments!`;

//     await message.reply(welcomeText);
    
//     // Send welcome image if available
//     try {
//         // const media = await MessageMedia.fromFilePath('./assets/welcome-poster.jpg');
//         // await message.reply(media, null, { caption: '🎨 Discover Amazing Posters!' });
//     } catch (error) {
//         console.log('Welcome image not found, continuing without it');
//     }
// }







import pkg from 'whatsapp-web.js';
const { MessageMedia } = pkg;

export async function handleWelcome(message, client) {
    const welcomeText = 
        `🎉 *Welcome to Vijayas Handicraft Store!*\n\n` +
        `*Transform your spaces with our exclusive poster collection!* 🎨\n\n` +
        `🌟 *What would you like to do?*\n\n` +
        `🛍️  *Products* - Browse our amazing collection\n` +
        `📍  *Location* - Get store address & directions\n` +
        `🎯  *Order* - Start a new order\n` +
        `📦  *MyOrders* - Check your order status\n` +
        `💬  *Support* - Get help & contact info\n\n` +
        `*Quick Start:* Type *Products* to explore our gallery!\n` +
        `*Store Info:* Type *Location* for address & map link!`;

    await message.reply(welcomeText);
    
    // Optional: send welcome image
    try {
        // const media = await MessageMedia.fromFilePath('./assets/welcome-poster.jpg');
        // await message.reply(media, null, { caption: '🎨 Discover Amazing Posters!' });
    } catch (error) {
        console.log('Welcome image not found, continuing without it');
    }
}