/**
 * locationHandler.js
 * Handles sending store address and Google Maps link
 */

export async function handleLocation(message, client) {
    const storeAddress = 
        `📍 *POSTERPRO STORE LOCATION* 📍\n\n` +
        `🏢 *Address:*\n` +
        `No :7 ,Roja Salai\n` +
        `Annamalai Nagar\n` +
        `Tiruchirappalli\n` +
        `Tamil Nadu - 620018\n\n` +
        `🗺️ *Google Maps Link:*\n` +
        `https://maps.app.goo.gl/KndS5yuLS7kzCMia6?g_st=ac\n\n` +
        `📱 *Click to open in Maps:*\n` +
        `[Open Google Maps](${encodeURI('https://maps.app.goo.gl/KndS5yuLS7kzCMia6?g_st=ac')})\n\n` +
        `🚗 *Nearby Landmarks:*\n` +
        `• Annamalai Nagar Bus Stop - 2 minutes\n` +
        `🕒 *Store Hours:*\n` +
        `Monday - Saturday: 10:00 AM - 8:00 PM\n` +
        `Sunday: 11:00 AM - 6:00 PM\n\n` +
        `✨ We look forward to welcoming you! ✨`;

    await message.reply(storeAddress);
    
    // Optional: send a location pin (if you have coordinates)
    // const lat = 10.7905;  // example – replace with actual coordinates
    // const lng = 78.7047;
    // await client.sendMessage(message.from, new Location(lat, lng, 'PosterPro Store'));
}