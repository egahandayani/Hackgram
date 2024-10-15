const User = require("../models/User");
const { validateEmail } = require("../helpers/validateEmail");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
require("dotenv").config();

// const users = [
//   {
//     _id: 1,
//     name: "user1",
//     username: "user1",
//     email: "user1@gmail.com",
//     password: "user123",
//   },
// ];

const userTypeDefs = `#graphql
    type User {
        _id: String!
        name: String!
        username: String!
        email: String!
        password: String!

        followers: [Follow]
        followings: [Follow]
    }

    type Query {
        users: [User]
        userById(_id: String!): User!
        searchUsers(searchKey: String!): [User]
    }

    type RegisterResponse {
      message: String
    }

    type LoginResponse {
      access_token: String
      user: User
    }

    input UserForm {
      name: String
      username: String
      email: String
      password: String
    }

    type Mutation {
      register(newUser: UserForm!): RegisterResponse
      login(username: String!, password: String!): LoginResponse
    }
`;

const userResolvers = {
  Query: {
    users: async (parent, args, contextValue, info) => {
      try {
        await contextValue.auth();
        const users = await User.getUsers();
        return users;
      } catch (err) {
        console.log("🚀 ~ users: ~ err:", err);
        throw err;
      }
    },
    userById: async (parent, args, contextValue, info) => {
      try {
        const { _id } = args;
        await contextValue.auth();
        const user = await User.getUserById(_id);
        return user;
      } catch (err) {
        console.log("🚀 ~ userById: ~ err:", err);
        throw err;
      }
    },

    searchUsers: async (parent, args, contextValue, info) => {
      try {
        await contextValue.auth();
        const { searchKey } = args;
        const users = await User.searchUsersBySearchKey(searchKey);
        return users;
      } catch (err) {
        console.log("🚀 ~ searchUsers: ~ err:", err);
        throw err;
      }
    },
  },

  Mutation: {
    register: async (parent, args, contextValue, info) => {
      // take args
      const { newUser } = args;

      // validation
      if (!newUser.name) {
        throw new Error("Name is required");
      }
      if (!newUser.username) {
        throw new Error("Username is required");
      }
      if (!newUser.email) {
        throw new Error("Email is required");
      }
      if (!newUser.password) {
        throw new Error("Password is required");
      }

      if (!validateEmail(newUser.email)) {
        throw new Error("Email format is wrong");
      }

      const user = await User.getOneUser({
        email: newUser.email,
      });

      if (user) {
        throw new Error("Email already exists");
      }

      // create user
      await User.addUser(newUser);
      return {
        message: "User has been registered successfully",
      };
    },

    login: async (parent, args, contextValue, info) => {
      // validation
      if (!args.username) {
        throw new Error("Username is required");
      }
      if (!args.password) {
        throw new Error("Password is required");
      }

      const user = await User.getOneUser({
        username: args.username,
      });

      if (!user) {
        throw new Error("Invalid username or password");
      }

      const isValidPassword = await comparePassword(
        args.password,
        user.password
      );

      if (!isValidPassword) {
        throw new Error("Invalid username or password");
      }
      const access_token = signToken({ _id: user._id }, process.env.JWT_SECRET);
      console.log(user);
      console.log(access_token);
      return {
        access_token,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
        },
      };
    },
  },
};

module.exports = { userTypeDefs, userResolvers };
