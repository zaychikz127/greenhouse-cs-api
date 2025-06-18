require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const loginRoute = require('./api/login');
const resetPasswordRoute = require('./api/reset-password');
const changePasswordRoute = require('./api/change-password');
const rotaryTowersRoute = require('./api/rotary-towers');
const controlTowerRoute = require('./api/control-tower');
const imageHomeRoutes = require('./api/image-home'); 
const homeContentRoutes = require('./api/home-content'); 
const sensorDataRoutes = require('./api/sensor-data'); 

const app = express();
const PORT = process.env.PORT; 

app.use(cors());
app.use(bodyParser.json());

app.use('/uploads/home', express.static(path.join(__dirname, 'public/uploads/home')));

// เส้นทาง API
app.use('/api/login', loginRoute);
app.use('/api/reset-password', resetPasswordRoute);
app.use('/api/change-password', changePasswordRoute);
app.use('/api/rotary-towers', rotaryTowersRoute);
app.use('/api/control-tower', controlTowerRoute);
app.use('/api/image-home', imageHomeRoutes); 
app.use('/api/home-content', homeContentRoutes); 
app.use('/api/sensor-data', sensorDataRoutes); 

app.listen(PORT, () => {
    console.log(`Server is running...`);
});
