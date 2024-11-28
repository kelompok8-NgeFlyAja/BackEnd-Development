if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const errorHandler = require("./src/middlewares/errorHandler");
const app = express();
const PORT = 3000;
const airportRoute = require('./src/routes/admin/airportRoute')
const classRoute = require('./src/routes/admin/classRoute')
const planeRoute = require('./src/routes/admin/planeRoute')
const flightRoute = require("./src/routes/admin/flightRoutesRoute");
const promotionRoute = require("./src/routes/admin/promotionRoute");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(planeRoute)
app.use(airportRoute);
app.use(classRoute);
app.use(flightRoute);
app.use(promotionRoute);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`-> Listening on PORT: ${PORT}`);
});
