import { User } from "../models/User";
const multer = require("multer");
var router = require("express").Router();

router.get("/users", function (req, res) {
  User.getAllUsers((users) => {
    if (!users) return res.sendStatus(500);
    res.send(users);
  });
});

router.get("/users/:id", async function (req, res) {
  const userid = req.params.id;

  User.getUserBySourceIdPromise(userid).then(
    (user) => {
      res.send(user);
    },
    (err) => {
      res.status(404).send(err.message);
    }
  );
});

router.post("/users", multer().none(), function (req, res) {
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

router.delete("/users/:id", function (req, res) {
  let userid = req.params.id;

  User.deleteUserById(userid, (result) => {
    if (!result.deletedCount) return res.sendStatus(500);
    res.send(result);
  });
});

router.put("/users", multer().none(), function (req, res) {
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

module.exports = router;
