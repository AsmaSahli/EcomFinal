const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/DeliveryController");
const upload = require("../utils/upload"); 

const { getDeliveryStatus } = require('../controllers/DeliveryController');

router.post("/register", upload.fields([{ name: "cv", maxCount: 1 }]), deliveryController.registerDeliveryPerson);
router.get('/pending-count', deliveryController.getPendingDeliveriesCount);

router.get('/:orderId', getDeliveryStatus);
module.exports = (app) => {
  app.use("/api/delivery", router);
};
