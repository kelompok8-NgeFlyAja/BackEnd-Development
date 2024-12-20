const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    await prisma.users.create({
        data: {
            name: 'test',
            email: 'test@mail.com',
            phoneNumber: '081234567890',
            password: hashedPassword,
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

describe('Testing for login route', () => {
    describe('POST /login', () => {
        test('It should return 400 when email and password are not provided', async () => {
            const login = await request(app).post('/login').send({
                email: '',
                password: ''
            });
            expect(login.body).toHaveProperty('statusCode');
            expect(login.statusCode).toBe(400);
            expect(login.body).toHaveProperty('status');
            expect(login.body.status).toBe('Failed');
            expect(login.body).toHaveProperty('message');
            expect(login.body.message).toBe('Email and password are required!');
        });
        test('It should return 400 when email or password are wrong', async () => {
            const login = await request(app).post('/login').send({
                email: 'wrongemail@mail.com',
                password: 'wrongpassword'
            });
            expect(login.body).toHaveProperty('statusCode');
            expect(login.statusCode).toBe(400);
            expect(login.body).toHaveProperty('status');
            expect(login.body.status).toBe('Failed');
            expect(login.body).toHaveProperty('message');
            expect(login.body.message).toBe('Email or password is wrong');
        });
        test('It should return 400 when account is not activated', async () => {
            const login = await request(app).post('/login').send({
                email: 'test@mail.com',
                password: 'password'
            });
            expect(login.body).toHaveProperty('statusCode');
            expect(login.statusCode).toBe(400);
            expect(login.body).toHaveProperty('status');
            expect(login.body.status).toBe('Failed');
            expect(login.body).toHaveProperty('message');
            expect(login.body.message).toBe('Please Activate Your Account First');
        });
        test('It should return 200 when login success', async () => {
            const login = await request(app).post('/login').send({
                email: 'john@mail.com',
                password: 'password'
            });
            expect(login.body).toHaveProperty('statusCode');
            expect(login.statusCode).toBe(200);
            expect(login.body).toHaveProperty('status');
            expect(login.body.status).toBe('Success');
            expect(login.body).toHaveProperty('message');
            expect(login.body.message).toBe('Login Successfull');
        });
    });
});