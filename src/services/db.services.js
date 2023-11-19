// require mongooose
const mongoose = require("mongoose");

// create an object for the database
const dbServices = {};

dbServices.connectToDB = async () => {
  const uri = process.env.DATA_BASE_URL;
  try {
    const params = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    const connect = await mongoose.connect(uri,params);
    console.log(
      `connnected succesfully to ${connect.connection.host} database`,
    );
  } catch (e) {
    console.log(`could not connect to the database, ${e}`);
  }
};

module.exports = dbServices;
