const request = require("supertest");
const assert = require("assert");
 
var app = require("./app").app;



it("get all users test", function(done){
    request(app)
        .get("/users")
        .expect(200)
        .end(done);
});