const Product = require("../models/Product");
const { uploadToCloudinary, cloudinary } = require('../utils/uploadsImages');
const mongoose = require('mongoose');

// Helper function to process images
const processImages = async (files) => {
  const imageUrls = [];
  for (const file of files) {
    try {
      const result = await uploadToCloudinary(file.buffer);
      imageUrls.push({
        url: result.secure_url,
        publicId: result.public_id
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
  return imageUrls;
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("sellers.sellerId")
      .populate("sellers.tags")
      .populate("category")
      .populate("sellers.reviews") // Updated to populate seller-specific reviews
      .populate("createdBy");
      
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("sellers.sellerId")
      .populate("sellers.tags")
      .populate("category")
      .populate("sellers.reviews") // Updated to populate seller-specific reviews
      .populate("createdBy")
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get product by reference
exports.getProductByReference = async (req, res) => {
  try {
    const product = await Product.findOne({ reference: req.params.reference })
      .populate("sellers.sellerId")
      .populate("sellers.tags")
      .populate("category")
      .populate("sellers.reviews") // Updated to populate seller-specific reviews
      .populate("createdBy");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    if (!req.body.reference) {
      return res.status(400).json({ error: "Product reference is required" });
    }

    if (!req.body.sellerId || typeof req.body.sellerId !== 'string') {
      return res.status(400).json({ error: "Valid sellerId is required" });
    }

    // Check if product with this reference already exists
    const existingProduct = await Product.findOne({ reference: req.body.reference });
    if (existingProduct) {
      return res.status(400).json({ 
        error: "Product with this reference already exists",
        existingProductId: existingProduct._id
      });
    }

    const uploadedImages = await processImages(req.files);

    const productData = {
      reference: req.body.reference,
      name: req.body.name,
      description: req.body.description,
      images: uploadedImages,
      createdBy: req.body.sellerId,
      category: req.body.category || null,
      sellers: [{
        sellerId: req.body.sellerId,
        price: req.body.price,
        stock: req.body.stock,
        tags: Array.isArray(req.body.tags) ? req.body.tags : [],
        warranty: req.body.warranty || '',
        reviews: [] // Initialize empty reviews array for the seller
      }]
    };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors
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

    const sellerExists = product.sellers.some(s => 
      s.sellerId.toString() === sellerId
    );
    if (sellerExists) {
      return res.status(400).json({ error: "Seller already exists for this product" });
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
            warranty: warranty || '',
            reviews: [] // Initialize empty reviews array for the new seller
          }
        }
      },
      { new: true, runValidators: true }
    )
      .populate('sellers.sellerId')
      .populate('sellers.reviews'); // Populate reviews for the updated product

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error adding seller:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.errors
    });
  }
};

