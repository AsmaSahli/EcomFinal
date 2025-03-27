const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/DeliveryController");
const upload = require("../utils/upload"); 


router.post("/register", upload.fields([{ name: "cv", maxCount: 1 }]), deliveryController.registerDeliveryPerson);

module.exports = (app) => {
  app.use("/api/delivery", router);
};
