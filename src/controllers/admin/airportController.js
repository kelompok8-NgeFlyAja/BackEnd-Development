if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addNewAirport = async (req, res, next) => {
    try {
        const { name, city, country, continent, airportCode } = req.body;
        if(typeof(name)!== 'string' || typeof(city)!== 'string' || typeof(country)!== 'string' || typeof(airportCode)!== 'string' || typeof(continent)!== 'string') {
            return res.status(400).json({message: "Invalid input data"});
        }
        if (!name || !city || !country || !continent || !airportCode) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
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
            message: 'Airport added successfully.',
            airport,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error adding airport.', error: error.message });
    }
};

const getAllAirports = async (req, res, next) => {
    try {
        const airports = await prisma.airports.findMany();
        return res.status(200).json({ airports });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching airports.', error: error.message });
    }
}

const deleteAirport = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({ message: 'Please provide an ID.' });
        }

        const airport = await prisma.airports.findUnique({
            where: { id },
        });

        if (!airport) {
            return res.status(404).json({ message: 'Airport not found.' });
        }

        await prisma.airports.delete({
            where: { id },
        });

        return res.status(200).json({ message: 'Airport deleted successfully.', airport });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting airport.', error: error.message });
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
            message: 'Airports added successfully.',
            airports: newAirports,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error adding airports.', error: error.message });
    }
}


module.exports = { addNewAirport, deleteAirport, getAllAirports, addMultipleAirports };