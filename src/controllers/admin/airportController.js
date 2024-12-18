const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const addNewAirport = async (req, res, next) => {
  try {
    const { name, city, country, continent, airportCode } = req.body;

    // Periksa apakah ada field yang kosong
    if (!name || !city || !country || !continent || !airportCode) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "Please provide all required fields",
      });
    }

    // Periksa tipe data setelah memastikan semua field ada
    if (
      typeof name !== "string" ||
      typeof city !== "string" ||
      typeof country !== "string" ||
      typeof airportCode !== "string" ||
      typeof continent !== "string"
    ) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "Invalid input data",
      });
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
    // Mengambil ID dari parameter dan memastikannya berupa angka
    const id = parseInt(req.params.id);

    // if (isNaN(id)) {
    //   return res.status(400).json({
    //     status: "failed",
    //     statusCode: 400,
    //     message: "Please provide a valid ID",
    //   });
    // }

    // Cek apakah bandara dengan ID tersebut ada
    const airport = await prisma.airports.findUnique({
      where: { id },
    });

    // Jika bandara tidak ditemukan
    if (!airport) {
      return res.status(404).json({
        status: "failed",
        statusCode: 404,
        message: "Airport not found",
      });
    }

    // Menghapus bandara
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
    const airportData = airports
      .map((airport) => {
        const { name, city, country, continent, airportCode } = airport;
        if (
          ![name || city || country || continent || airportCode].every(
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
    const newAirports = await prisma.airports.createMany({
      data: airportData,
    });

    return res.status(201).json({
      message: "Airports added successfully",
      airports: newAirports,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error adding airports", error: error.message });
  }
};

module.exports = {
  addNewAirport,
  deleteAirport,
  getAllAirports,
  addMultipleAirports,
};
