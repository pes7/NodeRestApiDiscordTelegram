const MongoClient = require('mongodb').MongoClient;

const options = {
    reconnectInterval: 10000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
    reconnectTries: 600
}
module.exports = {
    _tables: [],
    _collectionsFromJson: [],
    init: function(repositoryParams,onError,onConnect=null){
        this._client = null;
        this._error = onError;
        this._repositoryParams = repositoryParams;
        this._dbName = repositoryParams.dbName;

        let url = "mongodb://" + repositoryParams.user + ":" + repositoryParams.password + "@" + repositoryParams.hostname + ":" 
                               + repositoryParams.port;

        console.log(url);
        if(this._client && this._client.isConnected()){
            this._client.close();
            console.log('Mongo client closed.');
        }

        console.log('Mongo connecting...');
        MongoClient.connect(url,(err, dbClient) => {
            if (err) {
                this._error(err);
                setTimeout((repositoryParams,onError)=>{
                    this.init(repositoryParams,onError)
                },options.reconnectInterval,repositoryParams,onError)
            }else{
                if(dbClient){
                    console.log('Mongo connected!');
                    this._client = dbClient;
                    if(onConnect){
                        onConnect();
                    }
                }else{
                    console.log('Mongo reconnect...');
                    setTimeout((repositoryParams,onError)=>{
                        this.init(repositoryParams,onError)
                    },options.reconnectInterval,repositoryParams,onError)
                }   
            }
        });
    },
    reconnect: function () {
        console.log('Mongo reconnect by command...');
        this.init(this._repositoryParams,this._error)
    },
    getClient: function(){
        return this._client;
    },
    getCollection: function(collectionName){
        let client = this.getClient();
        if(client){
            return client.db(this._dbName).collection(collectionName)
        }
    },
    disconnect: function(){
        let client = this.getClient();
        if (client && client.close) {
            client.close();
        }
    },
    registerTable: function(table){
        this._tables.push(table);
        this._createCollection(table);
    },
    registerTables: function(tables){
        tables.forEach(table => {
            this._tables.push(table);
        });
    },
    _createCollection: function(table){
        this._createCollectionInDB(table);
    },
    _createCollections: function(){
        this._tables.forEach(table => {
            this._createCollectionInDB(table);
        });
    },
    _createCollectionInDB: function(table,callback=null){
        console.log(`Check ${table}`)
        if(this._client){
            var db = this._client.db(this._dbName);
            db.createCollection(table, function(err, res) {
                if(err.code != 48) {
                    console.log(`Collection ${table} created!`);
                }else if(err.code == 48){
                    console.log(`Collection ${table} allready exist!`)
                }else{
                    console.log(err)
                }
                if(callback)
                    callback();
            });
        }else{
            console.log(`Mongo not connected when creating table ${table}`);
        }
      }
}