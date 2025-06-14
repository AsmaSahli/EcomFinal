const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["buyer", "seller", "delivery", "admin"],
      default: "buyer",
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Number },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    approvalToken: { type: String },
    approvalTokenExpires: { type: Date },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true, discriminatorKey: "role" }
);

UserSchema.pre("save", function (next) {
  if (this.role !== "seller" && this.role !== "delivery" && !this.password) {
    const error = new Error("Password is required for this role.");
    return next(error);
  }
  next();
});

const BuyerSchema = new mongoose.Schema({
  address: { type: String, default: "Not provided" },
  phoneNumber: { type: String, default: "Not provided" },
});

const SellerSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  headquartersAddress: { type: String, required: true },
  fiscalIdentificationCard: { type: String, required: true },
  tradeRegister: { type: String, required: true },
  businessDescription: { type: String },
  logo: { type: String },
  status: {
    type: String,
    enum: ["pending", "under_review", "approved", "rejected", "suspended"],
    default: "pending",
  },
  rejectionReason: { type: String },
});

const DeliveryPersonSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  deliveryArea: { type: String, required: true },
  contactNumber: { type: String, required: true },
  cv: { type: String },
  reasonForRejection: { type: String },
  status: {
    type: String,
    enum: ["pending", "under_review", "approved", "rejected", "suspended"],
    default: "pending",
  },
});

const AdminSchema = new mongoose.Schema({});

const User = mongoose.model("User", UserSchema);
const Buyer = User.discriminator("buyer", BuyerSchema);
const Seller = User.discriminator("seller", SellerSchema);
const DeliveryPerson = User.discriminator("delivery", DeliveryPersonSchema);
const Admin = User.discriminator("admin", AdminSchema);

module.exports = { User, Buyer, Seller, DeliveryPerson, Admin };
