const express = require("express");
const mongoClient = require("./modules/mongoConnector.js");
const { User } = require("./classes/User.js");
//import { User } from "./classes/User";
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

app.get("/api/users", function (req, res) {
  User.getAllUsers((users) => {
    if (!users) return res.sendStatus(500);
    res.send(users);
  });
});

//получение одного пользователя по id
app.get("/api/users/:id", async function (req, res) {
  const userid = req.params.id;
  
  User.getUserByIdPromise(userid).then((user)=>{
    res.send(user);
  },(err)=>{
    res.sendStatus(404);
  });

  // User.getUserById(userid, (user) => {
  //   if (!user) return res.sendStatus(404);
  //   res.send(user);
  // });
});

// получение отправленных данных
app.post("/api/users", multer().none(), function (req, res) {
  if (!req.body) return res.sendStatus(400);

  let name = req.body.name;
  let surname = req.body.surname;
  let userid = req.body.id;
  let login = req.body.login;
  let from = req.body.from;

  let user = User.FromFieldsInstance(name, surname, userid, login, from);

  User.insertUser(user, (newUser) => {
    if (!newUser || newUser?.message) return res.status(500).send(newUser.message);
    res.send(newUser);
  });
});

// удаление пользователя по id
app.delete("/api/users/:id", function (req, res) {
  let userid = req.params.id;

  User.deleteUserById(userid, (result) => {
    if (!result.deletedCount) return res.sendStatus(500);
    res.send(result);
  });
});

// изменение пользователя
app.put("/api/users", function (req, res) {
  if (!req.body) return res.sendStatus(400);

  let name = req.body.name;
  let surname = req.body.surname;
  let userid = req.body.id;
  let login = req.body.login;
  let from = req.body.from;
  let messageCount = req.body.messageCount;

  
  User.getUserById(userid, (user) => {
    if (!user) return res.sendStatus(404);

    if(name) user.name

    //Дописать
  });
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});
