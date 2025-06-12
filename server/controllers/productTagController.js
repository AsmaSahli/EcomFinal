const ProductTag = require("../models/ProductTag");

exports.createProductTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = new ProductTag({ name });
    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllProductTags = async (req, res) => {
  try {
    const tags = await ProductTag.find();
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductTagById = async (req, res) => {
  try {
    const tag = await ProductTag.findById(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProductTag = async (req, res) => {
  try {
    const tag = await ProductTag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    res.status(200).json(tag);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProductTag = async (req, res) => {
  try {
    const tag = await ProductTag.findByIdAndDelete(req.params.id);
    if (!tag) return res.status(404).json({ message: "Tag not found" });
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
