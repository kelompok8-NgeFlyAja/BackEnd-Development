if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express')
const errorHandler = require('./src/middlewares/errorHandler');
const app = express()
const PORT = 3000
const airportRoute = require('./src/routes/admin/airportRoute')
const planeRoute = require('./src/routes/admin/planeRoute')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(planeRoute)
app.use(airportRoute)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`-> Listening on PORT: ${PORT}`);
})