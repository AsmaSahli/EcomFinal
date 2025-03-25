const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");


router.get("/", categoriesController.getCategories);
router.post("/", categoriesController.createCategory);
router.delete("/:id", categoriesController.deleteCategory);
router.put("/:id", categoriesController.updateCategory);

module.exports = (app) => app.use("/api/categories", router);
