const express = require("express");
var { graphqlHTTP } = require('express-graphql');
const { MongoConnector } = require("./connectors/mongoConnector.js");
const schema = require("./schema.js");
const resolver = require("./resolver.js");
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [
        "'self'",
        /** @by-us - adds graphiql support over helmet's default CSP */
        "'unsafe-inline'",
      ],
      baseUri: ["'self'"],
      blockAllMixedContent: [],
      fontSrc: ["'self'", 'https:', 'data:'],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      scriptSrc: [
        "'self'",
        /** @by-us - adds graphiql support over helmet's default CSP */
        "'unsafe-inline'",
        /** @by-us - adds graphiql support over helmet's default CSP */
        "'unsafe-eval'",
      ],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(cors());
app.use(morgan('combined'));

app.use('/api', require('./routes/apiAuthRouter'))
app.use('/api', require('./routes/userRouter'))

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolver,
  graphiql: true,
}));

const mongoConnector = new MongoConnector({
  hostname: "127.0.0.1",
  port: 27017,
  dbName: "admin",
  user: "root",
  password: "password",
});
MongoConnector.registerTables(["DiscrodUsers", "TelegramUsers", "Messages", "AuthAPI"]);
MongoConnector.connect()
  .then(() => {

  })
  .catch((exception) => {
    console.log(exception);
    process.exit();
  });

MongoConnector.getInstance().on("TablesLoaded", function () {
  let server = app.listen(3000, function () {
    console.log("Server is waiting for connections...");
    app.emit("ServerRun");
  });

  app.on("Stop",()=>{
    server.close();
  });
});



module.exports.app = app;
