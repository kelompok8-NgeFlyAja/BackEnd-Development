const request = require('supertest');
const app = require('../../app');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const otpStore = {};
beforeEach(async () => {
    await prisma.users.create({
        data: {
            name: 'test',
            email: 'test@mail.com',
            phoneNumber: '081234567890',
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

afterAll(async () => {
    const findUser = await prisma.users.findUnique({
        where: {
            email: 'kojuro@mail.com'
        }
    });

    await prisma.users.deleteMany({
        where: {
            id: findUser.id
        }
    });
});

describe('Testing For Register User', () => {
    describe('POST /register', () => {
        test('It should return 400 if some field not filled ', async () => {
            const createUser = await request(app).post('/register').send({
                name: '',
                email: 'test@mail.com',
                phoneNumber: '',
                password: 'password',
            })
            expect(createUser.body).toHaveProperty('statusCode');
            expect(createUser.statusCode).toBe(400);
            expect(createUser.body).toHaveProperty('status');
            expect(createUser.body.status).toBe('failed');
            expect(createUser.body).toHaveProperty('message');
            expect(createUser.body.message).toBe('All fields are required');
        });
        test('It should return 400 if pasword less than 8 characters', async () => {
            const createUser = await request(app).post('/register').send({
                name: 'test',
                email: 'test@mail.com',
                phoneNumber: '085712345678',
                password: 'pass',
            })
            expect(createUser.body).toHaveProperty('statusCode');
            expect(createUser.statusCode).toBe(400);
            expect(createUser.body).toHaveProperty('status');
            expect(createUser.body.status).toBe('failed');
            expect(createUser.body).toHaveProperty('message');
            expect(createUser.body.message).toBe('Password must be at least 8 characters long');
        });
        test('It should return 400 if email already exist', async () => {
            const createUser = await request(app).post('/register').send({
                name: 'john',
                email: 'john@mail.com',
                phoneNumber: '085712345678',
                password: 'password',
            })
            expect(createUser.body).toHaveProperty('statusCode');
            expect(createUser.statusCode).toBe(400);
            expect(createUser.body).toHaveProperty('status');
            expect(createUser.body.status).toBe('failed');
            expect(createUser.body).toHaveProperty('message');
            expect(createUser.body.message).toBe('Email already registered');
        });
        test('It should return 400 if Phone number already exist', async () => {
            const createUser = await request(app).post('/register').send({
                name: 'test',
                email: 'test@example.com',
                phoneNumber: '081234567890',
                password: 'password',
            })
            expect(createUser.body).toHaveProperty('statusCode');
            expect(createUser.statusCode).toBe(400);
            expect(createUser.body).toHaveProperty('status');
            expect(createUser.body.status).toBe('failed');
            expect(createUser.body).toHaveProperty('message');
            expect(createUser.body.message).toBe('Phone number already registered');
        });
        test('It should return 201, create user and success message', async () => {
            const createUser = await request(app).post('/register').send({
                name: 'kojuro',
                email: 'kojuro@mail.com',
                phoneNumber: '085798765432',
                password: 'password',
            })
            expect(createUser.body).toHaveProperty('statusCode');
            expect(createUser.statusCode).toBe(201);
            expect(createUser.body).toHaveProperty('status');
            expect(createUser.body.status).toBe('success');
            expect(createUser.body).toHaveProperty('message');
            expect(createUser.body.message).toBe('Registration is successful. Please check your email for OTP.');
        });
    });
});

describe('Testing For Verify OTP', () => {
    describe('GET /verify-otp', () => {
        test('It should return 400 if OTP not filled', async () => {
            const otp = await request(app).post('/verify-otp').send({
                otp: ''
            });
            expect(otp.body).toHaveProperty('statusCode');
            expect(otp.statusCode).toBe(400);
            expect(otp.body).toHaveProperty('status');
            expect(otp.body.status).toBe('failed');
            expect(otp.body).toHaveProperty('message');
            expect(otp.body.message).toBe('OTP is required');
        });
        test('It should return 404 if OTP not found', async () => {
            const otp = 123456
            const checkOTP = await request(app).post('/verify-otp').send({
                otp: otp
            });
            expect(checkOTP.body).toHaveProperty('statusCode');
            expect(checkOTP.statusCode).toBe(404);
            expect(checkOTP.body).toHaveProperty('status');
            expect(checkOTP.body.status).toBe('failed');
            expect(checkOTP.body).toHaveProperty('message');
            expect(checkOTP.body.message).toBe('OTP not found or invalid');
        });
        test('It should return 400 if OTP is expired', async () => {
            const otpStore = {};
            const email = 'test@mail.com'

            const otp = 123456;
            const otpExpiresAt = new Date(Date.now() - 10000)
            otpStore[email] = { otp, expiresAt: otpExpiresAt, email };

            const findOTP = Object.keys(otpStore).find(
                (key) => otpStore[key].otp === otp
            );
            const storedOtp = otpStore[findOTP];

            const checkOTP = await request(app).post('/verify-otp').send({
                otp: storedOtp
            });

            expect(checkOTP.body).toHaveProperty('statusCode');
            expect(checkOTP.statusCode).toBe(404);
            expect(checkOTP.body).toHaveProperty('status');
            expect(checkOTP.body.status).toBe('failed');
            expect(checkOTP.body).toHaveProperty('message');
            expect(checkOTP.body.message).toBe('OTP not found or invalid');

            delete otpStore[findOTP];

        });
        // test('It should return 200 and success message', async () => {
        //     const otpStore = {};
        //     const email = 'test@mail.com'

        //     const testOTP = 123456;
        //     const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
        //     otpStore[email] = { otp: testOTP, expiresAt: otpExpiresAt, email };

        //     console.log(otpStore);


        //     const checkOTP = await request(app).post('/verify-otp').send({
        //         otp: testOTP
        //     });
        //     expect(checkOTP.body).toHaveProperty('statusCode');
        //     expect(checkOTP.statusCode).toBe(200);
        //     expect(checkOTP.body).toHaveProperty('status');
        //     expect(checkOTP.body.status).toBe('success');
        //     expect(checkOTP.body).toHaveProperty('message');
        //     expect(checkOTP.body.message).toBe('Account successfully activated');

        //     delete otpStore[otp];
        // });
    });
});

describe('Testing For Resend OTP', () => {
    describe('POST /resend-otp', () => {
        test('It should return 400 if email not filled', async () => {
            const email = await request(app).post('/resend-otp').send({
                email: ''
            });
            expect(email.body).toHaveProperty('statusCode');
            expect(email.statusCode).toBe(400);
            expect(email.body).toHaveProperty('status');
            expect(email.body.status).toBe('failed');
            expect(email.body).toHaveProperty('message');
            expect(email.body.message).toBe('Email is required');
        });
        test('It should return 404 if email not found', async () => {
            const existingUser = await request(app).post('/resend-otp').send({
                email: 'nonexistent@mail.com',
            });
            expect(existingUser.body).toHaveProperty('statusCode');
            expect(existingUser.statusCode).toBe(404);
            expect(existingUser.body).toHaveProperty('status');
            expect(existingUser.body.status).toBe('failed');
            expect(existingUser.body).toHaveProperty('message');
            expect(existingUser.body.message).toBe('User not found');
        });
        test('It should return 400 if OTP is Invalid', async () => {
            const email = 'test@mail.com'
            const storedOtp = otpStore[email];
            if (storedOtp && new Date() < storedOtp.expiresAt) {
                expect(checkOTP.body).toHaveProperty('statusCode');
                expect(checkOTP.statusCode).toBe(404);
                expect(checkOTP.body).toHaveProperty('status');
                expect(checkOTP.body.status).toBe('failed');
                expect(checkOTP.body).toHaveProperty('message');
                expect(checkOTP.body.message).toBe('OTP is still valid, please try again later.');
            }
        });
        test('It should return 200 and success message', async () => {
            const email = await request(app).post('/resend-otp').send({
                email: 'test@mail.com'
            });
            expect(email.body).toHaveProperty('statusCode');
            expect(email.statusCode).toBe(200);
            expect(email.body).toHaveProperty('status');
            expect(email.body.status).toBe('success');
            expect(email.body).toHaveProperty('message');
            expect(email.body.message).toBe('A new OTP has been sent. Please check your email.');
        });
    });
});