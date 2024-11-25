const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addNewAirport = async (req, res, next) => {
    let { name, city, country, airportCode } = req.body;
    
}

const deleteAirport = async (req, res, next) => {

}