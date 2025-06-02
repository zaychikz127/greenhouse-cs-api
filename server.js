require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const loginRoute = require('./api/login');

const app = express();
const PORT = process.env.PORT; // ← ดึง PORT จาก .env (fallback = 4500)

app.use(cors());
app.use(bodyParser.json());

// เส้นทาง API
app.use('/api/login', loginRoute);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
