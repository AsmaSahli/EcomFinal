const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subcategories: [
    {
      group: { type: String, required: true },
      items: [{ type: String, required: true }],
    },
  ],
});

module.exports = mongoose.model("Category", CategorySchema);