// Update seller-specific product details
exports.updateSellerProduct = async (req, res) => {
  try {
    const { productId, sellerId } = req.params;
    const { price, stock, warranty } = req.body;

    // Validate input
    if (!price && !stock && !warranty) {
      return res.status(400).json({
        success: false,
        message: "At least one field (price, stock, or warranty) must be provided"
      });
    }

    // Prepare update object
    const updateFields = {};
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a non-negative number"
        });
      }
      updateFields['sellers.$.price'] = price;
    }
    if (stock !== undefined) {
      if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative number"
        });
      }
      updateFields['sellers.$.stock'] = stock;
    }
    if (warranty !== undefined) {
      if (!['', '1 year', '2 years', '3 years', 'lifetime'].includes(warranty)) {
        return res.status(400).json({
          success: false,
          message: "Invalid warranty value"
        });
      }
      updateFields['sellers.$.warranty'] = warranty;
    }

    // Update the product
    const product = await Product.findOneAndUpdate(
      { 
        _id: productId,
        "sellers.sellerId": sellerId
      },
      { $set: updateFields },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product or seller not found"
      });
    }

    // Find the updated seller data
    const updatedSeller = product.sellers.find(seller => 
      seller.sellerId.toString() === sellerId
    );

    if (!updatedSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller data not found after update"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seller product updated successfully",
      data: {
        price: updatedSeller.price,
        stock: updatedSeller.stock,
        warranty: updatedSeller.warranty
      }
    });

  } catch (error) {
    console.error("Error updating seller product:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating seller product",
      error: error.message
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

    // Check if the seller exists
    const sellerExists = product.sellers.some(s => s.sellerId.toString() === sellerId);
    if (!sellerExists) {
      return res.status(404).json({ message: "Seller not found for this product" });
    }

    // Remove the seller
    product.sellers = product.sellers.filter(s => s.sellerId.toString() !== sellerId);
    await product.save();

    // Populate reviews and other fields after saving
    const updatedProduct = await Product.findById(productId)
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews')
      .populate('category')
      .populate('createdBy')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

    res.status(200).json({
      message: "Seller removed from product",
      product: updatedProduct
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
      category: req.body.category
      // Don't include seller-specific fields here
    };

    if (req.files && req.files.length > 0) {
      const newImages = await processImages(req.files);
      productData.$push = { images: { $each: newImages } };
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    )
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews') // Populate reviews for the updated product
      .populate('category')
      .populate('createdBy')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete images from Cloudinary
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
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews') // Populate reviews for the updated product
      .populate('category')
      .populate('createdBy')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

    res.status(200).json(updatedProduct);
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

    // Find the image to delete
    const imageIndex = product.images.findIndex(
      img => img.publicId === req.params.publicId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(req.params.publicId);

    // Remove from array
    product.images.splice(imageIndex, 1);
    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews') // Populate reviews for the updated product
      .populate('category')
      .populate('createdBy')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search products by reference or name
exports.searchProducts = async (req, res) => {
  try {
    const { query, reference } = req.query;
    
    // If searching by reference
    if (reference) {
      const product = await Product.findOne({ reference })
        .select('reference name description images')
        .populate('sellers.sellerId')
        .populate('sellers.tags')
        .populate('sellers.reviews') // Populate reviews for search results
        .lean();
      
      return res.status(200).json(product ? [product] : []);
    }

    // Traditional search
    if (!query || query.length < 3) {
      return res.status(400).json({ 
        error: "Search query must be at least 3 characters long" 
      });
    }

    const products = await Product.find({
      $or: [
        { reference: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(10)
      .select('reference name description images')
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews') // Populate reviews for search results
      .lean();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get products by seller ID
exports.getProductsBySeller = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;

    // Validate sellerId
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Invalid seller ID" });
    }

    const skip = (page - 1) * limit;

    // Build query
    const query = {
      'sellers.sellerId': sellerId
    };

    // Add search condition if search term exists
    if (search && search.trim().length > 0) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Get products with pagination
    const products = await Product.find(query)
      .populate('category')
      .populate('createdBy')
      .populate({
        path: 'sellers.sellerId',
        select: 'name email'
      })
      .populate({
        path: 'sellers.tags',
        select: 'name'
      })
      .populate({
        path: 'sellers.reviews' // Populate seller-specific reviews
      })
      .populate({
        path: 'sellers.promotions.promotionId'
      })
      .populate({
        path: 'sellers.activePromotion'
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Transform the data to include only the relevant seller info
    const transformedProducts = products.map(product => {
      // Find the specific seller's info
      const sellerInfo = product.sellers.find(s => 
        s.sellerId && s.sellerId._id.toString() === sellerId
      );
      
      return {
        ...product,
        // Override the sellers array with just the relevant seller info
        sellers: sellerInfo ? [sellerInfo] : []
      };
    });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products: transformedProducts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};

// Get products filtered by category structure
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category, group, item } = req.query;
    const query = {};
    
    if (category) query['category.name'] = category;
    if (group) query['category.subcategory.group'] = group;
    if (item) query['category.subcategory.items'] = item;

    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get category statistics (counts)
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: {
            category: "$category.name",
            group: "$category.subcategory.group"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.category",
          groups: {
            $push: {
              group: "$_id.group",
              count: "$count"
            }
          },
          total: { $sum: "$count" }
        }
      }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};