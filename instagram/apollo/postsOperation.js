import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query Posts {
    posts {
      _id
      content
      tags
      imgUrl
      authorId
      comments {
        content
        username
      }
      likes {
        username
      }
      createdAt
      updatedAt
      author {
        email
        username
      }
    }
  }
`;

export const GET_POST = gql`
  query PostById($id: String!) {
    postById(_id: $id) {
      _id
      content
      tags
      imgUrl
      authorId
      comments {
        content
        username
        createdAt
        updatedAt
      }
      likes {
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
      author {
        email
        name
        username
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation AddPost($newPost: PostForm) {
    addPost(newPost: $newPost) {
      content
      tags
      imgUrl
      authorId
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation AddCommentPost($postId: String, $comment: CommentForm) {
    addCommentPost(postId: $postId, comment: $comment) {
      content
      tags
      imgUrl
      authorId
      comments {
        content
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_LIKE = gql`
  mutation AddLikePost($postId: String, $like: LikeForm) {
    addLikePost(postId: $postId, like: $like) {
      _id
      content
      tags
      imgUrl
      authorId
      likes {
        username
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;
