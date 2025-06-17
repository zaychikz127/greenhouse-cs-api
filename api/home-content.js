require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');

const router = express.Router();

const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// ดึงข้อมูลหน้าแรก
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT title, description FROM home_contents LIMIT 1');
        if (rows.length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'ไม่พบข้อมูลหน้าแรก' });
        }
    } catch (error) {
        console.error('GET /home-content error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
});

// แก้ไขข้อมูลหน้าแรก
router.put('/', async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    try {
        const [rows] = await db.query('UPDATE home_contents SET title = ?, description = ? LIMIT 1', [title, description]);
        res.status(200).json({ message: 'อัปเดตข้อมูลเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('PUT /home-content error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
    }
});

module.exports = router;
