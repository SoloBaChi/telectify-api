const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validationRes = require("express-validator").validationResult;

// import the tenant model
const Tenant = require("../models/tenant.model");
const ResponseMessage = require("./message.response");
const sliceId = require("./slice.id");
const Email = require("../services/email.services");

// create token function
const accessToken = (user) =>
  jwt.sign({ id: user._id }, process.env.SECRET_KEY);

// verify token function
const veriftyToken = (token) => jwt.verify(token, process.env.SECRET_KEY);

const auth = {};

// signup a tenant
auth.signUp = async (req, res) => {
  // check client errors thrown by express validator
  const errors = validationRes(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()));
  }

  try {
    //  check if the email exist
    const { email, houseAddress, nameOfApartment } = req.body;
    const existingUser = await Tenant.findOne({ email: email });
    if (existingUser) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "Email Already Exists"));
    }

    // hash the user password if there's any

    // create a user
    const user = await Tenant.create({ email, houseAddress, nameOfApartment });

    //update tenant unique id
    const getHouseId = await user._id;

    const houseId = sliceId(getHouseId.toString());

    // hash the house unique Id
    // const hashedHouseId = await bcrypt.hash(houseId, 10);

    // console.log(houseId);

    //update the user with the  new generated unique Id
    const updatedUser = await Tenant.findOneAndUpdate(
      { _id: user._id },
      { uniqueId: houseId },
      { new: true },
    );
    /*
    same as the updating function code above...user.uniqueId = hashedHouseId;

    // save the unique id value in the database
    // await user.save();
    */
    await new Email(updatedUser, houseId).sendUniqueId();

    // generate token
    const token = await accessToken(updatedUser);

    return res.status(200).json(
      new ResponseMessage("success", 200, "Account Created Successfully !", {
        token,
        updatedUser,
      }),
    );
  } catch (err) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 500, "INTERNAL SERVER ERROR!"));
  }
};

// login a tenant
auth.logIn = async (req, res) => {
  // check client errors thrown by express validator
  const errors = validationRes(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 400, errors.array()));
  }

  try {
    // check if the user email exist
    const { houseAddress, uniqueId } = req.body;
    const tenant = await Tenant.findOne({ uniqueId: uniqueId });
    console.log(tenant);
    // const { uniqueId } = tenant;

    // if the tenant does not exist in the database
    if (!tenant) {
      return res
        .status(400)
        .json(
          new ResponseMessage("error", 400, "Please provide a valid House Id"),
        );
    }
    if (houseAddress !== tenant.houseAddress) {
      return res
        .status(400)
        .json(new ResponseMessage("error", 400, "incorrect house Address"));
    }

    // Generate an access token
    const token = await accessToken(tenant);

    return res.status(200).json(
      new ResponseMessage("success", 200, "Login Successfully !", {
        token,
        tenant,
      }),
    );
  } catch (err) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 500, "INTERNAL SERVER ERROR!"));
  }
};

// Middleware for authorizing  a tenant access to the dashboard
auth.protect = async (req, res, next) => {
  // check the bearer token, if it exist
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "Do not have an account!"));
  }

  // Get the token
  const token = await bearer.split(" ")[1];

  // check if the token is undefined
  if (token === "undefined") {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "Token does not exist"));
  }

  // decode the token
  let decodeToken;
  try {
    decodeToken = await veriftyToken(token);
  } catch (err) {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "UnAuthorized token"));
  }

  // confirm if the decoded token is valid
  if (!decodeToken) {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "Invalid token"));
  }

  // extract the user id from the decoded token
  const userId = decodeToken.id;
  if (!userId) {
    return res
      .status(401)
      .json(new ResponseMessage("error", 401, "Invalid token"));
  }

  // Get the user (Tenant)
  const user = await Tenant.findOne({ _id: userId });
  if (!user) {
    return res
      .status(401)
      .json(
        new ResponseMessage(
          "error",
          401,
          "Unauthorized Request! Sign In Or SignUp!. If you are already signed in, please logout and login again",
        ),
      );
  }

  req.user = user;

  // continue the execution other middlewares
  next();
};

module.exports = auth;
