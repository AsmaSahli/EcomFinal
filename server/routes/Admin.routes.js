const adminController = require("../controllers/AdminController");

module.exports = (app) => {
  app.put("/approve/:userId", adminController.approveApplication),
    app.put("/reject/:userId", adminController.rejectApplication),
    app.delete("/delete/:userId", adminController.deleteUser),
    app.patch("/status/:userId", adminController.toggleUserStatus);
  app.put("/suspend/:userId", adminController.suspendUser);
  app.put("/cancel-suspension/:userId", adminController.cancelSuspension);
};
