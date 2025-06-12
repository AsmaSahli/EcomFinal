const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: true }
);

const PromotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: imageSchema,
    discountRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for expiration
PromotionSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

// Automatically set isActive based on date range
PromotionSchema.pre("save", function (next) {
  const now = new Date();
  this.isActive = this.startDate <= now && now <= this.endDate;
  next();
});

module.exports = mongoose.model("Promotion", PromotionSchema);
