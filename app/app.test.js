const request = require("supertest");
const assert = require("assert");
const { MongoConnector } = require("./modules/mongoConnector.js");
var app = require("./app").app;

before(function (done) {
    MongoConnector.getInstance().on("TablesLoaded", function () {
        done();
    });
});

it("get all users test", function (done) {
  request(app).get("/api/users").expect(200).end(done);
});