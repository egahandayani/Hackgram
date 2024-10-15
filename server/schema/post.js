const Post = require("../models/Post");
const auth = require("../middlewares/auth");
const { ObjectId } = require("mongodb");
const Redis = require("ioredis");
const db = require("../config/mongodb");

const { REDIS_HOST, REDIS_PORT, REDIS_USER, REDIS_PASS } = process.env;
const redis = new Redis({
  port: REDIS_PORT,
  host: REDIS_HOST,
  family: 4,
  password: REDIS_PASS,
  db: 0,
});

const postTypeDefs = `#graphql
    type Post {
        _id: String!
        content: String!
        tags: [String]
        imgUrl: String
        authorId: String!
        comments: [Comment]
        likes: [Like]
        createdAt: String
        updatedAt: String
        author: User
    }

    type Comment {
        content: String!
        username: String!
        createdAt: String
        updatedAt: String
    }

    type Like {
        username: String!
        createdAt: String
        updatedAt: String
    }

    type Query {
        posts: [Post]
        postById(_id: String!): Post!
    }

    input PostForm {
        content: String
        tags: [String]
        imgUrl: String
    }

    input CommentForm {
      content: String
    }

    input LikeForm {
      username: String
    }

    type Mutation {
        addPost(newPost: PostForm): Post!
        addCommentPost(postId: String, comment: CommentForm): Post!
        addLikePost(postId: String, like: LikeForm): Post!
    }
`;

const postResolvers = {
  Query: {
    posts: async (parent, args, contextValue, info) => {
      try {
        await contextValue.auth();

        const cache = await redis.get("posts");
        if (cache) {
          console.log("Data from cache");
          return JSON.parse(cache);
        }

        const posts = await Post.getPosts();
        console.log("Data from database");
        await redis.set("posts", JSON.stringify(posts));

        return posts;
      } catch (err) {
        console.log("🚀 ~ posts: ~ err:", err);
        throw err;
      }
    },
    postById: async (parent, args, contextValue, info) => {
      try {
        const { _id } = args;
        console.log("🚀 ~ postById ~ _id:", _id);

        const user = await contextValue.auth();
        args.authorId = user._id;

        const post = await Post.getPostById(new ObjectId(_id));
        console.log(post, "<<<<<<<<<<<<<<");

        if (!post) throw new Error("Post not found");
        return post;
      } catch (err) {
        console.log("🚀 ~ postById: ~ err:", err);
        throw err;
      }
    },
  },

  Mutation: {
    addPost: async (parent, args, contextValue, info) => {
      try {
        const user = await contextValue.auth();
        let { content, tags, imgUrl, authorId } = args.newPost;
        authorId = user._id;
        const post = await Post.addPost(content, tags, imgUrl, authorId);
        await redis.del("posts");
        return post;
      } catch (err) {
        console.log("🚀 ~ addPost: ~ err:", err);
        throw err;
      }
    },

    addCommentPost: async (parent, args, contextValue, info) => {
      try {
        const { postId, comment } = args;
        const user = await contextValue.auth();

        const newComment = {
          content: comment.content,
          username: user.username,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedPost = await Post.commentPost(postId, newComment);
        return updatedPost;
      } catch (err) {
        console.log("🚀 ~ addCommentPost: ~ err:", err);
        throw err;
      }
    },

    addLikePost: async (parent, args, contextValue, info) => {
      try {
        const { postId, like } = args;
        const user = await contextValue.auth();

        const post = await Post.getPostById(postId);

        if (!post) {
          throw new Error("Post not found");
        }

        const existingLike = post.likes.find(
          (like) => like.username === user.username
        );

        const objectId = new ObjectId(postId);

        if (existingLike) {
          await db
            .collection("posts")
            .updateOne(
              { _id: objectId },
              { $pull: { likes: { username: user.username } } }
            );
          return { ...post, message: "Post unliked successfully" };
        } else {
          const newLike = {
            username: like.username || user.username,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await db
            .collection("posts")
            .updateOne({ _id: objectId }, { $push: { likes: newLike } });
          return { ...post, message: "Post liked successfully" };
        }
      } catch (err) {
        console.log("🚀 ~ addLikePost:async ~ err:", err);
        throw err;
      }
    },
  },
};

module.exports = { postTypeDefs, postResolvers };
