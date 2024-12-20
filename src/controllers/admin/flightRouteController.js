const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add a new route
const addNewRoute = async (req, res, next) => {
  try {
    const { seatClassId, departureAirportCode, arrivalAirportCode } = req.body;

    // Validasi input
    if (!seatClassId || !departureAirportCode || !arrivalAirportCode) {
      const error = new Error("All fields are required!");
      error.statusCode = 400;
			throw error;
    }

    const departureAirport = await prisma.airports.findFirst({
      where: {
        airportCode: {
          equals: departureAirportCode,
          mode: "insensitive", 
        },
      },
    });

    if (!departureAirport) {
      const error = new Error("Departure airport not found!");
      error.statusCode = 400;
			throw error;
    }

    const arrivalAirport = await prisma.airports.findFirst({
      where: {
        airportCode: {
          equals: arrivalAirportCode,
          mode: "insensitive", 
        },
      },
    });

    if (!arrivalAirport) {
      const error = new Error("Arrival airport not found!");
      error.statusCode = 400;
			throw error;
    }

    const existingRoute = await prisma.routes.findFirst({
      where: {
        seatClassId: Number(seatClassId),
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
      },
    });

    if (existingRoute) {
      const error = new Error("Route with these details already exists!");
            error.statusCode = 400;
			throw error;
    }
    
    // Tambahkan route baru
    const newRoute = await prisma.routes.create({
      data: {
        seatClassId: Number(seatClassId),
        departureAirportId: Number(departureAirport.id), 
        arrivalAirportId: Number(arrivalAirport.id), 
      },
    });

    return res.status(201).json({ 
      status: "success",
      statusCode: 200,
      message: "Route added successfully!", 
      data: newRoute 
    });
  } catch (error) {
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
      const error = new Error("Valid Route ID is required!");
      error.statusCode = 400;
			throw error;
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
      const error = new Error("Route not found!");
      error.statusCode = 404;
			throw error;
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
      const error = new Error("Valid Route ID is required!");
      error.statusCode = 400;
			throw error;
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
      const error = new Error("Valid Route ID is required!");
      error.statusCode = 400;
			throw error;
    }

    await prisma.routes.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: "Route deleted successfully!" });
  } catch (error) {
    console.error(error);
    if (error.code === "P2025") {
      const error = new Error("Route not found");
      error.statusCode = 404;
			throw error;
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
