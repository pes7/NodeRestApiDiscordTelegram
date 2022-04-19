import { MongoConnector } from "../connectors/mongoConnector";
import { DeleteResult, FindOptions, ObjectId, OptionalId, WithId } from "mongodb";

export enum FromType {
  Tg = "TG",
  Ds = "DS",
}

export class User {
  name: string;
  surname: string;
  _id: ObjectId;
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
    } else if (sourceid.toString().length > 0) {
      this.name = name;
      this.surname = surname;
      this.sourceid = sourceid;
      this.login = login;
      this.from = from;
      this.messageCount = 0;
    } else {
      this.sourceid = Math.floor(Math.random() * Date.now());
      this.name = name;
      this.surname = surname;
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

  static async insertUserPromise(user: User): Promise<User> {
    try {
      let userCollection = await MongoConnector.getCollection("Users");
      if (userCollection) {
        try {
          let foundUser = await this.getUserBySourceIdPromise(user.sourceid);
          throw new Error("User with this ID already exists!");
        } catch (error: Error | any) {
          if (error.message == "Error when User find") {
            let newUser = await userCollection.insertOne(user);
            if (!newUser) {
              throw new Error("Error when User insert");
            }

            let newUserObj = User.createObj(newUser);
            return Promise.resolve(newUserObj);
          } else {
            throw error;
          }
        }
      } else {
        throw new Error("Users getCollection error");
      }
    } catch (err: Error | any) {
      return Promise.reject(err);
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
  ): Promise<User> {
    try {
      let userCollection = await MongoConnector.getCollection("Users");
      if (userCollection) {
        let result = await userCollection.findOne({ sourceid: sourceid });
        if (!result) {
          throw new Error("Error when User find");
        }
        let user = User.createObj(result);
        return Promise.resolve(user);
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

  static async deleteUserByIdPromise(
    sourceid: number | string
  ): Promise<DeleteResult> {
    try {
      let userCollection = await MongoConnector.getCollection("Users");
      if (userCollection) {
        let result = await userCollection.deleteOne({ sourceid: sourceid });
        if (!result) {
          throw new Error("Error when User delete");
        }
        return Promise.resolve(result);
      } else {
        throw new Error("Users getCollection error");
      }
    } catch (err: Error | any) {
      return Promise.reject(err);
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

  static async getAllUsersPromise(limit: number = 0): Promise<any> {
    let userCollection = await MongoConnector.getCollection("Users");
    try {
      if (userCollection) {
        if (limit > 0) {
          let result = await userCollection
            .find({ _id: { $exists: true } })
            .limit(limit)
            .toArray();

          if (!result) {
            throw new Error("Error when get list of Users");
          }

          return result;
        }

        let result = await userCollection
          .find({ _id: { $exists: true } })
          .toArray();

        if (!result) {
          throw new Error("Error when get list of Users");
        }

        return result;
      }
    } catch (err: Error | any) {
      return Promise.reject(err);
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

  static async updateUserPromise(user: User): Promise<User> {
    let userCollection = await MongoConnector.getCollection("Users");
    try {
      if (userCollection) {
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
        let result = await userCollection.updateOne(
          { sourceid: user.sourceid },
          newvalues
        );

        if (!result) {
          throw new Error("Error when update User");
        }

        return user;
      } else {
        throw new Error("Can't get Users table");
      }
    } catch (err: Error | any) {
      return Promise.reject(err);
    }
  }

  static createObj(user: any): User {
    return Object.assign(new User(), user);
  }
}
