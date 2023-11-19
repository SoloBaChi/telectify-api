const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const TenantSchema = new Schema(
  {
    nameOfApartment: {
      type: String,
      trim: true,
      required: true,
    },
    houseAddress: {
      type: String,
      trim: true,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    uniqueId: {
      type: String,
      min: [10, "unique id must be at least 10 characters"],
    },
  },
  { timestamps: true },
);

const Tenant = model("tenant", TenantSchema);

// export the tenant schema
module.exports = Tenant;
