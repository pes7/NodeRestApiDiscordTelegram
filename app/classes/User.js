const mongoClient = require("../modules/mongoConnector.js");

class User {
  _name = "";
  _surname = "";
  _id = "";
  _login = "";
  _from = "";
  _messageCount = "";
  constructor(
    fromTg = null,
    fromDiscrod = null,
    name = null,
    surname = null,
    id = null,
    login = null,
    from = null
  ) {
    if (fromTg) {
      this._id = from?.id;
      this._name = from?.first_name;
    } else if (fromDiscrod) {
    } else if (id) {
      this._name = name;
      this._surname = surname;
      this._id = id;
      this._login = login;
      this._from = from;
      this._messageCount = 0;
    }
  }
  static FromFieldsInstance(name, surname, id, login, from) {
    return new User(
      null,null,name,surname,id,login,from
    );
  }
  static FromTgInstance(fromTg) {
    return new User(fromTg);
  }
  static FromDiscordInstance(fromDiscrod) {
    return new User(null,fromDiscrod);
  }

  static insertUser(user, clb = (user) => {}) {
    let userCollection = mongoClient.getCollection("Users");
    if (userCollection) {
      userCollection.insertOne(user, function (err, result) {
        if (err) {
          console.log(err, "Error when User insert");
          return clb(null);
        }
        clb(user);
      });
    }
  }

  static getUserById(id, clb) {
    let userCollection = mongoClient.getCollection("Users");
    if (userCollection) {
      userCollection.findOne({ _id: id }, function (err, result) {
        if (err) console.log(err, "err");
        clb(result);
      });
    }
  }

  //   static updateUser(
  //     user,
  //     clb = (tr) => {
  //       if (_DEBUG) console.log(`Update: ${tr}`);
  //     }
  //   ) {
  //     const mongoClient = new MongoClient(_url, _setting);
  //     mongoClient.connect(function (err, client) {
  //       if (err) console.log(err, "err");
  //       const db = client.db(_DB);
  //       const collection = db.collection(User.table);
  //       var newvalues = { $set: { Character: user.Character } };
  //       collection.updateOne(
  //         { "Character.Info._id": user.Character.Info._id },
  //         newvalues,
  //         function (err, res) {
  //           if (err) {
  //             clb(false);
  //             return false;
  //           }
  //           clb(true);
  //           client.close();
  //         }
  //       );
  //     });
  //   }

  //   static getUser(from, clb) {
  //     const mongoClient = new MongoClient(_url, _setting);
  //     mongoClient.connect(function (err, client) {
  //       if (err) return console.log(err, "err");
  //       const db = client.db(_DB);
  //       db.collection(User.table).findOne(
  //         { "Character.Info._id": from?.id },
  //         function (err, result) {
  //           if (err) console.log(err, "err");
  //           client.close();
  //           clb(result);
  //         }
  //       );
  //     });
  //   }

  //   static getTopUsers(clb) {
  //     const mongoClient = new MongoClient(_url, _setting);
  //     mongoClient.connect(function (err, client) {
  //       if (err) return console.log(err, "err");
  //       const db = client.db(_DB);
  //       db.collection(User.table)
  //         .find({ "Character.Cultivation._points": { $exists: true } })
  //         .sort({ "Character.Cultivation._points": -1 })
  //         .limit(10)
  //         .toArray(function (err, result) {
  //           if (err) console.log(err, "err");
  //           client.close();
  //           clb(result);
  //         });
  //     });
  //   }

  static createObj(user) {
    return Object.assign(new User(), user);
  }
}

module.exports = User;
