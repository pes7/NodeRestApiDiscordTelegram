const express = require("express");
const mongoClient = require("./modules/mongoConnector.js");
const User = require("./classes/User.js");
const multer = require('multer');
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

const jsonParser = express.json();

app.use(express.static(__dirname + "/public"));

app.get("/api/users", function (req, res) {
  //     let users = mongoClient.getClient().
  //   const content = fs.readFileSync(filePath, "utf8");
  //   const users = JSON.parse(content);
  //   /res.send(users);
});
// получение одного пользователя по id
// app.get("/api/users/:id", function (req, res) {
//   const id = req.params.id; // получаем id
//   const content = fs.readFileSync(filePath, "utf8");
//   const users = JSON.parse(content);
//   let user = null;
//   // находим в массиве пользователя по id
//   for (var i = 0; i < users.length; i++) {
//     if (users[i].id == id) {
//       user = users[i];
//       break;
//     }
//   }
//   // отправляем пользователя
//   if (user) {
//     res.send(user);
//   } else {
//     res.status(404).send();
//   }
// });

// получение отправленных данных
app.post("/api/users",multer().none(), function (req, res) {
  if (!req.body) return res.sendStatus(400);

  let name = req.body.name;
  let surname = req.body.surname;
  let userid = req.body.id;
  let login = req.body.login;
  let from = req.body.from; // TG or DS


  let user = User.FromFieldsInstance(name, surname, userid, login, from);

  User.insertUser(user, (newUser) => {
    if (newUser) {
      res.send(newUser);
    } else {
      res.status(503).send();
    }
  });
});
// // удаление пользователя по id
// app.delete("/api/users/:id", function (req, res) {
//   const id = req.params.id;
//   let data = fs.readFileSync(filePath, "utf8");
//   let users = JSON.parse(data);
//   let index = -1;
//   // находим индекс пользователя в массиве
//   for (var i = 0; i < users.length; i++) {
//     if (users[i].id == id) {
//       index = i;
//       break;
//     }
//   }
//   if (index > -1) {
//     // удаляем пользователя из массива по индексу
//     const user = users.splice(index, 1)[0];
//     data = JSON.stringify(users);
//     fs.writeFileSync("users.json", data);
//     // отправляем удаленного пользователя
//     res.send(user);
//   } else {
//     res.status(404).send();
//   }
// });
// // изменение пользователя
// app.put("/api/users", jsonParser, function (req, res) {
//   if (!req.body) return res.sendStatus(400);

//   const userId = req.body.id;
//   const userName = req.body.name;
//   const userAge = req.body.age;

//   let data = fs.readFileSync(filePath, "utf8");
//   const users = JSON.parse(data);
//   let user;
//   for (var i = 0; i < users.length; i++) {
//     if (users[i].id == userId) {
//       user = users[i];
//       break;
//     }
//   }
//   // изменяем данные у пользователя
//   if (user) {
//     user.age = userAge;
//     user.name = userName;
//     data = JSON.stringify(users);
//     fs.writeFileSync("users.json", data);
//     res.send(user);
//   } else {
//     res.status(404).send(user);
//   }
// });

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});
