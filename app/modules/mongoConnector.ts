import { MongoClient } from "mongodb";
/*
Реконнект не працює, потрібно робити брокер повідомлень і відправляти через нього івенти на підключення і відключення від бази.
*/
const options = {
  reconnectInterval: 10000,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  reconnectTries: 600,
};
export class MongoConnector {
  static tables: Array<string> = [];
  static client: MongoClient;
  static repositoryParams: any;
  static dbName: string = "";
  static url: string = "";
  static connecting: boolean = false;

  constructor(repositoryParams: any) {
    MongoConnector.repositoryParams = repositoryParams;
    MongoConnector.dbName = repositoryParams.dbName;

    let url =
      "mongodb://" +
      repositoryParams.user +
      ":" +
      repositoryParams.password +
      "@" +
      repositoryParams.hostname +
      ":" +
      repositoryParams.port;
    MongoConnector.url = url;
  }

  static connect(): Promise<string> {
    if (this.client) {
      this.client.close();
      console.log("Mongo client closed.");
    }

    if (this.connecting) {
      console.log("Wait, mongo is reconnecting");
      return Promise.reject("Wait, mongo is reconnecting");
    }

    console.log("Mongo connecting...");
    this.connecting = true;

    return MongoClient.connect(this.url)
      .then(function (dbClient) {
        if (dbClient) {
          console.log("Mongo connected!");
          MongoConnector.connecting = false;
          MongoConnector.client = dbClient;
          MongoConnector.createCollections();
          return Promise.resolve("Mongo connected!");
        } else {
          MongoConnector.connecting = false;
          return Promise.reject("Mongo not connected!");
        }
      })
      .catch(function (err) {
        MongoConnector.connecting = false;
        return Promise.reject("Mongo not connected!");
      });
  }

  static reconnect(): Promise<string> {
    console.log("Mongo reconnect by command...");
    return this.connect();
  }

  static reconnectWithAwait() {
    setTimeout((onError) => {
        if (this.connecting) {
            return;
        }
       MongoConnector.connect().then();
    }, options.reconnectInterval);
  }

  static getCollection<T>(collectionName: string) {
    if (this.client) {
      return this.client.db(this.dbName).collection<T>(collectionName);
    }
  }

  static disconnect(): void {
    if (this.client && this.client.close) {
      this.client.close();
    }
  }

  static registerTable(table: string): void {
    this.tables.push(table);
    this.createCollection(table);
  }

  static registerTables(tables: Array<string>): void {
    tables.forEach((table) => {
      this.tables.push(table);
    });
  }

  static createCollection(table: string): void {
    this.createCollectionInDB(table);
  }

  static createCollections(): void {
    this.tables.forEach((table: any) => {
      this.createCollectionInDB(table);
    });
  }

  static createCollectionInDB(table: string, callback = () => {}): void {
    console.log(`Check ${table}`);
    if (this.client) {
      var db = this.client.db(this.dbName);
      db.createCollection(table, function (err: any, res: any) {
        if (err.code != 48) {
          console.log(`Collection ${table} created!`);
        } else if (err.code == 48) {
          console.log(`Collection ${table} allready exist!`);
        } else {
          console.log(err);
        }
        if (callback) callback();
      });
    } else {
      console.log(`Mongo not connected when creating table ${table}`);
    }
  }
}
