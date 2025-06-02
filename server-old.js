const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

let sockets = [];

wss.on('connection', (ws) => {
  sockets.push(ws);

  ws.on('close', () => {
    sockets = sockets.filter((s) => s !== ws);
  });
});

// 🟡 ESP32 จะยิง POST มาที่นี่
app.post('/api/light', (req, res) => {
  const { light } = req.body;

  const payload = JSON.stringify({ light });

  // ส่งต่อให้ทุก WebSocket client (React)
  sockets.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });

  res.sendStatus(200);
});

const PORT = 4500;
server.listen(PORT, () => {
  console.log(`🚀 HTTP + WebSocket Server running at http://localhost:${PORT}`);
});
