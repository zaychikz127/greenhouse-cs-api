const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');

// สร้าง pool connection (ปรับตาม config คุณ)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ตั้งค่า multer สำหรับเก็บไฟล์ใน public/uploads/home
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/home');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// GET /api/image-home/images - ดึงรายการรูปทั้งหมด
router.get('/images', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM home_images ORDER BY uploaded_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ' });
  }
});

// POST /api/image-home/images - อัปโหลดรูปภาพใหม่
router.post('/images', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'กรุณาอัปโหลดไฟล์รูปภาพ' });
    }

    const imagePath = '/uploads/home/' + req.file.filename; 

    await db.query('INSERT INTO home_images (image_path, uploaded_at) VALUES (?, NOW())', [imagePath]);

    res.status(201).json({ message: 'อัปโหลดรูปภาพสำเร็จ', imagePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ' });
  }
});

// DELETE /api/image-home/images/:id
router.delete('/images/:id', async (req, res) => {
  const imageId = req.params.id;

  try {
    // 1. ดึง path ของรูปจาก DB
    const [rows] = await db.query('SELECT image_path FROM home_images WHERE id = ?', [imageId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบรูปภาพที่ต้องการลบ' });
    }

    const imagePath = rows[0].image_path;

    // 2. ลบไฟล์จากโฟลเดอร์
    const fs = require('fs');
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath); // ลบไฟล์จริง
    }

    // 3. ลบจากฐานข้อมูล
    await db.query('DELETE FROM home_images WHERE id = ?', [imageId]);

    res.json({ message: 'ลบรูปภาพสำเร็จ' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบรูปภาพ' });
  }
});

module.exports = router;
