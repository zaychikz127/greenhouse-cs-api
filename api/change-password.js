const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const router = express.Router();

// สร้าง connection pool
const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// POST /api/change-password
router.post('/', async (req, res) => {
    const { oldPassword, password } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!oldPassword || !password) {
        return res.status(400).json({ message: 'กรุณากรอกรหัสผ่านให้ครบถ้วน' });
    }

    if (!token) {
        return res.status(401).json({ message: 'ไม่ได้รับ token การยืนยันตัวตน' });
    }

    try {
        // ตรวจสอบ token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { uuid } = decoded;

        // ดึงข้อมูลผู้ใช้จากฐานข้อมูล
        const [rows] = await db.query('SELECT password FROM admins WHERE uuid = ?', [uuid]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ในระบบ' });
        }

        const user = rows[0];

        // ตรวจสอบรหัสผ่านเดิม
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }

        // แฮชรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(password, 10);

        // อัปเดตรหัสผ่านใหม่ในฐานข้อมูล
        await db.query('UPDATE admins SET password = ? WHERE uuid = ?', [hashedPassword, uuid]);

        res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });

    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง' });
    }
});

module.exports = router;
