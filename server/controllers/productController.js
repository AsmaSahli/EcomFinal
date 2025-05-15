const Product = require("../models/Product");
const Category = require("../models/Category");
const { User } = require("../models/User");
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

// Helper function to transform product data
const transformProductData = (product) => {
  const transformed = product.toObject ? product.toObject() : product;
  
  // Simplify category details
  if (transformed.categoryDetails && transformed.categoryDetails.category) {
    transformed.categoryDetails = {
      category: {
        _id: transformed.categoryDetails.category._id,
        name: transformed.categoryDetails.category.name
      },
      subcategory: transformed.categoryDetails.subcategory
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
        path: "categoryDetails.category",
        select: "name"
      })
      .populate("sellers.reviews")
      .populate("createdBy");
      
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
        select: "name"
      })
      .populate("sellers.reviews", "rating comment createdAt userName")
      .populate("createdBy", "name email")
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion')
      .lean(); // Use lean for performance since we'll modify the document

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Filter sellers array if sellerId is provided
    if (seller) {
      product.sellers = product.sellers.filter(
        (s) => s.sellerId && s.sellerId._id.toString() === seller
      );
      if (product.sellers.length === 0) {
        return res.status(404).json({ message: "Seller not found for this product" });
      }
    }

    // Transform the product data
    const transformedProduct = transformProductData(product);

    // Wrap the response in { product: {...} } to match frontend expectations
    res.status(200).json({ product: transformedProduct });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get product by reference
