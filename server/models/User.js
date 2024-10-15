const { ObjectId } = require("mongodb");
const db = require("../config/mongodb");
const { hashPassword } = require("../helpers/bcrypt");

class User {
  static async getUsers() {
    return db.collection("users").find().toArray();
  }

  static async getUserById(id) {
    const userPromise = db.collection("users").findOne({
      _id: new ObjectId(id),
    });

    const followersPromise = db
      .collection("follows")
      .aggregate([
        {
          $match: {
            followingId: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followerId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            "follower.password": 0,
          },
        },
      ])
      .toArray();

    const followingsPromise = db
      .collection("follows")
      .aggregate([
        {
          $match: {
            followerId: new ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followingId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            "following.password": 0,
          },
        },
      ])
      .toArray();

    const [user, followers, followings] = await Promise.all([
      userPromise,
      followersPromise,
      followingsPromise,
    ]);

    if (!user) throw new Error("User not found");
    user.followers = followers;
    user.followings = followings;
    return user;
  }

  static async getOneUser(filter) {
    const result = await db.collection("users").findOne(filter);
    return result;
  }

  static async addUser(newUser) {
    const objNewUser = {
      ...newUser,
      password: await hashPassword(newUser.password),
    };
    const result = await db.collection("users").insertOne(objNewUser);
    return result;
  }

  static async loginUser(username, password) {
    try {
      const user = await db
        .collection("users")
        .findOne({ username: username, password: password });

      return user;
    } catch (err) {
      throw err;
    }
  }

  static async searchUsersBySearchKey(searchKey) {
    try {
      const regex = new RegExp(searchKey, "i");

      const users = await db
        .collection("users")
        .find({
          $or: [{ name: { $regex: regex } }, { username: { $regex: regex } }],
        })
        .toArray();

      return users;
    } catch (err) {
      console.log("🚀 ~ User ~ searchUsersBySearchKey ~ err:", err);
      throw err;
    }
  }
}

module.exports = User;
