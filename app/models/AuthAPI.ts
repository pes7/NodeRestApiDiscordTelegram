import { MongoConnector } from "../connectors/mongoConnector";
import { FindOptions, ObjectId, OptionalId, WithId } from "mongodb";
import { sign, verify } from "jsonwebtoken";

const tokenapikey = "myTopapikeyAPIpss";

export class AuthAPI {
  appname: string;
  email: string;
  _id: number | string;
  password: number | string;
  apikey: string;
  crBy: string;
  crDate: Date;
  mdBy: string;
  mdDate: Date | null;
  constructor(appname: string = "", email: string = "", password: string = "") {
    this.appname = appname;
    this.email = email;
    this.password = password;

    this.crBy = "";
    this.mdBy = "";
    this.mdDate = null;
    this.crDate = new Date(Date.now());
  }

  private static generateApiKey(Auth: AuthAPI) {
    return sign(
      {
        data: {
          appname: Auth.appname,
          email: Auth.email,
          password: Auth.password,
          date: new Date(Date.now())
        }
      },
      tokenapikey
    );
  }

  static insertAuthAPI(api: AuthAPI, clb: (api: AuthAPI | Error) => {}) {
    let AuthAPICollection = MongoConnector.getCollection<AuthAPI>("AuthAPI");
    if (AuthAPICollection) {
      this.getAuthAPIbyEmail(api.email, (existAPI) => {
        if (!existAPI) {
          api.apikey = this.generateApiKey(api);
          AuthAPICollection?.insertOne(api, function (err: any, result: any) {
            if (err) {
              console.log(err, "Error when User insert");
              return clb(err);
            }
            clb(api);
          });
        } else {
          console.log("Error when User insert");
          return clb(new Error("User with this ID already exists!"));
        }
      });
    }
  }

  static getAuthAPIbyEmail(
    email: string,
    clb = (authAPI: AuthAPI | Error) => {}
  ): void {
    let AuthAPICollection = MongoConnector.getCollection("AuthAPI");
    if (AuthAPICollection) {
      AuthAPICollection.findOne(
        { email: email },
        function (err: any, result: any) {
          if (err) {
            console.log(err, "Error when AuthAPI find");
            return clb(err);
          }
          clb(result);
        }
      );
    }
  }

  static async getAuthAPIByApiKey(apikey: string): Promise<any> {
    try {
      let AuthAPICollection = await MongoConnector.getCollection("AuthAPI");
      if (AuthAPICollection) {
        let result = await AuthAPICollection.findOne({ apikey: apikey });
        if (!result) {
          throw new Error("Error when AuthAPI find");
        }
        return Promise.resolve(result);
      } else {
        throw new Error("AuthAPI getCollection error");
      }
    } catch (err: Error | any) {
      return Promise.reject(err);
    }
  }

  // static getUserById(
  //   id: number | string,
  //   clb = (user: User | Error) => {}
  // ): void {
  //   let userCollection = MongoConnector.getCollection("Users");
  //   if (userCollection) {
  //     userCollection.findOne(
  //       { _id: new ObjectId(id) },
  //       function (err: any, result: any) {
  //         if (err) {
  //           console.log(err, "Error when User find");
  //           return clb(err);
  //         }
  //         clb(result);
  //       }
  //     );
  //   }
  // }

  // static getUserBySourceId(
  //   sourceId: number | string,
  //   clb = (user: User | Error) => {}
  // ): void {
  //   let userCollection = MongoConnector.getCollection("Users");
  //   if (userCollection) {
  //     userCollection.findOne(
  //       { sourceid: sourceId },
  //       function (err: any, result: any) {
  //         if (err) {
  //           console.log(err, "Error when User find");
  //           return clb(err);
  //         }
  //         clb(result);
  //       }
  //     );
  //   }
  // }

  // static async getUserBySourceIdPromise(
  //   sourceid: number | string
  // ): Promise<any> {
  //   try {
  //     let userCollection = await MongoConnector.getCollection("Users");
  //     if (userCollection) {
  //       let result = await userCollection.findOne({ sourceid: sourceid });
  //       if (!result) {
  //         throw new Error("Error when User find");
  //       }
  //       return Promise.resolve(result);
  //     } else {
  //       throw new Error("Users getCollection error");
  //     }
  //   } catch (err: Error | any) {
  //     return Promise.reject(err);
  //   }
  // }

  // static deleteUserById(sourceid: number | string, clb = (result: any) => {}) {
  //   let userCollection = MongoConnector.getCollection("Users");
  //   if (userCollection) {
  //     userCollection.deleteOne(
  //       { sourceid: sourceid },
  //       function (err: any, result: any) {
  //         if (err) {
  //           console.log(err, "Error when User delete");
  //           return clb(err);
  //         }
  //         clb(result);
  //       }
  //     );
  //   }
  // }

  // static getAllUsers(
  //   clb = (users: Array<User> | Error) => {},
  //   limit: number = 0
  // ) {
  //   let userCollection = MongoConnector.getCollection("Users");
  //   if (userCollection) {
  //     if (limit > 0) {
  //       userCollection
  //         .find({ _id: { $exists: true } })
  //         .limit(limit)
  //         .toArray(function (err: any, result: any) {
  //           if (err) {
  //             console.log(err, "Error when get list of Users");
  //             return clb(err);
  //           }
  //           clb(result);
  //         });
  //     }

  //     userCollection
  //       .find({ _id: { $exists: true } })
  //       .toArray(function (err: any, result: any) {
  //         if (err) {
  //           console.log(err, "Error when get list of Users");
  //           return clb(err);
  //         }
  //         clb(result);
  //       });
  //   }
  // }

  // static updateUser(user: User, clb = (user: User | Error) => {}) {
  //   let userCollection = MongoConnector.getCollection("Users");
  //   user.mdDate = new Date(Date.now());
  //   //user.mdBy =

  //   var newvalues = {
  //     $set: {
  //       name: user.name,
  //       surname: user.surname,
  //       login: user.login,
  //       from: user.from,
  //       messageCount: user.messageCount,
  //       mdDate: user.mdDate,
  //       //mdBy:
  //     },
  //   };
  //   userCollection?.updateOne(
  //     { sourceid: user.sourceid },
  //     newvalues,
  //     function (err: any, result: any) {
  //       if (err) {
  //         console.log(err, "Error when update User");
  //         return clb(err);
  //       }
  //       clb(user);
  //     }
  //   );
  // }

  static createObj(AuthAPI: any): AuthAPI {
    return Object.assign(new AuthAPI(), AuthAPI);
  }
}
