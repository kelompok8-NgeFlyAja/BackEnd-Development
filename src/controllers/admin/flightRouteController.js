const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add a new route
const addNewRoute = async (req, res, next) => {
  try {
    const { seatClassId, departureId, arrivalId } = req.body;

    // Validasi input
    if (!seatClassId || !departureId || !arrivalId) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Tambahkan route baru
    const newRoute = await prisma.routes.create({
      data: {
        seatClassId: Number(seatClassId),
        departureAirportId: Number(departureId),
        arrivalAirportId: Number(arrivalId),
      },
    });

    return res
      .status(201)
      .json({ message: "Route added successfully!", data: newRoute });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Get all routes
const getAllRoute = async (req, res, next) => {
  try {
    const routes = await prisma.routes.findMany({
      include: {
        departureAirport: true,
        arrivalAirport: true,
        seatClass: true,
      },
    });

    return res
      .status(200)
      .json({ message: "Routes fetched successfully!", data: routes });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Get a unique route
const getUniqueRoute = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid Route ID is required!" });
    }

    const route = await prisma.routes.findUnique({
      where: { id: Number(id) },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        seatClass: true,
      },
    });

    if (!route) {
      return res.status(404).json({ message: "Route not found!" });
    }

    return res
      .status(200)
      .json({ message: "Route fetched successfully!", data: route });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Update a route
const updateRoute = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { seatClassId, departureId, arrivalId } = req.body;

    // Validasi input
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid  Route ID is required!" });
    }

    const updatedRoute = await prisma.routes.update({
      where: { id: Number(id) },
      data: {
        ...(seatClassId && { seatClassId: Number(seatClassId) }),
        ...(departureId && { departureAirportId: Number(departureId) }),
        ...(arrivalId && { arrivalAirportId: Number(arrivalId) }),
      },
    });

    return res
      .status(200)
      .json({ message: "Route updated successfully!", data: updatedRoute });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Route not found!" });
    }
    next(error);
  }
};

// Delete a route
const deleteRoute = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validasi ID
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid Route ID is required!" });
    }

    await prisma.routes.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Route deleted successfully!" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Route not found!" });
    }
    next(error);
  }
};

module.exports = {
  addNewRoute,
  getAllRoute,
  getUniqueRoute,
  updateRoute,
  deleteRoute,
};
