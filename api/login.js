require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }

    try {
        const [users] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'ไม่พบชื่อผู้ใช้นี้ในระบบ' });
        }

        const user = users[0];

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }

        const token = jwt.sign(
            { uuid: user.uuid, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '10d' }
        );

        return res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง' });
    }
});

module.exports = router;
