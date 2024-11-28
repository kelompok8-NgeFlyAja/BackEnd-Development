const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const imagekit = require("../../config/imagekit");

const addNewPromotion = async (req, res, next) => {
  try {
    const { promotionName, startDate, endDate, discount } = req.body;

    if (!promotionName || !req.file || !startDate || !endDate || !discount) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Proses pengunggahan gambar pertama ke ImageKit (hanya satu gambar disimpan)
    const fileData = req.file;
    const bufferData = fileData.buffer.toString("base64");

    // Upload ke ImageKit
    const uploadedImage = await imagekit.upload({
      fileName: fileData.originalname,
      file: bufferData,
    });

    const newPromotion = await prisma.promotions.create({
      data: {
        promotionName,
        image: uploadedImage.url, // Menyimpan URL gambar
        imageFieldId: uploadedImage.fileId, // Menyimpan fieldId
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        discount: parseInt(discount),
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Promotion added successfully!",
      data: newPromotion,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPromotion = async (req, res, next) => {
  try {
    const getPromotions = await prisma.promotions.findMany();
    return res.status(200).json({
      message: "All promotions",
      data: getPromotions,
    });
  } catch (error) {
    next(error);
  }
};

const getPromotionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid ID is required!" });
    }

    const getPromotionById = await prisma.promotions.findUnique({
      where: {
        id: parseInt(id),
      },
    });

    if (!getPromotionById) {
      return req.status(404).json({
        status: 404,
        message: "Promotion not found",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "Promotion found",
      data: getPromotionById,
    });
  } catch (error) {
    next(error);
  }
};

const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { promotionName, startDate, endDate, discount } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid ID is required!" });
    }

    // Cari promosi berdasarkan ID
    const existingPromotion = await prisma.promotions.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPromotion) {
      return res.status(404).json({ message: "Promotion not found!" });
    }

    let updatedImage = existingPromotion.image;

    // Jika ada file baru (gambar baru diunggah)
    if (req.file) {
      const fileData = req.file.buffer.toString("base64");

      // Hapus gambar lama dari ImageKit (jika ada)
      if (existingPromotion.image) {
        const imageFieldId = extractImageFieldId(existingPromotion.image);
        try {
          await imagekit.deleteFile(imageFieldId);
        } catch (error) {
          console.error("Failed to delete old image from ImageKit", error);
        }
      }

      // Unggah gambar baru ke ImageKit
      const uploadedImage = await imagekit.upload({
        fileName: req.file.originalname,
        file: fileData,
      });

      updatedImage = uploadedImage.url; // URL gambar baru
    }

    // Perbarui data promosi di database
    const updatedPromotion = await prisma.promotions.update({
      where: { id: parseInt(id) },
      data: {
        promotionName,
        image: updatedImage,
        startDate: startDate
          ? new Date(startDate)
          : existingPromotion.startDate,
        endDate: endDate ? new Date(endDate) : existingPromotion.endDate,
        discount: discount ? parseInt(discount) : existingPromotion.discount,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "Promotion updated successfully!",
      data: updatedPromotion,
    });
  } catch (error) {
    next(error);
  }
};

const extractImageFieldId = (imageUrl) => {
  // Menyesuaikan dengan pola URL ImageKit yang umum, mendukung path lebih panjang
  const regex = /\/([^/]+)(?:\?|\.)/;
  const match = imageUrl.match(regex);

  if (match && match[1]) {
    return match[1]; // Mengambil fileId dari URL
  } else {
    throw new Error("Invalid Image URL or fileId not found");
  }
};

const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid ID is required!" });
    }

    const promotion = await prisma.promotions.delete({
      where: {
        id: parseInt(id),
      },
    });

    // Hapus gambar dari ImageKit jika ada fieldId
    if (promotion.imageFieldId) {
      await imagekit.deleteFile(promotion.imageFieldId);
    }

    return res.status(200).json({
      status: 200,
      message: "Promotion deleted successfully!",
      data: promotion,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addNewPromotion,
  getAllPromotion,
  getPromotionById,
  updatePromotion,
  deletePromotion,
};
