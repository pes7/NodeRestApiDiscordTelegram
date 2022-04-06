const express = require("express");
const { MongoConnector } = require("./connectors/mongoConnector.js");
const { User } = require("./models/User.js");
const fs = require("fs");

const app = express();
var router = express.Router();
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes/userRouter'))

const mongoConnector = new MongoConnector({
  hostname: "127.0.0.1",
  port: 27017,
  dbName: "admin",
  user: "root",
  password: "password",
});
MongoConnector.registerTables(["DiscrodUsers", "TelegramUsers", "Messages"]);
MongoConnector.connect()
  .then(() => {

  })
  .catch((exception) => {
    console.log(exception);
    process.exit();
  });

MongoConnector.getInstance().on("TablesLoaded", function () {
  let server = app.listen(3000, function () {
    console.log("Server is waiting for connections...");
    app.emit("ServerRun");
  });

  app.on("Stop",()=>{
    server.close();
  });
});

module.exports.app = app;
