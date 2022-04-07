const assert = require("assert");
const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const chaiHttp = require("chai-http");
const { MongoConnector } = require("./connectors/mongoConnector.js");
var app = require("./app").app;

const TestApiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImFwcG5hbWUiOiJUZXN0ZXIxIiwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJiJDEwJFAzQy9CV2EyWGhwelNQVVZPdGNSOS5kUFFNTUtQbzdnNHNwbEhsdXVuR3VocG01dUh6RGV1IiwiZGF0ZSI6IjIwMjItMDQtMDdUMTc6MTQ6MzIuNzc0WiJ9LCJpYXQiOjE2NDkzNTE2NzJ9.FfSMjhJPU0ir3xxyo8p_SHNNpyOe3AkKOrkcJB-0R1Q";

chai.use(chaiHttp);
before(function (done) {
  app.on("ServerRun", function () {
    done();
  });
});

describe("[Axios]", function () {
  describe("[Auth]", function () {
    it("/get api by key", function (done) {
      chai
        .request(app)
        .get(`/api/auth/${TestApiKey}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.have.property("apikey").eql(TestApiKey);
          done();
        });
    });
  })

  describe("[User]", function () {
    it("/user get all", function (done) {
      chai
        .request(app)
        .get("/api/users")
        .set({'X-API-Key':TestApiKey, Accept: 'application/json' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it("/user delete if exist", function (done) {
      chai
        .request(app)
        .delete("/api/users/test1488test1488")
        .set({ 'X-API-Key':TestApiKey, Accept: 'application/json' })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    it("/user insert", function (done) {
      chai
        .request(app)
        .post("/api/users")
        .set({ 'X-API-Key':TestApiKey, Accept: 'application/json' })
        .set("Content-Type", "multipart/form-data")
        .type("form")
        .send({
          name: "[Test]Nazar",
          surname: "[Test]Ukolov",
          login: "testlogin",
          from: "TG",
          sourceid: "test1488test1488",
        })
        .end((error, res) => {
          res.should.have.status(200);
          res.body.should.have.property("sourceid").eql("test1488test1488");
          done();
        });
    });

    it("/user duplicate insert", function (done) {
      chai
        .request(app)
        .post("/api/users")
        .set({ 'X-API-Key':TestApiKey, Accept: 'application/json' })
        .set("Content-Type", "multipart/form-data")
        .type("form")
        .send({
          name: "[Test]Nazar",
          surname: "[Test]Ukolov",
          login: "testlogin",
          from: "TG",
          sourceid: "test1488test1488",
        })
        .end((error, res) => {
          res.should.have.status(500);
          res.error.text.should.be.eql("\"User with this ID already exists!\"");
          done();
        });
    });

    it("/user find", function (done) {
      chai
        .request(app)
        .get(`/api/users/test1488test1488`)
        .set({ 'X-API-Key':TestApiKey, Accept: 'application/json' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property("sourceid").eql("test1488test1488");
          done();
        });
    });

    it("/user delete", function (done) {
      chai
        .request(app)
        .delete("/api/users/test1488test1488")
        .set({ 'X-API-Key':TestApiKey, Accept: 'application/json' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.deletedCount.should.be.eql(1);
          done();
        });
    });
  });
});

after(function () {});
