const Product = require("../models/Product");
const Category = require("../models/Category");
const { User } = require("../models/User");
const { uploadToCloudinary, cloudinary } = require("../utils/uploadsImages");
const mongoose = require("mongoose");

// Helper function to process images
const processImages = async (files) => {
  const imageUrls = [];
  for (const file of files) {
    try {
      const result = await uploadToCloudinary(file.buffer);
      imageUrls.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
  return imageUrls;
};

// Helper function to transform product data
const transformProductData = (product) => {
  const transformed = product.toObject ? product.toObject() : product;

  // Simplify category details
  if (transformed.categoryDetails && transformed.categoryDetails.category) {
    transformed.categoryDetails = {
      category: {
        _id: transformed.categoryDetails.category._id,
        name: transformed.categoryDetails.category.name,
      },
      subcategory: transformed.categoryDetails.subcategory,
    };
  }

  return transformed;
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("sellers.sellerId")
      .populate("sellers.tags")
      .populate({
        path: "sellers.activePromotion",
        select: "name discountRate startDate endDate isActive image",
      })
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate("sellers.reviews")
      .populate("createdBy")
      .lean();

    const transformedProducts = products.map(transformProductData);
    res.status(200).json(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { seller } = req.query; // Extract sellerId from query parameter

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Validate seller ID if provided
    if (seller && !mongoose.Types.ObjectId.isValid(seller)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    // Find the product
    let product = await Product.findById(id)
      .populate("sellers.sellerId", "shopName name email")
      .populate("sellers.tags", "name")
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate("sellers.reviews", "rating comment createdAt userName")
      .populate("createdBy", "name email")
      .populate({
        path: "sellers.promotions.promotionId",
        select: "name discountRate startDate endDate isActive image",
      })
      .populate({
        path: "sellers.activePromotion",
        select: "name discountRate startDate endDate isActive image",
      })
      .lean(); // Use lean for performance since we'll modify the document

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Transform sellers array to include processed promotion data
    product.sellers = product.sellers.map((seller) => {
      // Process promotions to include only relevant fields
      const promotions = seller.promotions
        ? seller.promotions
            .filter((promo) => promo.promotionId) // Ensure promotionId exists
            .map((promo) => ({
              ...promo,
              oldPrice: promo.oldPrice || seller.price || null,
              newPrice:
                promo.newPrice ||
                (promo.promotionId?.discountRate
                  ? seller.price * (1 - promo.promotionId.discountRate / 100)
                  : seller.price) ||
                null,
              promotionId: {
                _id: promo.promotionId._id,
                name: promo.promotionId.name,
                discountRate: promo.promotionId.discountRate,
                startDate: promo.promotionId.startDate,
                endDate: promo.promotionId.endDate,
                isActive: promo.promotionId.isActive,
                image: promo.promotionId.image || null,
              },
            }))
        : [];

      // Determine active promotion
      const activePromotion = promotions.find(
        (promo) =>
          promo.promotionId.isActive &&
          seller.activePromotion?._id?.toString() ===
            promo.promotionId._id.toString()
      );

      return {
        ...seller,
        promotions,
        activePromotion: activePromotion ? activePromotion.promotionId : null,
        hasActivePromotion: !!activePromotion,
        activeDiscountRate: activePromotion
          ? activePromotion.promotionId.discountRate
          : 0,
      };
    });

    // Filter sellers array if sellerId is provided
    if (seller) {
      product.sellers = product.sellers.filter(
        (s) => s.sellerId && s.sellerId._id.toString() === seller
      );
      if (product.sellers.length === 0) {
        return res
          .status(404)
          .json({ message: "Seller not found for this product" });
      }
    }

    // Transform the product data
    const transformedProduct = transformProductData(product);

    // Wrap the response in { product: {...} } to match frontend expectations
    res.status(200).json({ product: transformedProduct });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get product by reference
exports.getProductByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    // Validate reference
    if (!reference || typeof reference !== "string") {
      return res.status(400).json({ message: "Invalid product reference" });
    }

    const product = await Product.findOne({ reference })
      .populate({
        path: "sellers.sellerId",
        select: "name email",
      })
      .populate({
        path: "sellers.tags",
        select: "name",
      })
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate({
        path: "sellers.reviews",
        select: "rating comment",
      })
      .populate({
        path: "createdBy",
        select: "name email",
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ensure categoryDetails.subcategory is present (fallback for legacy data)
    if (!product.categoryDetails?.subcategory) {
      product.categoryDetails.subcategory = { group: "", item: "" };
    }

    const transformedProduct = transformProductData(product);
    res.status(200).json(transformedProduct);
  } catch (error) {
    console.error("Error in getProductByReference:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    // Validate required fields
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    if (!req.body.reference) {
      return res.status(400).json({ error: "Product reference is required" });
    }

    if (!req.body.sellerId || typeof req.body.sellerId !== "string") {
      return res.status(400).json({ error: "Valid sellerId is required" });
    }

    // Validate category details
    if (
      !req.body.categoryDetails ||
      !req.body.categoryDetails.category ||
      !req.body.categoryDetails.subcategory ||
      !req.body.categoryDetails.subcategory.group ||
      !req.body.categoryDetails.subcategory.item
    ) {
      return res.status(400).json({
        error:
          "Complete category details are required (category, subcategory group, and item)",
      });
    }

    // Check if product with this reference already exists
    const existingProduct = await Product.findOne({
      reference: req.body.reference,
    });
    if (existingProduct) {
      return res.status(400).json({
        error: "Product with this reference already exists",
        existingProductId: existingProduct._id,
      });
    }

    const uploadedImages = await processImages(req.files);

    const productData = {
      reference: req.body.reference,
      name: req.body.name,
      description: req.body.description,
      images: uploadedImages,
      createdBy: req.body.sellerId,
      categoryDetails: {
        category: req.body.categoryDetails.category,
        subcategory: {
          group: req.body.categoryDetails.subcategory.group,
          item: req.body.categoryDetails.subcategory.item,
        },
      },
      sellers: [
        {
          sellerId: req.body.sellerId,
          price: req.body.price,
          stock: req.body.stock,
          tags: Array.isArray(req.body.tags) ? req.body.tags : [],
          warranty: req.body.warranty || "",
          reviews: [],
        },
      ],
    };

    const product = await Product.create(productData);
    const transformedProduct = transformProductData(product);
    res.status(201).json(transformedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({
      error: error.message,
      details: error.errors,
    });
  }
};

// Add seller to product
exports.addSellerToProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { sellerId, price, stock, tags, warranty } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Valid sellerId is required" });
    }

    if (price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Price and stock are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const sellerExists = product.sellers.some(
      (s) => s.sellerId.toString() === sellerId
    );
    if (sellerExists) {
      return res
        .status(400)
        .json({ error: "Seller already exists for this product" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          sellers: {
            sellerId,
            price: parseFloat(price),
            stock: parseInt(stock),
            tags: Array.isArray(tags) ? tags : [],
            warranty: warranty || "",
            reviews: [],
          },
        },
      },
      { new: true, runValidators: true }
    )
      .populate("sellers.sellerId")
      .populate("sellers.reviews")
      .populate({
        path: "categoryDetails.category",
        select: "name",
      });

    const transformedProduct = transformProductData(updatedProduct);
    res.status(200).json(transformedProduct);
  } catch (error) {
    console.error("Error adding seller:", error);
    res.status(500).json({
      error: error.message,
      details: error.errors,
    });
  }
};

// Update seller-specific product details
exports.updateSellerProduct = async (req, res) => {
  try {
    const { productId, sellerId } = req.params;
    const { price, stock, warranty } = req.body;

    if (!price && !stock && !warranty) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (price, stock, or warranty) must be provided",
      });
    }

    const updateFields = {};
    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a non-negative number",
        });
      }
      updateFields["sellers.$.price"] = price;
    }
    if (stock !== undefined) {
      if (typeof stock !== "number" || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative number",
        });
      }
      updateFields["sellers.$.stock"] = stock;
    }
    if (warranty !== undefined) {
      if (
        !["", "1 year", "2 years", "3 years", "lifetime"].includes(warranty)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid warranty value",
        });
      }
      updateFields["sellers.$.warranty"] = warranty;
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        "sellers.sellerId": sellerId,
      },
      { $set: updateFields },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "categoryDetails.category",
      select: "name",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product or seller not found",
      });
    }

    const updatedSeller = product.sellers.find(
      (seller) => seller.sellerId.toString() === sellerId
    );

    if (!updatedSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller data not found after update",
      });
    }

    const transformedProduct = transformProductData(product);

    return res.status(200).json({
      success: true,
      message: "Seller product updated successfully",
      data: transformedProduct,
    });
  } catch (error) {
    console.error("Error updating seller product:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating seller product",
      error: error.message,
    });
  }
};

