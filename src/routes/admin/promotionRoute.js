const express = require("express");
const router = express.Router();
const multerUpload = require("../../config/multer");
const controller = require("../../controllers/admin/promotionController");

router.post(
  "/add-promotions",
  multerUpload.single("image"),
  controller.addNewPromotion
);
router.get("/getAll", controller.getAllPromotion);
router.get("/getById/:id", controller.getPromotionById);
router.put(
  "/update/:id",
  multerUpload.single("image"),
  controller.updatePromotion
);
router.delete("/deleteById/:id", controller.deletePromotion);

module.exports = router;
