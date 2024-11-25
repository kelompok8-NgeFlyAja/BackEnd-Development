const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addNewRoute = async (req, res, next) => {
    let { departureId, arrivalId, duration } = req.body;
    
}

const getAllRoute = async (req, res, next) => {

}

const getUniqueRoute = async (req, res, next) => {

}

const updateRoute = async (req, res, next) => {

}

const deleteRoute = async (req, res, next) => {

}