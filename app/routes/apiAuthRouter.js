import { AuthAPI } from "../models/AuthAPI";
const multer = require("multer");
const bcrypt = require("bcrypt");
const rounds = 10;
var router = require("express").Router();

router.get("/Auth/:apikey", async function (req, res) {
  const apikey = req.params.apikey;

  AuthAPI.getAuthAPIByApiKey(apikey).then(
    (api) => {
      res.json(api);
    },
    (err) => {
      res.status(404).json(err.message);
    }
  );
});

router.post("/Auth", multer().none(), function (req, res) {
  if (!req.body) return res.sendStatus(400);

  let appname = req.body.appname;
  let email = req.body.email;
  let password = req.body.password;

  bcrypt.hash(password, rounds, (error, hash) => {
    if (error) res.status(500).json(error);

    let authAPI = new AuthAPI(appname, email, hash);

    AuthAPI.insertAuthAPI(authAPI, (newAuthApi) => {
      if (!newAuthApi || newAuthApi?.message)
        return res.status(500).json(newAuthApi.message);
      res.json(newAuthApi);
    });
  });
});

module.exports = router;
