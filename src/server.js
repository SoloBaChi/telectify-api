// import express app
const express = require("express"),
  cors = require("cors"),
  morgan = require("morgan"),
  dotenv = require("dotenv"),
  ResponseMessage = require("./utils/message.response"),
  tenantRoute = require("./routes/tenant.route"),
  { connectToDB } = require("./services/db.services"),
  { urlencoded, json } = require("body-parser"),
  { signUp, logIn, protect } = require("./utils/auth"),
  { body } = require("express-validator");

const app = express();

// basic middlewares
dotenv.config({ path: ".env" });
app.use(cors({ origin: "*", credentials: true }));
app.use(urlencoded({ extended: true }));
app.use(json());
// app.use(morgan());

// ////ROUTES///////
// Default Route
app.get("/", (req, res) => {
  res
    .status(200)
    .json(
      new ResponseMessage(
        "success",
        200,
        `Welcome to ${process.env.APP_NAME} API`,
      ),
    );
});

// AUTHENTICATION MIddleware
app.post(
  "/auth/signup",
  body("nameOfApartment")
    .isString()
    .isLength({
      min: 3,
      max: 100,
    })
    .withMessage("Apartment name must be at least 3 characters"),
  body("houseAddress")
    .isString()
    .isLength({
      min: 4,
    })
    .withMessage("Provide a valid house address"),
  body("email").isEmail().withMessage("please enter a valid email address"),

  // Handle the request function
  signUp,
);
app.post(
  "/auth/login",
  body("houseAddress")
    .isString()
    .isLength({
      min: 4,
    })
    .withMessage("house address name must be atleast 3 characters"),
  body("uniqueId")
    .isString()
    .isLength({
      min: 6,
    })
    .withMessage("Provide a valid house Id"),
  logIn,
);

// The AUthorization  Middlware
app.use("/api/v1", protect);

// get the tenant details
app.use("/api/v1/tenant", tenantRoute);

// Not found Route
app.use("*", (req, res) => {
  res.status(404).json(new ResponseMessage("error", 400, "Not Found!"));
});

// create a port

const port = process.env.PORT || 4000;

// listen to the server
const start = async () => {
  //start the database
  await connectToDB();

  app.listen(port, () => {
    console.log(`server listening to localhost:${port}`);
  });
};

module.exports = start;
