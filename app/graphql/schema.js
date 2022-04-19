var { buildSchema } = require("graphql");

var schema = buildSchema(`
  scalar Date
  scalar DeleteResult

  type User {
    sourceid: String!
    name: String
    surename: String
    login: String!
    from: String
    messageCount: Int
    crDate: Date!
    crBy: String
    mdBy: String
    mdDate: Date
  }

  type Query {
    users: [User!]!
    user(sourceid: String!): User!
  }
  
  input UserInput {
    sourceid: String!
    name: String
    surename: String
    login: String!
    from: String
  }

  input UserUpdateInput {
    sourceid: String!
    name: String
    surename: String
    login: String
    from: String
    messageCount: Int
  }

  type Mutation {
    updateUser(input: UserUpdateInput!): User!
    deleteUser(sourceid: String!): DeleteResult!
    insertUser(input: UserInput!): User!
    setMessageCountBySourceId(sourceid: String!, messageCount: Int!): User!
  }
`);

module.exports = schema;
