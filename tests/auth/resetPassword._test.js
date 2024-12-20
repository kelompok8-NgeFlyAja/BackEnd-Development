const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;


beforeEach(async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    await prisma.users.create({
        data: {
            name: 'test',
            email: 'test@mail.com',
            phoneNumber: '081234567890',
            password: hashedPassword,
            isActivated: true,
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


describe('Testing for reset password route', () => {
    describe('POST /verify-email', () => {
        test('It should return 400 when email is not filled', async () => {
            const response = await request(app).post('/verify-email').send({
                email: ''
            });
            expect(response.body).toHaveProperty('statusCode');
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('Failed');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Email diperlukan');
        });
        test('It should return 404 when email is not found', async () => {
            const response = await request(app).post('/verify-email').send({
                email: 'wrongemail@mail.com'
            });
            expect(response.body).toHaveProperty('statusCode');
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('Failed');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Email tidak ditemukan');
        });
        test('It should return 200 when email is found', async () => {
            const response = await request(app).post('/verify-email').send({
                email: 'test@mail.com'
            });
            expect(response.body).toHaveProperty('statusCode');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('Success');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Tautan reset password terkirim');
        });
    });
    describe('GET /verify-token/:token', () => {
        let token;
        token = jwt.sign({ email: 'test@mail.com', id: 1 }, JWT_SECRET);
        test('It should return 200 when token is valid', async () => {
            const response = await request(app).get(`/verify-token/${token}`)
            expect(response.body).toHaveProperty('statusCode');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('Success');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Token valid');
        });
    });
    describe('POST /reset-password/:token', () => {
        let token;
        token = jwt.sign({ email: 'john@mail.com', id: 1 }, JWT_SECRET);
        test('It should return 400 when newpassword is not filled', async () => {
            const response = await request(app).post(`/reset-password/${token}`).send({
                newPassword: '',
                confirmPassword: 'password'
            });
            expect(response.body).toHaveProperty('statusCode');
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('Failed');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Token dan password diperlukan');
        });
        test('It should return 400 when newPassword is not equal to confirm password', async () => {
            const response = await request(app).post(`/reset-password/${token}`).send({
                newPassword: 'newpassword',
                confirmPassword: 'password'
            });
            expect(response.body).toHaveProperty('statusCode');
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('Failed');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Password tidak sama');
        });
        test('It should return 400 when newPassword is less than 8 characters', async () => {
            const response = await request(app).post(`/reset-password/${token}`).send({
                newPassword: 'pass',
                confirmPassword: 'pass'
            });
            expect(response.body).toHaveProperty('statusCode');
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('Failed');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Password minimal 8 karakter');
        });
        test('It should return 200 when password is updated', async () => {
            const response = await request(app).post(`/reset-password/${token}`).send({
                newPassword: 'password',
                confirmPassword: 'password'
            });
            expect(response.body).toHaveProperty('statusCode');
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('status');
            expect(response.body.status).toBe('Success');
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toBe('Password berhasil direset, silahkan login kembali');
        });
    });
});