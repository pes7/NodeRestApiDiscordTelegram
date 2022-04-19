import { User } from "../models/User";

var root = {
  user: async ({ sourceid }) => {
    return User.getUserBySourceIdPromise(sourceid)
      .then((user) => {
        return user;
      })
      .catch((error) => {
        console.log(error.message);
        return null;
      });
  },
  users: async () => {
    return User.getAllUsersPromise()
      .then((users) => {
        return users;
      })
      .catch((error) => {
        console.log(error.message);
        return error;
      });
  },
  insertUser: async (userFields)=>{
    let input = userFields.input;

    let name = input.name;
    let surname = input.surname;
    let login = input.login;
    let from = input.from;
    let sourceid = input.sourceid;

    let user = User.FromFieldsInstance(name,surname,sourceid,login,from);
    return User.insertUserPromise(user).then(newUser=>{
      return user;
    }).catch(error=>{
      console.log(error.message);
      return error;
    });
  },
  updateUser: async (userUpdateFields)=>{
    let input = userUpdateFields.input;

    let name = input.name;
    let surname = input.surname;
    let login = input.login;
    let from = input.from;
    let sourceid = input.sourceid;
    let messageCount = input.messageCount;

    return User.getUserBySourceIdPromise(sourceid).then(user=>{
      if (!user) return res.sendStatus(404);
  
      if (name) user.name = name;
      if (surname) user.surname = surname;
      if (login) user.login = login;
      if (from) user.from = from;
      if (messageCount) user.messageCount = messageCount;
  
      return User.updateUserPromise(user).then(user=>{
        return user;
      }).catch(error=>{
        console.log(error.message);
        return error;
      });
    }).catch(error=>{
      console.log(error.message);
      return error;
    });
  },
  deleteUser: async ({sourceid})=>{
    return User.deleteUserByIdPromise(sourceid).then(result=>{
      return result;
    }).catch(error=>{
      console.log(error.message);
      return error;
    });
  },  
  setMessageCountBySourceId: async ({sourceid,messageCount}) => {
    return User.getUserBySourceIdPromise(sourceid).then(user=>{
      user.messageCount = messageCount;
      return User.updateUserPromise(user).then(user=>{
        return user;
      }).catch(error=>{
        console.log(error.message);
        return error;
      });
    }).catch(error=>{
      console.log(error.message);
      return error;
    });
  }
};

export default root;
