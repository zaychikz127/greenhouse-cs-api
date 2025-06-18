const express = require("express");
const cors = require("cors");
const router = express.Router();

let latestSensorData = {}; 

router.post("/", (req, res) => {
  const { temperature, humidity, lightPercent } = req.body;
  latestSensorData = { temperature, humidity, lightPercent, timestamp: Date.now() };
//   console.log("รับข้อมูล:", latestSensorData);
//   res.status(200).json({ message: "รับข้อมูลสำเร็จ" });
});

router.get("/", (req, res) => {
  res.json(latestSensorData);
});

module.exports = router;