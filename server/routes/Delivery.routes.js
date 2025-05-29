const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/DeliveryController");
const upload = require("../utils/upload"); 


router.post("/register", upload.fields([{ name: "cv", maxCount: 1 }]), deliveryController.registerDeliveryPerson);
router.get('/pending-count', deliveryController.getPendingDeliveriesCount);

router.get('/:orderId',deliveryController.getDeliveryStatus);

router.post("/create",deliveryController.createDelivery)
router.get("/",deliveryController.getAllDeliveries)
router.put("/status",deliveryController.updateDeliveryStatus)
router.get('/person/:deliveryPersonId', deliveryController.getDeliveriesByDeliveryPersonId);




module.exports = (app) => {
  app.use("/api/delivery", router);
};
