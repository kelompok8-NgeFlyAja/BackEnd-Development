const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addNewAirport = async (req, res, next) => {
    try {
        const { name, city, country, continent, airportCode } = req.body;
        if(typeof(name)!== 'string' || typeof(city)!== 'string' || typeof(country)!== 'string' || typeof(airportCode)!== 'string' || typeof(continent)!== 'string') {
            const error = new Error("Invalid input data");
			error.status(400);
			throw error;
        }
        if (airportCode.length !== 3) {
            const error = new Error("Invalid input data");
			error.status(400);
			throw error;
        }
        if (!name || !city || !country || !continent || !airportCode) {
            return res.status(400).json({ message: 'Please provide all required fields' });
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
            message: 'Airport added successfully',
            airport,
        });
    } catch (error) {
        next(error);
    }
};

const getAllAirports = async (req, res, next) => {
    try {
        const airports = await prisma.airports.findMany();
        return res.status(200).json({ airports });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching airports', error: error.message });
    }
}

const deleteAirport = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            const error = new Error("Please provide an ID");
			error.status(400);
			throw error;
        }

        const airport = await prisma.airports.findUnique({
            where: { id },
        });

        if (!airport) {
            const error = new Error("Airport not found");
			error.status(404);
			throw error;
        }

        await prisma.airports.delete({
            where: { id },
        });

        return res.status(200).json({ message: 'Airport deleted successfully', airport });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

const addMultipleAirports = async (req, res, next) => {
    try {
        const airports = req.body;
        const airportData = airports.map(airport => {
            const { name, city, country, continent, airportCode } = airport;
            if (![name || city || country || continent || airportCode].every(field => typeof field === 'string' && field.trim() !== '')) {
                return null;
            }

            return {
                name,
                city,
                country,
                continent,
                airportCode,
            };
        }).filter(Boolean);
        const newAirports = await prisma.airports.createMany({
            data: airportData,
        });

        return res.status(201).json({
            message: 'Airports added successfully',
            airports: newAirports,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error adding airports', error: error.message });
    }
}


module.exports = { addNewAirport, deleteAirport, getAllAirports, addMultipleAirports };