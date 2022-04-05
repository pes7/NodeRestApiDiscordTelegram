import { MongoConnector } from "../modules/mongoConnector";
import { FindOptions, ObjectId, OptionalId, WithId } from "mongodb";

export enum FromType {
  Tg = "TG",
  Ds = "DS",
}

export class User {
  name: string;
  surname: string;
  _id: number | string;
  sourceid: number | string;
  login: string;
  from: FromType;
  messageCount: number;
  crBy: string;
  crDate: Date;
  mdBy: string;
  mdDate: Date | null;
  constructor(
    fromTg: any = null,
    fromDiscrod: any = null,
    name: string = "",
    surname: string = "",
    sourceid: string | number = "",
    login: string = "",
    from: FromType = FromType.Tg
  ) {
    if (fromTg) {
      this.sourceid = fromTg?.id;
      this.name = fromTg?.first_name;
    } else if (fromDiscrod) {
    } else if (sourceid) {
      this.name = name;
      this.surname = surname;
      this.sourceid = sourceid;
      this.login = login;
      this.from = from;
      this.messageCount = 0;
    }

    this.crBy = "";
    this.mdBy = "";
    this.mdDate = null;
    this.crDate = new Date(Date.now());
  }
  static FromFieldsInstance(
    name: string,
    surname: string,
    sourceid: string | number,
    login: string,
    from: FromType
  ) {
    return new User(null, null, name, surname, sourceid, login, from);
  }
  static FromTgInstance(fromTg: any) {
    return new User(fromTg);
  }
  static FromDiscordInstance(fromDiscrod: any) {
    return new User(null, fromDiscrod);
  }

  static insertUser(user: User, clb: (user: User | Error) => {}) {
    let userCollection = MongoConnector.getCollection<User>("Users");
    if (userCollection) {
      this.getUserBySourceId(user.sourceid, (existUser) => {
        if (!existUser) {
          userCollection?.insertOne(user, function (err: any, result: any) {
            if (err) {
              console.log(err, "Error when User insert");
              return clb(err);
            }
            clb(user);
          });
        } else {
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
    let userCollection = MongoConnector.getCollection("Users");
    if (userCollection) {
      userCollection.findOne(
        { _id: new ObjectId(id) },
        function (err: any, result: any) {
          if (err) {
            console.log(err, "Error when User find");
            return clb(err);
          }
          clb(result);
        }
      );
    }
  }

  static getUserBySourceId(
    sourceId: number | string,
    clb = (user: User | Error) => {}
  ): void {
    let userCollection = MongoConnector.getCollection("Users");
    if (userCollection) {
      userCollection.findOne(
        { sourceid: sourceId },
        function (err: any, result: any) {
          if (err) {
            console.log(err, "Error when User find");
            return clb(err);
          }
          clb(result);
        }
      );
    }
  }

  static async getUserBySourceIdPromise(
    sourceid: number | string
  ): Promise<any> {
    try {
      let userCollection = await MongoConnector.getCollection("Users");
      if (userCollection) {
        let result = await userCollection.findOne({ sourceid: sourceid });
        if (!result) {
          throw new Error("Error when User find");
        }
        return Promise.resolve(result);
      } else {
        throw new Error("Users getCollection error");
      }
    } catch (err: Error | any) {
      return Promise.reject(err);
    }
  }

  static deleteUserById(sourceid: number | string, clb = (result: any) => {}) {
    let userCollection = MongoConnector.getCollection("Users");
    if (userCollection) {
      userCollection.deleteOne(
        { sourceid: sourceid },
        function (err: any, result: any) {
          if (err) {
            console.log(err, "Error when User delete");
            return clb(err);
          }
          clb(result);
        }
      );
    }
  }

  static getAllUsers(
    clb = (users: Array<User> | Error) => {},
    limit: number = 0
  ) {
    let userCollection = MongoConnector.getCollection("Users");
    if (userCollection) {
      if (limit > 0) {
        userCollection
          .find({ _id: { $exists: true } })
          .limit(limit)
          .toArray(function (err: any, result: any) {
            if (err) {
              console.log(err, "Error when get list of Users");
              return clb(err);
            }
            clb(result);
          });
      }

      userCollection
        .find({ _id: { $exists: true } })
        .toArray(function (err: any, result: any) {
          if (err) {
            console.log(err, "Error when get list of Users");
            return clb(err);
          }
          clb(result);
        });
    }
  }

  static updateUser(user: User, clb = (user: User | Error) => {}) {
    let userCollection = MongoConnector.getCollection("Users");
    user.mdDate = new Date(Date.now());
    //user.mdBy = 

    var newvalues = {
      $set: {
        name: user.name,
        surname: user.surname,
        login: user.login,
        from: user.from,
        messageCount: user.messageCount,
        mdDate: user.mdDate,
        //mdBy:
      },
    };
    userCollection?.updateOne(
      { sourceid: user.sourceid },
      newvalues,
      function (err: any, result: any) {
        if (err) {
          console.log(err, "Error when update User");
          return clb(err);
        }
        clb(user);
      }
    );
  }

  static createObj(user: any): User {
    return Object.assign(new User(), user);
  }
}
