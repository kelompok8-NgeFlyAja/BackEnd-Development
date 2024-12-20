const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const addNewAirport = async (req, res, next) => {
  try {
    const { name, city, country, continent, airportCode } = req.body;
    if(typeof(name)!== 'string' || typeof(city)!== 'string' || typeof(country)!== 'string' || typeof(airportCode)!== 'string' || typeof(continent)!== 'string') {
      const error = new Error("Invalid input data");
			error.statusCode = 400;
			throw error;
    }
    if (airportCode.length !== 3) {
      const error = new Error("Invalid input data");
      error.status(400);
      throw error;
    }
    if (!name || !city || !country || !continent || !airportCode) {
      const error = new Error("Please provide all required fields");
			error.statusCode = 400;
			throw error;
    }
    const airport = await prisma.airports.create({
        data: {
            name,
            city,
            country,
            continent,
            airportCode,
        },
    });
    return res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "Airport added successfully",
      data: airport,
    });
  } catch (error) {
    next(error);
  }
};

const getAllAirports = async (req, res, next) => {
  try {
    const airports = await prisma.airports.findMany();
    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "All Airport",
      data: airports,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAirport = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      const error = new Error("Please provide a valid ID");
			error.statusCode = 400;
			throw error;
    }
  // if (isNaN(id)) {
  //   return res.status(400).json({
  //     status: "failed",
  //     statusCode: 400,
  //     message: "Please provide a valid ID",
  //   });
  // }
    if (!airport) {
      const error = new Error("Airport not found");
			error.statusCode = 400;
			throw error;
    }
    await prisma.airports.delete({
        where: { id },
    });
    // Mengembalikan respons jika bandara ditemukan
    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Airport deleted successfully",
      data: airport,
    });
  } catch (error) {
    next(error);
  }
};

const addMultipleAirports = async (req, res, next) => {
  try {
    const airports = req.body;

    if (!airports || airports.length === 0) {
      return res.status(400).json({ message: "No data provided" });
    }

    const airportData = airports
      .map((airport) => {
        const { name, city, country, continent, airportCode } = airport;

        if (
          ![name, city, country, continent, airportCode].every(
            (field) => typeof field === "string" && field.trim() !== ""
          )
        ) {
          return null;
        }

        return {
          name,
          city,
          country,
          continent,
          airportCode,
        };
      })
      .filter(Boolean);

    if (airportData.length === 0) {
      const error = new Error("Invalid input data");
			error.statusCode = 400;
			throw error;
    }

    const newAirports = await prisma.airports.createMany({
      data: airportData,
    });

    return res.status(201).json({
      message: "Airports added successfully",
      airports: newAirports,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addNewAirport,
  deleteAirport,
  getAllAirports,
  addMultipleAirports,
};
