if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const swaggerUI = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
const { startCronJob } = require("./src/utils/cronJob");
const cors = require("cors");
const errorHandler = require("./src/middlewares/errorHandler");
const swaggerDocs = require("./src/docs/swagger.json");

const app = express();
const PORT = process.env.PORT;
//Admin
const adminRoutes = [
  require("./src/routes/admin/airportRoute"),
  require("./src/routes/admin/classRoute"),
  require("./src/routes/admin/planeRoute"),
  require("./src/routes/admin/flightRoutesRoute"),
  require("./src/routes/admin/promotionRoute"),
  require("./src/routes/admin/flightRoute"),
  require("./src/routes/admin/seatRoute"),
];
//User
const userRoutes = [
  require("./src/routes/user/paymentsRoute"),
  require("./src/routes/user/filterRoute"),
  require("./src/routes/user/flightRoute"),
  require("./src/routes/user/searchRoute"),
  require("./src/routes/user/registerRoute"),
  require("./src/routes/user/resetPasswordRoute"),
  require("./src/routes/user/userAccountRoute"),
  require("./src/routes/user/loginRoute"),
  require("./src/routes/user/notificationRoutes"),
];

const corstOption = {
  origin: '*',
  credential: true,
  optionSuccessStatus: 200
}

//This Comment is for testing the github action 6
//It Shoul Work Fine
app.get("/test", (req, res) => {
  res.send("Now I try the action and it should be fine! now it should add this sentences too (4)");
});

app.use(cors(corstOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

startCronJob();

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));
adminRoutes.forEach(route => app.use(route));
userRoutes.forEach(route => app.use(route));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`-> Listening on PORT: ${PORT}`);
});

// module.exports = app
