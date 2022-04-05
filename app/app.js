const express = require("express");
const mongoClient = require("./modules/mongoConnector.js");
const { User } = require("./classes/User.js");
const multer = require("multer");
const fs = require("fs");

mongoClient.init(
  {
    hostname: "127.0.0.1",
    port: 27017,
    dbName: "admin",
    user: "root",
    password: "password",
  },
  (error) => {
    console.log(error);
  }
);
mongoClient.registerTables(["DiscrodUsers", "TelegramUsers", "Messages"]);

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.get("/api/users", function (req, res) {
  User.getAllUsers((users) => {
    if (!users) return res.sendStatus(500);
    res.send(users);
  });
});

app.get("/api/users/:id", async function (req, res) {
  const userid = req.params.id;

  User.getUserBySourceIdPromise(userid).then(
    (user) => {
      res.send(user);
    },
    (err) => {
      res.status(404).send(err.message);
    }
  );

  // User.getUserById(userid, (user) => {
  //   if (!user) return res.sendStatus(404);
  //   res.send(user);
  // });
});

app.post("/api/users", multer().none(), function (req, res) {
  if (!req.body) return res.sendStatus(400);

  let name = req.body.name;
  let surname = req.body.surname;
  let sourceid = req.body.sourceid;
  let login = req.body.login;
  let from = req.body.from;

  let user = User.FromFieldsInstance(name, surname, sourceid, login, from);

  User.insertUser(user, (newUser) => {
    if (!newUser || newUser?.message)
      return res.status(500).send(newUser.message);
    res.send(newUser);
  });
});

app.delete("/api/users/:id", function (req, res) {
  let userid = req.params.id;

  User.deleteUserById(userid, (result) => {
    if (!result.deletedCount) return res.sendStatus(500);
    res.send(result);
  });
});

app.put("/api/users", multer().none(), function (req, res) {
  if (!req.body) return res.sendStatus(400);

  let name = req.body.name;
  let surname = req.body.surname;
  let sourceid = req.body.sourceid;
  let login = req.body.login;
  let from = req.body.from;
  let messageCount = req.body.messageCount;

  User.getUserBySourceId(sourceid, (user) => {
    if (!user) return res.sendStatus(404);

    if (name) user.name = name;
    if (surname) user.surname = surname;
    if (login) user.login = login;
    if (from) user.from = from;
    if (messageCount) user.messageCount = messageCount;

    User.updateUser(user, (updatedUser) => {
      if (!updatedUser || updatedUser?.message) {
        return res.status(500).send(newUser.message);
      }
      res.send(updatedUser);
    });
  });
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});