exports.getProductByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    // Validate reference
    if (!reference || typeof reference !== 'string') {
      return res.status(400).json({ message: 'Invalid product reference' });
    }

    const product = await Product.findOne({ reference })
      .populate({
        path: 'sellers.sellerId',
        select: 'name email'
      })
      .populate({
        path: 'sellers.tags',
        select: 'name'
      })
      .populate({
        path: 'categoryDetails.category',
        select: 'name'
      })
      .populate({
        path: 'sellers.reviews',
        select: 'rating comment'
      })
      .populate({
        path: 'createdBy',
        select: 'name email'
      });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Ensure categoryDetails.subcategory is present (fallback for legacy data)
    if (!product.categoryDetails?.subcategory) {
      product.categoryDetails.subcategory = { group: '', item: '' };
    }

    const transformedProduct = transformProductData(product);
    res.status(200).json(transformedProduct);
  } catch (error) {
    console.error('Error in getProductByReference:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

    if (!req.body.sellerId || typeof req.body.sellerId !== 'string') {
      return res.status(400).json({ error: "Valid sellerId is required" });
    }

    // Validate category details
    if (!req.body.categoryDetails || 
        !req.body.categoryDetails.category ||
        !req.body.categoryDetails.subcategory ||
        !req.body.categoryDetails.subcategory.group ||
        !req.body.categoryDetails.subcategory.item) {
      return res.status(400).json({ error: "Complete category details are required (category, subcategory group, and item)" });
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
      categoryDetails: {
        category: req.body.categoryDetails.category,
        subcategory: {
          group: req.body.categoryDetails.subcategory.group,
          item: req.body.categoryDetails.subcategory.item
        }
      },
      sellers: [{
        sellerId: req.body.sellerId,
        price: req.body.price,
        stock: req.body.stock,
        tags: Array.isArray(req.body.tags) ? req.body.tags : [],
        warranty: req.body.warranty || '',
        reviews: []
      }]
    };

    const product = await Product.create(productData);
    const transformedProduct = transformProductData(product);
    res.status(201).json(transformedProduct);
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
            reviews: []
          }
        }
      },
      { new: true, runValidators: true }
    )
      .populate('sellers.sellerId')
      .populate('sellers.reviews')
      .populate({
        path: 'categoryDetails.category',
        select: 'name'
      });

    const transformedProduct = transformProductData(updatedProduct);
    res.status(200).json(transformedProduct);
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

    if (!price && !stock && !warranty) {
      return res.status(400).json({
        success: false,
        message: "At least one field (price, stock, or warranty) must be provided"
      });
    }

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
    )
    .populate({
      path: 'categoryDetails.category',
      select: 'name'
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product or seller not found"
      });
    }

    const updatedSeller = product.sellers.find(seller => 
      seller.sellerId.toString() === sellerId
    );

    if (!updatedSeller) {
      return res.status(404).json({
        success: false,
        message: "Seller data not found after update"
      });
    }

    const transformedProduct = transformProductData(product);

    return res.status(200).json({
      success: true,
      message: "Seller product updated successfully",
      data: transformedProduct
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

    const sellerExists = product.sellers.some(s => s.sellerId.toString() === sellerId);
    if (!sellerExists) {
      return res.status(404).json({ message: "Seller not found for this product" });
    }

    product.sellers = product.sellers.filter(s => s.sellerId.toString() !== sellerId);
    await product.save();

    const updatedProduct = await Product.findById(productId)
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews')
      .populate({
        path: 'categoryDetails.category',
        select: 'name'
      })
      .populate('createdBy')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

    const transformedProduct = transformProductData(updatedProduct);
    res.status(200).json({
      message: "Seller removed from product",
      product: transformedProduct
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
      description: req.body.description
    };

    // Handle categoryDetails update if provided
    if (req.body.categoryDetails) {
      productData.categoryDetails = {
        category: req.body.categoryDetails.category,
        subcategory: {
          group: req.body.categoryDetails.subcategory.group,
          item: req.body.categoryDetails.subcategory.item
        }
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
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews')
      .populate({
        path: 'categoryDetails.category',
        select: 'name'
      })
      .populate('createdBy')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

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
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews')
      .populate({
        path: 'categoryDetails.category',
        select: 'name'
      })
      .populate('createdBy')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

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
      img => img.publicId === req.params.publicId
    );

    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    await cloudinary.uploader.destroy(req.params.publicId);

    product.images.splice(imageIndex, 1);
    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate('sellers.sellerId')
      .populate('sellers.tags')
      .populate('sellers.reviews')
      .populate({
        path: 'categoryDetails.category',
        select: 'name'
      })
      .populate('createdBy')
      .populate('sellers.promotions.promotionId')
      .populate('sellers.activePromotion');

    const transformedProduct = transformProductData(updatedProduct);
    res.status(200).json(transformedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search products by reference or name
exports.searchProducts = async (req, res) => {
  try {
    const { query, reference } = req.query;

    // Validate inputs
    if (!query && !reference) {
      return res.status(400).json({ message: 'Query or reference parameter is required' });
    }

    if (reference) {
      // Validate reference
      if (typeof reference !== 'string' || reference.trim() === '') {
        return res.status(400).json({ message: 'Invalid product reference' });
      }

      const product = await Product.findOne({ reference })
        .select('reference name description images categoryDetails')
        .populate({
          path: 'sellers.sellerId',
          select: 'name email'
        })
        .populate({
          path: 'sellers.tags',
          select: 'name'
        })
        .populate({
          path: 'sellers.reviews',
          select: 'rating comment'
        })
        .populate({
          path: 'categoryDetails.category',
          select: 'name'
        })
        .lean();

      if (product && !product.categoryDetails?.subcategory) {
        product.categoryDetails.subcategory = { group: '', item: '' };
      }

      return res.status(200).json(product ? [transformProductData(product)] : []);
    }

    // Validate query
    if (typeof query !== 'string' || query.length < 3) {
      return res.status(400).json({ 
        message: 'Search query must be at least 3 characters long' 
      });
    }

    const products = await Product.find({
      $or: [
        { reference: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(10)
      .select('reference name description images categoryDetails')
      .populate({
        path: 'sellers.sellerId',
        select: 'name email'
      })
      .populate({
        path: 'sellers.tags',
        select: 'name'
      })
      .populate({
        path: 'sellers.reviews',
        select: 'rating comment'
      })
      .populate({
        path: 'categoryDetails.category',
        select: 'name'
      })
      .lean();

    // Ensure subcategory is present for all products
    products.forEach(product => {
      if (!product.categoryDetails?.subcategory) {
        product.categoryDetails.subcategory = { group: '', item: '' };
      }
    });

    const transformedProducts = products.map(transformProductData);
    res.status(200).json(transformedProducts);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get products by seller ID
exports.getProductsBySellers = async (req, res) => {
  try {
    const { id: sellerId } = req.params;
    const { page = 1, limit = 10, search = '' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(400).json({ error: "Invalid seller ID" });
    }

    const skip = (page - 1) * limit;

    const query = {
      'sellers.sellerId': sellerId
    };

    if (search && search.trim().length > 0) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate({
        path: 'categoryDetails.category',
        select: 'name'
      })
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
        path: 'sellers.reviews'
      })
      .populate({
        path: 'sellers.promotions.promotionId',
        select: 'name discountRate startDate endDate isActive image'
      })
      .populate({
        path: 'sellers.activePromotion',
        select: 'name discountRate startDate endDate isActive image'
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const transformedProducts = products.map(product => {
      const sellerInfo = product.sellers.find(s => 
        s.sellerId && s.sellerId._id.toString() === sellerId
      );

      // Ensure oldPrice and newPrice are included in promotions
      if (sellerInfo && sellerInfo.promotions) {
        sellerInfo.promotions = sellerInfo.promotions.map(promo => ({
          ...promo,
          oldPrice: promo.oldPrice || null,
          newPrice: promo.newPrice || null,
          promotionId: promo.promotionId // Populated promotion details
        }));
      }

      const transformed = transformProductData(product);
      return {
        ...transformed,
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
    const { categoryDetails, group, item } = req.query;
    const query = {};

    // If categoryDetails is provided, find the category by name
    if (categoryDetails) {
      const category = await Category.findOne({ name: categoryDetails });
      if (!category) {
        return res.status(404).json({ message: `Category '${categoryDetails}' not found` });
      }
      query["categoryDetails.category"] = category._id;
    }

    // Add group and item to the query if provided
    if (group) query["categoryDetails.subcategory.group"] = group;
    if (item) query["categoryDetails.subcategory.item"] = item;

    // Find products matching the query and populate category and seller details
    const products = await Product.find(query)
      .populate({
        path: "categoryDetails.category",
        select: "name",
      })
      .populate({
        path: "sellers.sellerId",
        select: "shopName",
      });

    // Transform and return the products
    const transformedProducts = products.map(transformProductData);
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
      return res.status(400).json({ message: 'Invalid seller ID' });
    }

    // Check if seller exists and is a Seller
    const seller = await User.findOne({ _id: sellerId, role: 'seller' });
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Find products where sellerId is in the sellers array
    const products = await Product.find({ 'sellers.sellerId': sellerId })
      .populate({
        path: 'categoryDetails.category',
        select: 'name',
      })
      .populate({
        path: 'sellers.sellerId',
        select: 'shopName',
      })
      .populate({
        path: 'sellers.promotions.promotionId',
        select: 'discountRate isActive startDate endDate name',
      })
      .lean();

    // Filter the sellers array and transform promotion data
    const filteredProducts = products.map(product => {
      const filteredSellers = product.sellers.filter(
        seller => seller.sellerId._id.toString() === sellerId
      ).map(seller => {
        // Process promotions to include only relevant fields
        const activePromotion = seller.promotions.find(
          promo => promo.promotionId?.isActive
        );

        return {
          ...seller,
          promotions: activePromotion ? [{
            promotionId: activePromotion.promotionId._id,
            name: activePromotion.promotionId.name,
            discountRate: activePromotion.promotionId.discountRate,
            isActive: activePromotion.promotionId.isActive,
            startDate: activePromotion.promotionId.startDate,
            endDate: activePromotion.promotionId.endDate
          }] : [],
          hasActivePromotion: !!activePromotion,
          activeDiscountRate: activePromotion?.promotionId.discountRate || 0
        };
      });

      return {
        ...product,
        sellers: filteredSellers
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
      .populate('sellers.tags')
      .lean();

    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Track all selected product IDs to prevent duplicates
    const existingIds = new Set([productId]); // Start with current product ID
    let relatedProducts = [];

    // Extract tags from all sellers
    const currentTags = new Set();
    currentProduct.sellers.forEach(seller => {
      if (seller.tags && seller.tags.length > 0) {
        seller.tags.forEach(tag => currentTags.add(tag._id.toString()));
      }
    });

    // Get category details
    const { categoryDetails } = currentProduct;
    const categoryId = categoryDetails?.category?._id || categoryDetails?.category;
    const subcategoryGroup = categoryDetails?.subcategory?.group || '';
    const subcategoryItem = categoryDetails?.subcategory?.item || '';

    // Split product name into keywords
    const commonWords = new Set(['and', 'the', 'of', 'for', 'with', 'to', 'a', 'an', 'in', 'on', 'at']);
    const nameKeywords = currentProduct.name
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word));

    // Strategy 1: Find products with matching tags (minimum 2 tags in common)
    if (currentTags.size >= 2) {
      const tagMatches = await Product.aggregate([
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(productId) },
            'sellers.tags': { $in: Array.from(currentTags) }
          }
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
                      in: { $concatArrays: ["$$value", "$$this"] }
                    }
                  }
                ]
              }
            }
          }
        },
        {
          $match: { commonTagsCount: { $gte: 2 } }
        },
        { $sample: { size: limit } },
        { $limit: limit }
      ]);

      tagMatches.forEach(product => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Strategy 2: Category/subcategory matching
    if (relatedProducts.length < limit && categoryId) {
      const additionalNeeded = limit - relatedProducts.length;
      const categoryMatches = await Product.aggregate([
        {
          $match: {
            _id: { $ne: new mongoose.Types.ObjectId(productId) },
            'categoryDetails.category': categoryId,
            'categoryDetails.subcategory.group': subcategoryGroup,
            'categoryDetails.subcategory.item': subcategoryItem
          }
        },
        { $sample: { size: additionalNeeded } },
        { $limit: additionalNeeded }
      ]);

      categoryMatches.forEach(product => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Strategy 3: Name similarity
    if (relatedProducts.length < limit && nameKeywords.length > 0) {
      const additionalNeeded = limit - relatedProducts.length;
      const allProducts = await Product.find({
        _id: { $ne: new mongoose.Types.ObjectId(productId) }
      }).lean();

      const scoredProducts = allProducts
        .map(product => {
          if (existingIds.has(product._id.toString())) {
            return null; // Skip already selected products
          }
          const productName = product.name.toLowerCase();
          let score = 0;
          nameKeywords.forEach(keyword => {
            if (productName.includes(keyword)) {
              score += 1;
            }
          });
          return score > 0 ? { ...product, score } : null;
        })
        .filter(p => p !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, additionalNeeded);

      scoredProducts.forEach(product => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Strategy 4: Random fallback
    if (relatedProducts.length < limit) {
      const additionalNeeded = limit - relatedProducts.length;
      const randomProducts = await Product.aggregate([
        { $match: { _id: { $nin: Array.from(existingIds).map(id => new mongoose.Types.ObjectId(id)) } } },
        { $sample: { size: additionalNeeded } },
        { $limit: additionalNeeded }
      ]);

      randomProducts.forEach(product => {
        if (!existingIds.has(product._id.toString())) {
          relatedProducts.push(product);
          existingIds.add(product._id.toString());
        }
      });
    }

    // Populate necessary fields
    const populatedProducts = await Product.populate(relatedProducts, [
      { path: 'categoryDetails.category', select: 'name' },
      { path: 'sellers.sellerId', select: 'shopName' },
      { path: 'images', select: 'url' }
    ]);

    // Transform products
    const transformedProducts = populatedProducts.map(transformProductData);

    res.status(200).json(transformedProducts.slice(0, limit)); // Ensure exact limit
  } catch (error) {
    console.error('Error getting related products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};