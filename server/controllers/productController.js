const Product = require("../models/Product");
const { uploadToCloudinary, cloudinary } = require('../utils/uploadsImages');
const mongoose = require('mongoose');
const Review = require('../models/Review');

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

exports.createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    if (!req.body.sellerId || typeof req.body.sellerId !== 'string') {
      return res.status(400).json({ error: "Valid sellerId is required" });
    }

    const uploadedImages = await processImages(req.files);

    const productData = {
      ...req.body,
      images: uploadedImages,
      sellerId: req.body.sellerId,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      category: req.body.category || null
    };

    if (req.body.subcategory) {
      try {
        productData.subcategory = JSON.parse(req.body.subcategory);
      } catch (e) {
        console.error('Error parsing subcategory:', e);
      }
    }

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

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("tags")
      .populate("category")
      .populate("promotion")
      .populate("warranty")
      .populate("reviews")
      .populate("sellerId");
      
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("tags")
      .populate("category")
      .populate("promotion")
      .populate("warranty")
      .populate("reviews");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const newImages = await processImages(req.files);
      productData.$push = { images: { $each: newImages } };
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true, runValidators: true }
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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

exports.addProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newImages = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    product.images.push(...newImages);
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.images = product.images.filter(
      img => img.publicId !== req.params.publicId
    );

    await cloudinary.uploader.destroy(req.params.publicId);
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
