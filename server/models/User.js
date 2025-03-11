const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['buyer', 'seller', 'delivery', 'admin']
    },
    profilePicture: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
    },
    failedLoginAttempts: {
        type: Number,
        default: 0, 
    },
    lockUntil: {
        type: Number, 
    },
    isActive: {
        type: Boolean,
        default: true, 
    }
}, { timestamps: true, discriminatorKey: 'role' });


UserSchema.virtual('confirmPassword')
    .get(function() {
        return this._confirmPassword;
    })
    .set(function(value) {
        this._confirmPassword = value;
    });


UserSchema.pre('validate', function(next) {
    if (this.password !== this.confirmPassword) {
        this.invalidate('confirmPassword', 'Password and confirm password must match.');
    }
    next();
});

const User = mongoose.model("User", UserSchema);


const BuyerSchema = new mongoose.Schema({
    address: String,
    phoneNumber: {
        type: String,
        required: true,
    }
});


const SellerSchema = new mongoose.Schema({
    shopName: String,
    headquartersAddress: String,
    registrationNumber: String,
    VATNumber: String,
    returnAddress: String,
    customerServiceAddress: String
});


const DeliveryPersonSchema = new mongoose.Schema({
    vehicleType: String,
    deliveryStatus: String
});


const AdminSchema = new mongoose.Schema({
    
});


const Buyer = User.discriminator('buyer', BuyerSchema);
const Seller = User.discriminator('seller', SellerSchema);
const DeliveryPerson = User.discriminator('delivery', DeliveryPersonSchema);
const Admin = User.discriminator('admin', AdminSchema);

module.exports = { User, Buyer, Seller, DeliveryPerson, Admin }