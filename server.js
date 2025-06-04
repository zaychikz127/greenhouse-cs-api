require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const loginRoute = require('./api/login');
const resetPasswordRoute = require('./api/reset-password');
const changePasswordRoute = require('./api/change-password');
const rotaryTowersRoute = require('./api/rotary-towers');

const app = express();
const PORT = process.env.PORT; 

app.use(cors());
app.use(bodyParser.json());

// เส้นทาง API
app.use('/api/login', loginRoute);
app.use('/api/reset-password', resetPasswordRoute);
app.use('/api/change-password', changePasswordRoute);
app.use('/api/rotary-towers', rotaryTowersRoute);

app.listen(PORT, () => {
    console.log(`Server is running...`);
});
