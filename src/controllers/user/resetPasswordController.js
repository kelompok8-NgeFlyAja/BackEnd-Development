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
            throw { error: 'Not found', statusCode: 400, message: 'Email tidak ditemukan' };
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
                    user: process.env.USER_EMAIL,
                    pass: process.env.USER_APP
                }
            });

            const resetUrl = `http://localhost:3000/verify-token/${token}`;

            const mailOptions = {
                from: '"NgeFlyAja" <no-reply@ngeflyaja.com>',
                to: email,
                subject: 'Reset Password',
                html: `<h1>Need to reset your Password?</h1>
                <p>Click the button below to reset your password</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 1 hour.</p>`
            }

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    throw { error: 'Internal Server Error', statusCode: 500, message: 'Gagal mengirim email' };
                } else {
                    res.status(200).json({
                        message: 'Tautan reset password terkirim',
                        statusCode: 200,
                        token: token,
                    });
                }
            });
        }
    } catch (error) {
        next(error);
    }
}

const verifyToken = (req, res, next) => {
    try {
        const { token } = req.params;

        if (!token) {
            throw { error: 'Bad Request', statusCode: 400, message: 'Token diperlukan' };
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            throw { error: 'Unauthorized', statusCode: 401, message: 'Token tidak valid' };
        }
        res.status(200).json({
            message: 'Token valid',
            statusCode: 200,
            data: decoded,
        });
    } catch (error) {
        next(error);
    }
}

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;

        if (!token || !newPassword) {
            throw { error: 'Bad Request', statusCode: 400, message: 'Token dan password diperlukan' };
        }

        if (newPassword !== confirmPassword) {
            throw { error: 'Bad Request', statusCode: 400, message: 'Password tidak sama' };
        }

        if (newPassword.length < 8) {
            throw { error: 'Bad Request', statusCode: 400, message: 'Password minimal 8 karakter' };
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        if (!decoded || !decoded.id) {
            throw { error: 'Unauthorized', statusCode: 401, message: 'Token tidak valid' };
        }

        const hashedPassword = bcrypt.hashSync(newPassword, BCRYPT_SALT);

        const updateUser = await prisma.users.update({
            where: { id: decoded.id },
            data: { password: hashedPassword },
        });

        res.status(200).json({
            message: 'Password berhasil direset, silahkan login kembali',
            statusCode: 200,
            data: updateUser,
        });
    } catch (error) {
        next(error);
    }
}

const updatePassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!id || !oldPassword || !newPassword || !confirmPassword) {
            throw { error: 'Bad Request', statusCode: 400, message: 'Semua field diperlukan' };
        }

        if (newPassword !== confirmPassword) {
            throw { error: 'Bad Request', statusCode: 400, message: 'Password tidak sama' };
        }

        if (newPassword.length < 8) {
            throw { error: 'Bad Request', statusCode: 400, message: 'Password minimal 8 karakter' };
        }

        const user = await prisma.users.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            throw { error: 'Not Found', statusCode: 404, message: 'User tidak ditemukan' };
        }

        const isPasswordMatch = bcrypt.compareSync(oldPassword, user.password);
        if (!isPasswordMatch) {
            throw { error: 'Bad Request', statusCode: 400, message: 'Password lama salah' };
        }

        const hashedPassword = bcrypt.hashSync(newPassword, BCRYPT_SALT);

        const updateUser = await prisma.users.update({
            where: { id: parseInt(id) },
            data: { password: hashedPassword },
        });

        res.status(200).json({
            message: 'Password berhasil diubah',
            statusCode: 200,
            data: updateUser,
        });

    } catch (error) {
        next(error);
    }
}

module.exports = { verifyEmail, resetPassword, verifyToken, updatePassword };