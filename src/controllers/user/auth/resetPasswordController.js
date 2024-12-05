const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT);
const nodemailer = require('nodemailer');

const verifyEmail = async (req, res, next) => {
    try {
        let { email } = req.body;
        let user = await prisma.users.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            throw { error: 'Not found', status: 400, message: 'Email tidak ditemukan' };
        } else {
            const token = jwt.sign({
                email: user.email,
                id: user.id,
            }, JWT_SECRET, {
                expiresIn: '1h'
            })

            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                auth: {
                    user: process.env.MAIL_EMAIL,
                    pass: process.env.MAIL_PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.MAIL_EMAIL,
                to: email,
                subject: 'Reset Password',
                html: `<a href="http://localhost:3000/forgot-password/${token}">Klik disini untuk reset password</a>`
            }

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    throw { error: 'Internal Server Error', status: 500, message: 'Gagal mengirim email' };
                } else {
                    res.status(200).json({
                        message: 'Tautan reset password terkirim',
                        status: 200,
                        token: token,
                    });
                }
            });
        }
    } catch (error) {
        next(error);
    }
}

const forgotPassword = async (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            throw { error: 'Bad Request', status: 400, message: 'Token diperlukan' };
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            throw { error: 'Unauthorized', status: 401, message: 'Token tidak valid' };
        }

        res.status(200).json({
            message: 'Token valid',
            status: 200,
            token: token
        });

    } catch (error) {
        next(error);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { password, token } = req.body;

        if (!token || !password) {
            throw { error: 'Bad Request', status: 400, message: 'Token dan password diperlukan' };
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            throw { error: 'Unauthorized', status: 401, message: 'Token tidak valid' };
        }

        const hashedPassword = bcrypt.hashSync(password, BCRYPT_SALT);

        const updateUser = await prisma.users.update({
            where: { id: decoded.id },
            data: { password: hashedPassword },
        });

        res.status(200).json({
            message: 'Password berhasil direset, silahkan login kembali',
            status: 200,
            data: updateUser,
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { verifyEmail, forgotPassword, resetPassword }