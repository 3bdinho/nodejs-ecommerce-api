const mongoose = require("mongoose");

const DBConnection = () => {
  // connect with database
  mongoose.connect(process.env.DB_STRING).then((conn) => {
    console.log(`Database connected: ${conn.connection.host}`);
    console.log("Port:", conn.connection.port);
    console.log("DB name:", conn.connection.name); // <- THIS is critical
  });
  // .catch((err) => {
  //   console.error(`Database Error: ${err}`);
  //   process.exit(1);
  // });
};
module.exports = DBConnection;
