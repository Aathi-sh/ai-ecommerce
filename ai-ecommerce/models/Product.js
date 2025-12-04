// import mongoose from 'mongoose';


// const ProductSchema = new mongoose.Schema(
//     {
//         productName: { type: String, 
//             required: ["product name is required"],
//             trim:true,           
//         },
//         category: { type: String, required: true },
//         price: { type: Number, required: ["product price is required"],trim:true },
//         description: { type: String, required: true,trim:true, },
//         imageUrl: { type: String, required: true },
//         options:{type:String,required:false},
//         stock:{type:Number,required:true,trim:true},
//         createdBy:{type:String,ref:'User',required:true},
//         updatedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:false},
//         isActive:{type:Boolean,default:true},

//     },
//     { timestamps: true }

    
// );
// export default mongoose.models.Product || mongoose.model("Product",ProductSchema);



import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        productName: { 
            type: String, 
            required: [true, "Product name is required"],
            trim: true,           
        },
        category: { 
            type: String, 
            required: [true, "Category is required"] 
        },
        price: { 
            type: Number, 
            required: [true, "Product price is required"] 
        },
        description: { 
            type: String, 
            required: [true, "Description is required"],
            trim: true 
        },
        imageUrls: { 
            type: [String], // ✅ Changed to array for multiple images
            required: [true, "At least one image is required"],
            validate: {
                validator: function(array) {
                    return array.length > 0; // Ensure at least one image
                },
                message: "At least one product image is required"
            }
        },
        options: {
            type: String,
            required: false
        },
        stock: {
            type: Number,
            required: [true, "Stock quantity is required"]
        },
        createdBy: {
            type: String,
            ref: 'User',
            required: [true, "Created by user is required"]
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);