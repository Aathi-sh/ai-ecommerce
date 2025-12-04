// // src/whatsapp/messageHandler.js
// import Product from "../models/Product.js";
// import Order from "../models/Order.js";
// import { connectDB } from "../models/db.js";

// export default async function handleMessage(message, client) {
//   await connectDB();
//   const userMessage = message.body.trim().toLowerCase();

//   if (userMessage === "hi" || userMessage === "hello") {
//     return message.reply(
//       "👋 Hi! Welcome to *PosterPro WhatsApp Store*.\n\n" +
//       "You can type any of these commands:\n\n" +
//       "🛍️ *products* - View available products\n" +
//       "🧾 *order <productId> <quantity>* - Place a new order\n" +
//       "📦 *myorders* - View your past orders\n" +
//       "💬 *help* - Get help menu"
//     );
//   }

//   // 1️⃣ Show all products
//   if (userMessage === "products") {
//     const products = await Product.find({ isActive: true }).limit(5);

//     if (!products.length)
//       return message.reply("❌ No products available at the moment.");

//     let productList = "🛍️ *Available Products:*\n\n";
//     products.forEach((p, i) => {
//       productList += `${i + 1}. *${p.productName}*\n💰 Price: ₹${p.price}\n🆔 ID: ${p._id}\n\n`;
//     });

//     productList += "To order, type:\n👉 *order <productId> <quantity>*";
//     return message.reply(productList);
//   }

//   // 2️⃣ Place order
//   if (userMessage.startsWith("order")) {
//     const parts = userMessage.split(" ");
//     if (parts.length < 3)
//       return message.reply("⚠️ Usage: order <productId> <quantity>");

//     const productId = parts[1];
//     const quantity = parseInt(parts[2]);

//     const product = await Product.findById(productId);
//     if (!product) return message.reply("❌ Invalid Product ID.");

//     const totalPrice = product.price * quantity;

//     const newOrder = new Order({
//       orderNumber: "ORD-" + Date.now(),
//       createdBy: null, // you can link to user later if needed
//       items: [
//         {
//           productId: product._id,
//           productName: product.productName,
//           quantity,
//           price: product.price,
//         },
//       ],
//       totalPrice,
//       shippingAddress: "NA (WhatsApp order)",
//       phoneNumber: message.from,
//       pincode: "000000",
//       status: "pending",
//       paymentStatus: "pending",
//     });

//     await newOrder.save();

//     return message.reply(
//       `✅ *Order Placed Successfully!*\n\n🧾 Order No: ${newOrder.orderNumber}\n📦 Product: ${product.productName}\n🛒 Quantity: ${quantity}\n💰 Total: ₹${totalPrice}\n\nWe'll contact you soon for delivery details.`
//     );
//   }

//   // 3️⃣ My Orders
//   if (userMessage === "myorders") {
//     const orders = await Order.find({ phoneNumber: message.from }).sort({ createdAt: -1 });

//     if (!orders.length) return message.reply("📭 You don’t have any orders yet.");

//     let orderList = "📦 *Your Orders:*\n\n";
//     orders.forEach((o, i) => {
//       orderList += `${i + 1}. *${o.orderNumber}*\nStatus: ${o.status}\nTotal: ₹${o.totalPrice}\n\n`;
//     });

//     return message.reply(orderList);
//   }

//   // 4️⃣ Help Command
//   if (userMessage === "help") {
//     return message.reply(
//       "🧭 *Help Menu:*\n\n" +
//       "🛍️ products - View available products\n" +
//       "🧾 order <productId> <quantity> - Place a new order\n" +
//       "📦 myorders - View your past orders"
//     );
//   }

//   // Default message
//   return message.reply(
//     "🤖 I didn't understand that.\nType *help* to see available commands."
//   );
// }