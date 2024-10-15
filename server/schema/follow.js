const Follow = require("../models/Follow");
const User = require("../models/User");

const followTypeDefs = `#graphql
      type Follow {
          _id: String
          followingId: String
          followerId: String
          user: User
          createdAt: String
          updatedAt: String
      }

      type Mutation {
        followUser(followingId: String, followerId: String): Follow
      }
  `;

const followResolvers = {
  Mutation: {
    followUser: async (parent, args, contextValue, info) => {
      try {
        const loginUser = await contextValue.auth();
        let { followingId } = args;
        const followerId = loginUser._id;

        const userToFollow = await User.getUserById(followingId);
        if (!userToFollow) {
          throw new Error("User not found");
        }

        const existingFollow = await Follow.getFollowByUsers(
          followingId,
          followerId
        );
        if (existingFollow) {
          throw new Error("Already following this user");
        }

        await Follow.addFollow(followingId, followerId);
        const newFollow = await Follow.getFollowByUsers(followingId, followerId);
        return newFollow;
      } catch (err) {
        console.log("🚀 ~ followUser: ~ err:", err);
        throw err
      }
    },
  },
};

module.exports = { followTypeDefs, followResolvers };
