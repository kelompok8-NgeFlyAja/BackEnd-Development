if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const errorHandler = require("./src/middlewares/errorHandler");
const app = express();
const PORT = 3000;
const airportRoute = require("./src/routes/admin/airportRoute");
const classRoute = require("./src/routes/admin/classRoute");
const planeRoute = require("./src/routes/admin/planeRoute");
const flightRoutesRoute = require("./src/routes/admin/flightRoutesRoute");
const promotionRoute = require("./src/routes/admin/promotionRoute");
const transactionRoute = require("./src/routes/user/paymentsRoute");
const flightRoute = require("./src/routes/admin/flightRoute");
const filterFlight = require("./src/routes/user/filterRoute");
const search = require("./src/routes/user/searchRoute");
const flightRouteUser = require("./src/routes/user/flightRoute");
const registerRoute = require("./src/routes/user/registerRoute");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(planeRoute);
app.use(airportRoute);
app.use(classRoute);
app.use(flightRoute);
app.use(flightRoutesRoute);
app.use(promotionRoute);

app.use(transactionRoute);
app.use(filterFlight);
app.use(flightRouteUser);
app.use(search);
app.use(registerRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`-> Listening on PORT: ${PORT}`);
});
