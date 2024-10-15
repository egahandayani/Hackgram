const { ObjectId } = require("mongodb");
const db = require("../config/mongodb");

class Follow {
  static async addFollow(followingId, followerId) {
    try {
      const result = await db.collection("follows").insertOne({
        followingId: new ObjectId(followingId),
        followerId: new ObjectId(followerId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return result;
    } catch (err) {
      console.log("🚀 ~ Follow ~ addFollow ~ err:", err);
    }
  }

  static async getFollowById(id) {
    try {
      const follow = await db.collection("follows").findOne({
        _id: new ObjectId(id),
      });
      return follow;
    } catch (err) {
      console.log("🚀 ~ Follow ~ getFollowById ~ err:", err);
    }
  }

  static async getFollowByUsers(followingId, followerId) {
    try {
      const follow = await db.collection("follows").findOne({
        followingId: new ObjectId(followingId),
        followerId: new ObjectId(followerId),
      });

      return follow;
    } catch (err) {
      console.log("🚀 ~ Follow ~ getFollowByUsers ~ err:", err);
    }
  }
}

module.exports = Follow;
