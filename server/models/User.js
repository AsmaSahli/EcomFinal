const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['buyer', 'seller', 'delivery', 'admin'], 
        default: 'buyer' // 🟢 Définir "buyer" comme rôle par défaut
    },
    profilePicture: { 
        type: String, 
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isActive: { type: Boolean, default: true },
    isValidated: { type: Boolean, default: function () { return this.role === 'buyer' || this.role === 'admin'; } } // Only buyer & admin are auto-validated
}, { timestamps: true, discriminatorKey: 'role' });

const BuyerSchema = new mongoose.Schema({
    address: { type: String, default: "Not provided" }, 
    phoneNumber: { type: String, default: "Not provided" } 
});

const SellerSchema = new mongoose.Schema({
    shopName: { type: String, required: true },
    businessRegistrationNumber: { type: String, required: true }, // Business registration number
    vatNumber: { type: String, required: true }, // VAT number
    returnAddress: { type: String, required: true }, // Return address
    headquartersAddress: { type: String, required: true }, // Headquarters address
    customerServiceAddress: { type: String, required: true } // Customer service address
});

const DeliveryPersonSchema = new mongoose.Schema({
    vehicleType: { type: String, required: true },
    statusDelivery: { type: String, enum: ["pending", "accepted", "in-progress", "delivered"], default: "pending" }
});

const AdminSchema = new mongoose.Schema({});

const User = mongoose.model("User", UserSchema);
const Buyer = User.discriminator('buyer', BuyerSchema);
const Seller = User.discriminator('seller', SellerSchema);
const DeliveryPerson = User.discriminator('delivery', DeliveryPersonSchema);
const Admin = User.discriminator('admin', AdminSchema);

module.exports = { User, Buyer, Seller, DeliveryPerson, Admin };
