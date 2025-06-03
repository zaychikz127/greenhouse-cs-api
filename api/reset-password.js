const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/', async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const createdAt = new Date();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 นาที
        // const expiresAt = new Date(Date.now() + 10 * 1000); // 10 วินาที

        await db.query(
            'INSERT INTO otps (email, otp, created_at, expires_at, is_used) VALUES (?, ?, ?, ?, ?)',
            [email, otpHash, createdAt, expiresAt, 0]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'รหัส OTP สำหรับรีเซ็ตรหัสผ่าน',
            text: `รหัส OTP ของคุณคือ: ${otp} (หมดอายุใน 5 นาที)`
        });

        return res.status(200).json({ message: 'ส่ง OTP สำเร็จ', expiresAt });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่ง OTP' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'กรุณาระบุอีเมลและรหัส OTP' });
    }

    try {
        // ดึง OTP ล่าสุดที่ยังไม่หมดอายุ และยังไม่ถูกใช้
        const [rows] = await db.query(
            'SELECT * FROM otps WHERE email = ? AND is_used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'ไม่พบรหัส OTP หรือรหัสหมดอายุแล้ว' });
        }

        const isMatch = await bcrypt.compare(otp, rows[0].otp);
        if (!isMatch) {
            return res.status(401).json({ message: 'รหัส OTP ไม่ถูกต้อง' });
        }

        // อัปเดตให้ OTP นี้เป็นใช้แล้ว
        await db.query('UPDATE otps SET is_used = 1 WHERE id = ?', [rows[0].id]);

        return res.status(200).json({ message: 'ยืนยัน OTP สำเร็จ' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบ OTP' });
    }
});

router.post('/setnew-password', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'กรุณาระบุอีเมลและรหัสผ่านใหม่' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'UPDATE admins SET password = ? WHERE email = ?',
            [hashedPassword, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้งานในระบบ' });
        }

        return res.status(200).json({ message: 'ตั้งรหัสผ่านใหม่สำเร็จ' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่' });
    }
});

module.exports = router;
