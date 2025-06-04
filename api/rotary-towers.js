const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// สร้าง connection pool
const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// GET /api/rotary-towers
router.get('/', async (req, res) => {
  try {
    // ดึงข้อมูล id, name จาก table towers โดย filter เงื่อนไข type = 1 และ connect_sensor = 1
    const [rows] = await db.query(
      'SELECT id, name FROM towers WHERE type = ? AND connect_sensor = ?',
      [1, 1]
    );

    // สมมติใน table มี column status ด้วย หากไม่มี ให้แก้โค้ดตรงนี้หรือเพิ่ม column
    res.json(rows);
  } catch (error) {
    console.error('Error fetching rotary towers:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});

module.exports = router;
