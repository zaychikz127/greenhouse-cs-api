require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const loginRoute = require('./api/login');
const resetPasswordRoute = require('./api/reset-password');

const app = express();
const PORT = process.env.PORT; 

app.use(cors());
app.use(bodyParser.json());

// เส้นทาง API
app.use('/api/login', loginRoute);
app.use('/api/reset-password', resetPasswordRoute);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
