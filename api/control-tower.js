const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// PUT /api/control-tower/:towerId
router.put('/:towerId', async (req, res) => {
  const towerId = req.params.towerId;

  try {
    const [checkRows] = await db.query(
      'SELECT is_controlled FROM tower_status WHERE tower_id = ?',
      [towerId]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบแท่นปลูกหรือสถานะ' });
    }

    if (checkRows[0].is_controlled === 1) {
      return res.status(409).json({ message: 'แท่นปลูกนี้กำลังถูกควบคุมโดยผู้ใช้อื่น' });
    }

    const [updateResult] = await db.query(
      'UPDATE tower_status SET is_controlled = 1 WHERE tower_id = ?',
      [towerId]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: 'อัปเดตสถานะไม่สำเร็จ' });
    }

    res.json({ message: 'อัปเดตสถานะควบคุมสำเร็จ' });
  } catch (error) {
    console.error('Error updating control status:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะอัปเดต' });
  }
});

// routes/controlTower.js
router.put('/:towerId/release', async (req, res) => {
  const { towerId } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE tower_status SET is_controlled = 0 WHERE tower_id = ?',
      [towerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบแท่นปลูกหรือไม่สามารถอัปเดตได้' });
    }

    res.json({ message: 'ออกจากการควบคุมแล้ว' });
  } catch (error) {
    console.error('Error releasing control:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดระหว่างการออกจากการควบคุม' });
  }
});

// PUT /api/control-tower/:towerId/power
router.put('/:towerId/power', async (req, res) => {
  const { towerId } = req.params;
  const { power_on } = req.body;

  if (typeof power_on !== 'number' || (power_on !== 0 && power_on !== 1)) {
    return res.status(400).json({ message: 'ค่า power_on ต้องเป็น 0 หรือ 1' });
  }

  try {
    const [result] = await db.query(
      'UPDATE tower_status SET power_on = ?, speed_level = 0 WHERE tower_id = ?',
      [power_on, towerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบแท่นปลูกหรือไม่สามารถอัปเดตได้' });
    }

    res.json({ message: `อัปเดต power_on เป็น ${power_on} และ reset speed_level เป็น 0 สำเร็จ` });
  } catch (error) {
    console.error('Error updating power_on status:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะอัปเดต power_on และ speed_level' });
  }
});

// PUT /api/control-tower/:towerId/speed
router.put('/:towerId/speed', async (req, res) => {
  const { towerId } = req.params;
  const { speed_level } = req.body;

  if (![0, 1, 2, 3].includes(speed_level)) {
    return res.status(400).json({ message: 'speed_level ต้องเป็น 0, 1, 2 หรือ 3' });
  }

  try {
    const [result] = await db.query(
      'UPDATE tower_status SET speed_level = ? WHERE tower_id = ?',
      [speed_level, towerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบแท่นปลูกหรือไม่สามารถอัปเดตได้' });
    }

    res.json({ message: `อัปเดต speed_level เป็น ${speed_level} สำเร็จ` });
  } catch (error) {
    console.error('Error updating speed_level:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะอัปเดต speed_level' });
  }
});

// GET /api/control-tower/:towerId/status
router.get('/:towerId/status', async (req, res) => {
  const { towerId } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT power_on, speed_level FROM tower_status WHERE tower_id = ?',
      [towerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบแท่นปลูก' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching tower status:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดขณะดึงข้อมูลสถานะ' });
  }
});


module.exports = router;
