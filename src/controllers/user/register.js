const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodemailer = require("nodemailer");
const BCRYPT_SALT = parseInt(process.env.BCRYPT_SALT);

//konfigurasi  nodemailer  untuk mengirim  email
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_APP,
  },
});

const otpStore = {}; // Menyimpan OTP dan waktu kedaluwarsa untuk setiap pengguna

const newRegister = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    //cek apakah semua kolom sudah terisi
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "All fields are required",
      });
    }

    //cek email apakah sudah terdaftar
    const existingEmail = await prisma.users.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "Email already registered",
      });
    }

    //cek apakah nomor telepon sudah terdaftar
    const existingPhoneNumber = await prisma.users.findFirst({
      where: { phoneNumber },
    });
    if (existingPhoneNumber) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "Phone number already registered",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, BCRYPT_SALT);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP kedaluwarsa dalam 15 menit

    // Simpan OTP di dalam memori server
    otpStore[email] = { otp, expiresAt: otpExpiresAt };

    // Buat user baru
    await prisma.users.create({
      data: {
        name,
        email,
        phoneNumber,
        password: hashedPassword,
        isActivated: false,
      },
    });

    // Kirim email OTP
    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Your OTP code",
      text: `Your OTP code is ${otp}. Valid for 15 minutes.`,
    });

    res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "Registration is successful. Please check your email for OTP.",
    });
  } catch (error) {
    next(error);
  }
};

//verifikasi otp dan aktivasi akun
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const storedOtp = otpStore[email];
    console.log(storedOtp); 
    

    if (!storedOtp) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "OTP not found",
      });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "Incorrect OTP code",
      });
    }

    if (new Date() > storedOtp.expiresAt) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "OTP code has expired",
      });
    }

    // OTP valid, aktifkan akun pengguna
    await prisma.users.update({
      where: { email },
      data: { isActivated: true },
    });

    // Hapus OTP dari memori setelah digunakan
    delete otpStore[email];

    res.status(200).json({
      status: "succes",
      statusCode: 200,
      message: "Account successfully activated",
    });
  } catch (error) {
    next(error);
  }
};

// Fungsi untuk mengirim ulang OTP
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.query;

    // Validasi email
    if (!email) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "Email is required",
      });
    }

    // Cek apakah user terdaftar
    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (!existingUser) {
      return res.status(404).json({
        status: "failed",
        statusCode: 400,
        message: "User not found",
      });
    }

    // Cek apakah OTP masih berlaku
    const storedOtp = otpStore[email];
    if (storedOtp && new Date() < storedOtp.expiresAt) {
      return res.status(400).json({
        status: "failed",
        statusCode: 400,
        message: "OTP is still valid, please try again later.",
      });
    }

    // Generate OTP baru jika OTP sebelumnya sudah kedaluwarsa
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // OTP kedaluwarsa dalam 15 menit

    // Simpan OTP baru di memori
    otpStore[email] = { otp, expiresAt: otpExpiresAt };

    // Kirim email OTP baru
    await transporter.sendMail({
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Your new OTP code",
      text: `Your new OTP code is ${otp}. Valid for 15 minutes.`,
    });

    res.status(200).json({
      status: "succes",
      statusCode: 200,
      message: "A new OTP has been sent. Please check your email.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { newRegister, verifyOtp, resendOtp };