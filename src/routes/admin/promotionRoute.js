const express = require("express");
const router = express.Router();
const multerUpload = require("../../config/multer");
const controller = require("../../controllers/admin/promotionController");
const authMiddleware = require("../../middlewares/authMiddleware");

router.post(
  "/add-promotions",
  multerUpload.single("image"),
  authMiddleware(['admin']),
  controller.addNewPromotion
);
router.get("/getAll", controller.getAllPromotion);
router.get("/getById/:id", controller.getPromotionById);
router.put(
  "/update/:id",
  multerUpload.single("image"),
  authMiddleware(['admin']),
  controller.updatePromotion
);
router.delete("/deleteById/:id", authMiddleware(['admin']), controller.deletePromotion);

module.exports = router;
