const assert = require("assert");
const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const chaiHttp = require("chai-http");
const { MongoConnector } = require("./connectors/mongoConnector.js");
var app = require("./app").app;

chai.use(chaiHttp);
before(function (done) {
  app.on("ServerRun", function () {
    done();
  });
});

describe("[Axios]", function () {
  describe("[User]", function () {
    it("/user get all", function (done) {
      chai
        .request(app)
        .get("/api/users")
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it("/user insert", function (done) {
      chai
        .request(app)
        .post("/api/users")
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
          res.error.text.should.be.eql("User with this ID already exists!");
          done();
        });
    });

    it("/user find", function (done) {
      chai
        .request(app)
        .get(`/api/users/test1488test1488`)
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
        .end((err, res) => {
          res.should.have.status(200);
          res.body.deletedCount.should.be.eql(1);
          done();
        });
    });
  });
});

after(function () {});
