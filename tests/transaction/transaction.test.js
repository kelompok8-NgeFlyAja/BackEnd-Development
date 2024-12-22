const request = require("supertest");
const bcrypt = require('bcrypt');
const app = require("../../app");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const password = process.env.PASSWORD_SALT
const salt = parseInt(process.env.SALT)

const hashedPassword = bcrypt.hashSync(password, salt);

let authToken, bookingId;