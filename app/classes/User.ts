import mongoClient from "../modules/mongoConnector";
//const mongoClient = require("../modules/mongoConnector.js");

export enum FromType {
  Tg = "TG",
  Ds = "DS",
}

export class User {
  name: string;
  surname: string;
  id: number | string;
  login: string;
  from: FromType;
  messageCount: number;
  constructor(
    fromTg: any = null,
    fromDiscrod: any = null,
    name: string = "",
    surname: string = "",
    id: string | number = "",
    login: string = "",
    from: FromType = FromType.Tg
  ) {
    if (fromTg) {
      this.id = fromTg?.id;
      this.name = fromTg?.first_name;
    } else if (fromDiscrod) {
    } else if (id) {
      this.name = name;
      this.surname = surname;
      this.id = id;
      this.login = login;
      this.from = from;
      this.messageCount = 0;
    }
  }
  static FromFieldsInstance(
    name: string,
    surname: string,
    id: string | number,
    login: string,
    from: FromType
  ) {
    return new User(null, null, name, surname, id, login, from);
  }
  static FromTgInstance(fromTg: any) {
    return new User(fromTg);
  }
  static FromDiscordInstance(fromDiscrod: any) {
    return new User(null, fromDiscrod);
  }

  static insertUser(user: User, clb: (user: User | Error) => {}) {
    let userCollection = mongoClient.getCollection("Users");
    if (userCollection) {
      this.getUserById(user.id, (existUser) => {
        console.log(existUser);
        if (!existUser) {
          userCollection.insertOne(user, function (err: Error, result: any) {
            if (err) {
              console.log(err, "Error when User insert");
              return clb(err);
            }
            clb(user);
          });
        }else{
          console.log("Error when User insert");
          return clb(new Error("User with this ID already exists!"));
        }
      });
    }
  }

  static getUserById(
    id: number | string,
    clb = (user: User | Error) => {}
  ): void {
    let userCollection = mongoClient.getCollection("Users");
    if (userCollection) {
      userCollection.findOne({ id: id }, function (err: Error, result: any) {
        if (err) {
          console.log(err, "Error when User find");
          return clb(err);
        }
        clb(result);
      });
    }
  }

  // static getUserByIdPromise(id: number | string): Promise<User> {
  //   let userCollection = mongoClient.getCollection("Users");
  //   if (userCollection) {
  //     userCollection.findOne({ id: id }, function (err, result) {
  //       if (err) {
  //         console.log(err, "Error when User find");
  //         return Promise.reject(err);
  //       }
  //       return Promise.resolve(result);
  //     });
  //   } else {
  //     return Promise.reject(new Error("User collection undefined!"));
  //   }
  // }

  static async getUserByIdPromise(id: number | string): Promise<User> {
    try {
      let userCollection = await mongoClient.getCollection("Users");
      if (userCollection) {
        let result = await userCollection.findOne({ id: id });
        return result ? Promise.resolve(result) : Promise.reject("Error when User find");
      } else {
        return Promise.reject(new Error("Users getCollection error"));
      }
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static deleteUserById(id: number | string, clb = (result: any) => {}) {
    let userCollection = mongoClient.getCollection("Users");
    if (userCollection) {
      userCollection.deleteOne({ id: id }, function (err: Error, result: any) {
        if (err) {
          console.log(err, "Error when User delete");
          return clb(err);
        }
        clb(result);
      });
    }
  }

  static getAllUsers(
    clb = (users: Array<User> | Error) => {},
    limit: number = 0
  ) {
    let userCollection = mongoClient.getCollection("Users");
    if (userCollection) {
      if (limit > 0) {
        userCollection
          .find({ id: { $exists: true } })
          .limit(limit)
          .toArray(function (err: Error, result: any) {
            if (err) {
              console.log(err, "Error when get list of Users");
              return clb(err);
            }
            clb(result);
          });
      }

      userCollection
        .find({ id: { $exists: true } })
        .toArray(function (err: Error, result: any) {
          if (err) {
            console.log(err, "Error when get list of Users");
            return clb(err);
          }
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

  static createObj(user: any): User {
    return Object.assign(new User(), user);
  }
}
