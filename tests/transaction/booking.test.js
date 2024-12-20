const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

beforeEach(async () => {
    await prisma.users.create({
        data: {
            name: 'test',
            email: 'test@mail.com',
            phoneNumber: '081212123434',
            password: 'password',
            isActivated: false,
        }
    });
});

afterEach(async () => {
    await prisma.users.deleteMany({
        where: {
            email: "test@mail.com"
        }
    });
});