const Tenant = require("../models/tenant.model");
const ResponseMessage = require("../utils/message.response");

const tenantController = {};

tenantController.getProfile = async (req, res) => {
  try {
    const { _id: id, houseAddress, nameOfApartment } = req.user;
    return res.status(200).json(
      new ResponseMessage("success", 200, `${nameOfApartment} profile`, {
        id,
        houseAddress,
        nameOfApartment,
      }),
    );
  } catch (err) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 500, "INTERNAL SERVER ERROR"));
  }
};

tenantController.updateProfile = async (req, res) => {
  try {
    const user = await Tenant.findOneAndUpdate({ _id: req.user.id }, req.body, {
      new: true,
    });
    return res
      .status(200)
      .json(new ResponseMessage("success", 200, "updated succesfully", user));
  } catch (err) {
    return res
      .status(400)
      .json(new ResponseMessage("error", 500, "INTERNAL SERVER ERROR"));
  }
};

module.exports = tenantController;