// Remove a seller from a product
exports.removeSellerFromProduct = async (req, res) => {
  try {
    const { productId, sellerId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const sellerExists = product.sellers.some(
      (s) => s.sellerId.toString() === sellerId
    );
    if (!sellerExists) {
      return res
        .status(404)
        .json({ message: "Seller not found for this product" });
    }

    product.sellers = product.sellers.filter(
      (s) => s.sellerId.toString() !== sellerId
    );
    await product.save();

    const updatedProduct = await Product.findById(productId)
      .populate("sellers.sellerId")
      .populate("sellers.tags")
      .populate("sellers.reviews")
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate("createdBy")
      .populate("sellers.promotions.promotionId")
      .populate("sellers.activePromotion");

    const transformedProduct = transformProductData(updatedProduct);
    res.status(200).json({
      message: "Seller removed from product",
      product: transformedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update common product info
exports.updateProduct = async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      description: req.body.description,
    };

    // Handle categoryDetails update if provided
    if (req.body.categoryDetails) {
      productData.categoryDetails = {
        category: req.body.categoryDetails.category,
        subcategory: {
          group: req.body.categoryDetails.subcategory.group,
          item: req.body.categoryDetails.subcategory.item,
        },
      };
    }

    if (req.files && req.files.length > 0) {
      const newImages = await processImages(req.files);
      productData.$push = { images: { $each: newImages } };
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    )
      .populate("sellers.sellerId")
      .populate("sellers.tags")
      .populate("sellers.reviews")
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate("createdBy")
      .populate("sellers.promotions.promotionId")
      .populate("sellers.activePromotion");

    if (!product) return res.status(404).json({ message: "Product not found" });

    const transformedProduct = transformProductData(product);
    res.status(200).json(transformedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }

    await product.remove();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add images to product
exports.addProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newImages = await processImages(req.files);
    product.images.push(...newImages);
    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate("sellers.sellerId")
      .populate("sellers.tags")
      .populate("sellers.reviews")
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate("createdBy")
      .populate("sellers.promotions.promotionId")
      .populate("sellers.activePromotion");

    const transformedProduct = transformProductData(updatedProduct);
    res.status(200).json(transformedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete product image
exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageIndex = product.images.findIndex(
      (img) => img.publicId === req.params.publicId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    await cloudinary.uploader.destroy(req.params.publicId);

    product.images.splice(imageIndex, 1);
    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate("sellers.sellerId")
      .populate("sellers.tags")
      .populate("sellers.reviews")
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate("createdBy")
      .populate("sellers.promotions.promotionId")
      .populate("sellers.activePromotion");

    const transformedProduct = transformProductData(updatedProduct);
    res.status(200).json(transformedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search products by reference or name
exports.searchProducts = async (req, res) => {
  try {
    const {
      q = "",
      category = "",
      minPrice = "",
      maxPrice = "",
      rating = "",
      inStock = false,
      page = 1,
      limit = 20,
    } = req.query;

    const trimmedQuery = q.trim(); // Trim whitespace for reference search
    console.log("Search query:", trimmedQuery); // Debug log

    let query = {};

    // Text search
    if (trimmedQuery) {
      query.$or = [
        { name: { $regex: trimmedQuery, $options: "i" } },
        { description: { $regex: trimmedQuery, $options: "i" } },
        { reference: { $regex: trimmedQuery, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      query["categoryDetails.category"] = mongoose.Types.ObjectId.isValid(
        category
      )
        ? new mongoose.Types.ObjectId(category)
        : { $exists: false };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query["sellers.price"] = {};
      if (minPrice) query["sellers.price"].$gte = Number(minPrice);
      if (maxPrice) query["sellers.price"].$lte = Number(maxPrice);
    }

    // In-stock filter
    if (inStock === "true" || inStock === true) {
      query["sellers.stock"] = { $gt: 0 };
    }

    const pipeline = [
      { $match: query },
      { $unwind: "$sellers" },

      // Lookup seller details to populate shopName
      {
        $lookup: {
          from: "users",
          localField: "sellers.sellerId",
          foreignField: "_id",
          as: "sellers.sellerDetails",
        },
      },

      // Unwind sellerDetails to simplify structure
      {
        $unwind: {
          path: "$sellers.sellerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup reviews
      {
        $lookup: {
          from: "reviews",
          localField: "sellers.reviews",
          foreignField: "_id",
          as: "sellers.reviewDetails",
        },
      },

      // Calculate average rating
      {
        $addFields: {
          "sellers.averageRating": {
            $cond: {
              if: { $gt: [{ $size: "$sellers.reviewDetails" }, 0] },
              then: { $avg: "$sellers.reviewDetails.rating" },
              else: 0,
            },
          },
        },
      },

      // Apply rating filter
      ...(rating
        ? [
            {
              $match: {
                "sellers.averageRating": { $gte: Number(rating) },
              },
            },
          ]
        : []),

      // Lookup category details
      {
        $lookup: {
          from: "categories",
          localField: "categoryDetails.category",
          foreignField: "_id",
          as: "categoryDetails.category",
        },
      },
      {
        $unwind: {
          path: "$categoryDetails.category",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Handle promotions
      {
        $addFields: {
          "sellers.effectivePrice": {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$sellers.activePromotion", null] },
                  { $eq: [{ $size: "$sellers.promotions" }, 0] },
                ],
              },
              then: "$sellers.price",
              else: {
                $min: [
                  "$sellers.price",
                  {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          "$sellers.promotions.newPrice",
                          {
                            $indexOfArray: [
                              "$sellers.promotions.isActive",
                              true,
                            ],
                          },
                        ],
                      },
                      "$sellers.price",
                    ],
                  },
                ],
              },
            },
          },
        },
      },

      // Re-apply price filter on effectivePrice
      ...(minPrice || maxPrice
        ? [
            {
              $match: {
                "sellers.effectivePrice": {
                  ...(minPrice ? { $gte: Number(minPrice) } : {}),
                  ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
                },
              },
            },
          ]
        : []),

      // Group back to maintain product structure
      {
        $group: {
          _id: "$_id",
          reference: { $first: "$reference" },
          name: { $first: "$name" },
          description: { $first: "$description" },
          images: { $first: "$images" },
          categoryDetails: { $first: "$categoryDetails" },
          sellers: {
            $push: {
              sellerId: "$sellers.sellerId",
              shopName: "$sellers.sellerDetails.shopName",
              price: "$sellers.price",
              effectivePrice: "$sellers.effectivePrice",
              stock: "$sellers.stock",
              tags: "$sellers.tags",
              warranty: "$sellers.warranty",
              promotions: "$sellers.promotions",
              activePromotion: "$sellers.activePromotion",
              reviews: "$sellers.reviews",
              averageRating: "$sellers.averageRating",
            },
          },
          createdBy: { $first: "$createdBy" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },

      // Pagination
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
    ];

    // Define countPipeline for total count
    const countPipeline = [
      { $match: query },
      { $unwind: "$sellers" },
      {
        $lookup: {
          from: "users",
          localField: "sellers.sellerId",
          foreignField: "_id",
          as: "sellers.sellerDetails",
        },
      },
      {
        $unwind: {
          path: "$sellers.sellerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "sellers.reviews",
          foreignField: "_id",
          as: "sellers.reviewDetails",
        },
      },
      {
        $addFields: {
          "sellers.averageRating": {
            $cond: {
              if: { $gt: [{ $size: "$sellers.reviewDetails" }, 0] },
              then: { $avg: "$sellers.reviewDetails.rating" },
              else: 0,
            },
          },
        },
      },
      ...(rating
        ? [
            {
              $match: {
                "sellers.averageRating": { $gte: Number(rating) },
              },
            },
          ]
        : []),
      {
        $addFields: {
          "sellers.effectivePrice": {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$sellers.activePromotion", null] },
                  { $eq: [{ $size: "$sellers.promotions" }, 0] },
                ],
              },
              then: "$sellers.price",
              else: {
                $min: [
                  "$sellers.price",
                  {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          "$sellers.promotions.newPrice",
                          {
                            $indexOfArray: [
                              "$sellers.promotions.isActive",
                              true,
                            ],
                          },
                        ],
                      },
                      "$sellers.price",
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      ...(minPrice || maxPrice
        ? [
            {
              $match: {
                "sellers.effectivePrice": {
                  ...(minPrice ? { $gte: Number(minPrice) } : {}),
                  ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
                },
              },
            },
          ]
        : []),
      { $group: { _id: "$_id" } },
      { $count: "total" },
    ];

    const products = await Product.aggregate(pipeline);
    console.log("Found products:", products.length); // Debug log

    const countResult = await Product.aggregate(countPipeline);
    const totalProducts = countResult.length > 0 ? countResult[0].total : 0;

    res.status(200).json({
      products,
      total: totalProducts,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalProducts / Number(limit)),
    });
  } catch (error) {
    console.error("Search error:", error);
    res
      .status(500)
      .json({ message: "Error performing search", error: error.message });
  }
};
exports.getSuggestions = async (req, res) => {
  try {
    const { q = "" } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    // Build query for suggestions
    const query = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { reference: { $regex: q, $options: "i" } },
      ],
    };

    // Fetch products with matching names, descriptions, or references
    const products = await Product.find(query, { name: 1 }).limit(10).lean();

    // Extract unique product names as suggestions
    const suggestions = [...new Set(products.map((product) => product.name))];

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error("Suggestions error:", error);
    res
      .status(500)
      .json({ message: "Error fetching suggestions", error: error.message });
  }
};

// Get products by seller ID
exports.getProductsBySellers = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    const { page = 1, limit = 10, search = "" } = req.query;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Invalid seller ID" });
    }

    const skip = (page - 1) * limit;

    const query = {
      "sellers.sellerId": sellerId,
    };

    if (search && search.trim().length > 0) {
      query.$or = [
        { reference: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate("createdBy")
      .populate({
        path: "sellers.sellerId",
        select: "name email",
      })
      .populate({
        path: "sellers.tags",
        select: "name",
      })
      .populate({
        path: "sellers.reviews",
      })
      .populate({
        path: "sellers.promotions.promotionId",
        select: "name discountRate startDate endDate isActive image",
      })
      .populate({
        path: "sellers.activePromotion",
        select: "name discountRate startDate endDate isActive image",
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedProducts = products.map((product) => {
      const sellerInfo = product.sellers.find(
        (s) => s.sellerId && s.sellerId._id.toString() === sellerId
      );

      // Ensure oldPrice and newPrice are included in promotions
      if (sellerInfo && sellerInfo.promotions) {
        sellerInfo.promotions = sellerInfo.promotions.map((promo) => ({
          ...promo,
          oldPrice: promo.oldPrice || null,
          newPrice: promo.newPrice || null,
          promotionId: promo.promotionId, // Populated promotion details
        }));
      }

      const transformed = transformProductData(product);
      return {
        ...transformed,
        sellers: sellerInfo ? [sellerInfo] : [],
      };
    });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products: transformedProducts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

// Get products filtered by category structure
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryDetails, group, item } = req.query;
    const query = {};

    // If categoryDetails is provided, find the category by name
    if (categoryDetails) {
      const category = await Category.findOne({ name: categoryDetails });
      if (!category) {
        return res
          .status(404)
          .json({ message: `Category '${categoryDetails}' not found` });
      }
      query["categoryDetails.category"] = category._id;
    }

    // Add group and item to the query if provided
    if (group) query["categoryDetails.subcategory.group"] = group;
    if (item) query["categoryDetails.subcategory.item"] = item;

    // Find products matching the query and populate category, seller, and promotion details
    const products = await Product.find(query)
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate({
        path: "sellers.sellerId",
        select: "shopName",
      })
      .populate({
        path: "sellers.activePromotion",
        select: "name discountRate startDate endDate isActive image",
      })
      .lean();

    // Transform products to include promotion details with newPrice and oldPrice
    const transformedProducts = products.map((product) => {
      const transformed = transformProductData(product);
      transformed.sellers = product.sellers.map((seller) => {
        const activePromo = seller.promotions.find(
          (promo) =>
            promo.promotionId.toString() ===
            (seller.activePromotion?._id?.toString() || "")
        );
        return {
          ...seller,
          activePromotion: seller.activePromotion
            ? {
                ...seller.activePromotion,
                newPrice: activePromo ? activePromo.newPrice : undefined,
                oldPrice: activePromo ? activePromo.oldPrice : undefined,
                promotionImage: activePromo
                  ? activePromo.image
                  : seller.activePromotion.image,
              }
            : null,
        };
      });
      return transformed;
    });

    res.json(transformedProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get products by seller
exports.getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    // Validate sellerId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ message: "Invalid seller ID" });
    }

    // Check if seller exists and is a Seller
    const seller = await User.findOne({ _id: sellerId, role: "seller" });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Find products where sellerId is in the sellers array
    const products = await Product.find({ "sellers.sellerId": sellerId })
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate({
        path: "sellers.sellerId",
        select: "shopName",
      })
      .populate({
        path: "sellers.promotions.promotionId",
        select: "discountRate isActive startDate endDate name",
      })
      .lean();

    // Filter the sellers array and transform promotion data
    const filteredProducts = products.map((product) => {
      const filteredSellers = product.sellers
        .filter((seller) => seller.sellerId._id.toString() === sellerId)
        .map((seller) => {
          // Process promotions to include only relevant fields
          const activePromotion = seller.promotions.find(
            (promo) => promo.promotionId?.isActive
          );

          return {
            ...seller,
            promotions: activePromotion
              ? [
                  {
                    promotionId: activePromotion.promotionId._id,
                    name: activePromotion.promotionId.name,
                    discountRate: activePromotion.promotionId.discountRate,
                    isActive: activePromotion.promotionId.isActive,
                    startDate: activePromotion.promotionId.startDate,
                    endDate: activePromotion.promotionId.endDate,
                  },
                ]
              : [],
            hasActivePromotion: !!activePromotion,
            activeDiscountRate: activePromotion?.promotionId.discountRate || 0,
          };
        });

      return {
        ...product,
        sellers: filteredSellers,
      };
    });

    // Transform and return the products
    const transformedProducts = filteredProducts.map(transformProductData);
    res.json(transformedProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 4;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Find the current product
    const currentProduct = await Product.findById(productId)
      .populate("sellers.tags")
      .populate(
        "sellers.activePromotion",
        "name discountRate startDate endDate isActive image"
      )
      .lean();

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Track all selected product IDs to prevent duplicates
    const existingIds = new Set([productId]); // Start with current product ID
    let relatedProducts = [];

    // Extract tags from all sellers
    const currentTags = new Set();
    currentProduct.sellers.forEach((seller) => {
      if (seller.tags && seller.tags.length > 0) {
        seller.tags.forEach((tag) => currentTags.add(tag._id.toString()));
      }
    });

    // Extract promotion names and discount rates
    const promotionNames = new Set();
    const discountRates = new Set();
    currentProduct.sellers.forEach((seller) => {
      if (seller.activePromotion) {
        if (seller.activePromotion.name)
          promotionNames.add(seller.activePromotion.name);
        if (seller.activePromotion.discountRate)
          discountRates.add(seller.activePromotion.discountRate);
      }
    });

    // Get category details
    const { categoryDetails } = currentProduct;
    const categoryId =
      categoryDetails?.category?._id || categoryDetails?.category;
    const subcategoryGroup = categoryDetails?.subcategory?.group || "";
    const subcategoryItem = categoryDetails?.subcategory?.item || "";

    // Split product name into keywords
    const commonWords = new Set([
      "and",
      "the",
      "of",
      "for",
      "with",
      "to",
      "a",
      "an",
      "in",
      "on",
      "at",
    ]);
    const nameKeywords = currentProduct.name
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !commonWords.has(word));

    // Strategy 1: Find products with matching tags (minimum 2 tags in common)
    if (currentTags.size >= 2) {
      const tagMatches = await Product.aggregate([
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(productId) },
            "sellers.tags": { $in: Array.from(currentTags) },
          },
        },
        {
          $addFields: {
            commonTagsCount: {
              $size: {
                $setIntersection: [
                  Array.from(currentTags),
                  {
                    $reduce: {
                      input: "$sellers.tags",
                      initialValue: [],
                      in: { $concatArrays: ["$$value", "$$this"] },
                    },
                  },
                ],
              },
            },
          },
        },
        {
          $match: { commonTagsCount: { $gte: 2 } },
        },
        { $sample: { size: limit } },
        { $limit: limit },
      ]);

      tagMatches.forEach((product) => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Strategy 2: Promotion name or discount rate matching
    if (
      relatedProducts.length < limit &&
      (promotionNames.size > 0 || discountRates.size > 0)
    ) {
      const additionalNeeded = limit - relatedProducts.length;
      const promotionMatches = await Product.aggregate([
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(productId) },
            $or: [
              {
                "sellers.activePromotion.name": {
                  $in: Array.from(promotionNames),
                },
              },
              {
                "sellers.activePromotion.discountRate": {
                  $in: Array.from(discountRates),
                },
              },
            ],
          },
        },
        {
          $addFields: {
            promotionScore: {
              $sum: [
                {
                  $cond: [
                    {
                      $in: [
                        "$sellers.activePromotion.name",
                        Array.from(promotionNames),
                      ],
                    },
                    2, // Higher weight for matching name
                    0,
                  ],
                },
                {
                  $cond: [
                    {
                      $in: [
                        "$sellers.activePromotion.discountRate",
                        Array.from(discountRates),
                      ],
                    },
                    1, // Lower weight for matching discount rate
                    0,
                  ],
                },
              ],
            },
          },
        },
        { $sort: { promotionScore: -1 } },
        { $sample: { size: additionalNeeded } },
        { $limit: additionalNeeded },
      ]);

      promotionMatches.forEach((product) => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Strategy 3: Category/subcategory matching
    if (relatedProducts.length < limit && categoryId) {
      const additionalNeeded = limit - relatedProducts.length;
      const categoryMatches = await Product.aggregate([
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(productId) },
            "categoryDetails.category": categoryId,
            "categoryDetails.subcategory.group": subcategoryGroup,
            "categoryDetails.subcategory.item": subcategoryItem,
          },
        },
        { $sample: { size: additionalNeeded } },
        { $limit: additionalNeeded },
      ]);

      categoryMatches.forEach((product) => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Strategy 4: Name similarity
    if (relatedProducts.length < limit && nameKeywords.length > 0) {
      const additionalNeeded = limit - relatedProducts.length;
      const allProducts = await Product.find({
        _id: { $ne: new mongoose.Types.ObjectId(productId) },
      }).lean();

      const scoredProducts = allProducts
        .map((product) => {
          if (existingIds.has(product._id.toString())) {
            return null; // Skip already selected products
          }
          const productName = product.name.toLowerCase();
          let score = 0;
          nameKeywords.forEach((keyword) => {
            if (productName.includes(keyword)) {
              score += 1;
            }
          });
          return score > 0 ? { ...product, score } : null;
        })
        .filter((p) => p !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, additionalNeeded);

      scoredProducts.forEach((product) => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Strategy 5: Random fallback
    if (relatedProducts.length < limit) {
      const additionalNeeded = limit - relatedProducts.length;
      const randomProducts = await Product.aggregate([
        {
          $match: {
            _id: {
              $nin: Array.from(existingIds).map(
                (id) => new mongoose.Types.ObjectId(id)
              ),
            },
          },
        },
        { $sample: { size: additionalNeeded } },
        { $limit: additionalNeeded },
      ]);

      randomProducts.forEach((product) => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Populate necessary fields
    const populatedProducts = await Product.populate(relatedProducts, [
      { path: "categoryDetails.category", select: "name" },
      { path: "sellers.sellerId", select: "shopName" },
      {
        path: "sellers.activePromotion",
        select: "name discountRate startDate endDate isActive image",
      },
      { path: "images", select: "url" },
    ]);

    // Transform products to include promotion details with newPrice and oldPrice
    const transformedProducts = populatedProducts.map((product) => {
      const transformed = transformProductData(product);
      transformed.sellers = product.sellers.map((seller) => {
        const activePromo = seller.promotions?.find(
          (promo) =>
            promo.promotionId.toString() ===
            (seller.activePromotion?._id?.toString() || "")
        );
        return {
          ...seller,
          activePromotion: seller.activePromotion
            ? {
                ...seller.activePromotion,
                newPrice: activePromo ? activePromo.newPrice : undefined,
                oldPrice: activePromo ? activePromo.oldPrice : undefined,
                promotionImage: activePromo
                  ? activePromo.image
                  : seller.activePromotion.image,
              }
            : null,
        };
      });
      return transformed;
    });

    res.status(200).json(transformedProducts.slice(0, limit));
  } catch (error) {
    console.error("Error getting related products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.getSimilarProducts = async (req, res) => {
  try {
    const { productId, limit = 5 } = req.query;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Find the reference product
    const referenceProduct = await Product.findById(productId)
      .populate("categoryDetails.category", "name")
      .populate("sellers.sellerId", "shopName")
      .lean();

    if (!referenceProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Build query to exclude the reference product
    const query = {
      _id: { $ne: productId },
    };

    // Scoring weights
    const weights = {
      category: 30,
      subcategoryGroup: 20,
      subcategoryItem: 10,
      tags: 25,
      seller: 10,
      promotion: 5,
    };

    // Find potential similar products
    const products = await Product.find(query)
      .populate("categoryDetails.category", "name")
      .populate("sellers.sellerId", "shopName")
      .populate({
        path: "sellers.activePromotion",
        select: "name discountRate startDate endDate isActive image",
      })
      .lean();

    // Calculate similarity scores
    const scoredProducts = products.map((product) => {
      let score = 0;

      // Category match
      if (
        product.categoryDetails.category._id.toString() ===
        referenceProduct.categoryDetails.category._id.toString()
      ) {
        score += weights.category;

        // Subcategory group match
        if (
          product.categoryDetails.subcategory.group ===
          referenceProduct.categoryDetails.subcategory.group
        ) {
          score += weights.subcategoryGroup;

          // Subcategory item match
          if (
            product.categoryDetails.subcategory.item ===
            referenceProduct.categoryDetails.subcategory.item
          ) {
            score += weights.subcategoryItem;
          }
        }
      }

      // Tags match
      const referenceTags = referenceProduct.sellers
        .flatMap((seller) => seller.tags)
        .map((tag) => tag.toString());
      const productTags = product.sellers
        .flatMap((seller) => seller.tags)
        .map((tag) => tag.toString());
      const commonTags = referenceTags.filter((tag) =>
        productTags.includes(tag)
      );
      score += (commonTags.length / (referenceTags.length || 1)) * weights.tags;

      // Seller match
      const referenceSellers = referenceProduct.sellers.map((seller) =>
        seller.sellerId._id.toString()
      );
      const productSellers = product.sellers.map((seller) =>
        seller.sellerId._id.toString()
      );
      const commonSellers = referenceSellers.filter((seller) =>
        productSellers.includes(seller)
      );
      score +=
        (commonSellers.length / (referenceSellers.length || 1)) *
        weights.seller;

      // Promotion match
      const referencePromotions = referenceProduct.sellers
        .map((seller) => seller.activePromotion?._id?.toString())
        .filter(Boolean);
      const productPromotions = product.sellers
        .map((seller) => seller.activePromotion?._id?.toString())
        .filter(Boolean);
      const commonPromotions = referencePromotions.filter((promo) =>
        productPromotions.includes(promo)
      );
      score +=
        (commonPromotions.length / (referencePromotions.length || 1)) *
        weights.promotion;

      return { product, score };
    });

    // Sort by score and limit results
    const similarProducts = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map(({ product }) => {
        const transformed = transformProductData(product);
        transformed.sellers = product.sellers.map((seller) => {
          const activePromo = seller.promotions.find(
            (promo) =>
              promo.promotionId.toString() ===
              (seller.activePromotion?._id?.toString() || "")
          );
          return {
            ...seller,
            activePromotion: seller.activePromotion
              ? {
                  ...seller.activePromotion,
                  newPrice: activePromo ? activePromo.newPrice : undefined,
                  oldPrice: activePromo ? activePromo.oldPrice : undefined,
                  promotionImage: activePromo
                    ? activePromo.image
                    : seller.activePromotion.image,
                }
              : null,
          };
        });
        return transformed;
      });

    res.json(similarProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
