const { ObjectId } = require("mongodb");
const db = require("../config/mongodb");

class Post {
  static async getPosts() {
    return db
      .collection("posts")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $unwind: "$author",
        },
        {
          $project: {
            "author.password": 0,
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ])
      .toArray();
  }

  static async getPostById(id) {
    try {
      const objectId = new ObjectId(id);
  
      const post = await db
        .collection("posts")
        .aggregate([
          {
            $match: {
              _id: objectId,
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "authorId",
              foreignField: "_id",
              as: "author",
            },
          },
          {
            $unwind: "$author",
          },
          {
            $project: {
              "author.password": 0,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
        ])
        .toArray();
  
      return post[0] || null;
    } catch (error) {
      console.error("Error in getPostById:", error);
      return null;
    }
  }

  static async addPost(content, tags, imgUrl, authorId) {
    const post = await db.collection("posts").insertOne({
      content,
      tags,
      imgUrl,
      authorId,
      comments: [],
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      _id: post.insertedId,
      content,
      tags,
      imgUrl,
      authorId,
      comments: [],
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static async commentPost(postId, newComment) {
    try {
      const comment = await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(postId) },
          { $push: { comments: newComment }, $set: { updatedAt: new Date() } }
        );

      const updatedPost = await db.collection("posts").findOne({
        _id: new ObjectId(postId),
      });

      if (!updatedPost) {
        throw new Error("Post not found");
      }

      return updatedPost;
    } catch (err) {
      console.log("🚀 ~ Post ~ commentPost ~ err:", err);
      throw err;
    }
  }

  static async likePost(postId, newLike) {
    try {
      const like = await db
        .collection("posts")
        .updateOne(
          { _id: new ObjectId(postId) },
          { $push: { likes: newLike }, $set: { updatedAt: new Date() } }
        );

      const updatedPost = await db.collection("posts").findOne({
        _id: new ObjectId(postId),
      });

      if (!updatedPost) {
        throw new Error("Post not found");
      }

      return updatedPost;
    } catch (err) {
      console.log("🚀 ~ Post ~ likePost ~ err:", err);
      throw err;
    }
  }
}

module.exports = Post;
