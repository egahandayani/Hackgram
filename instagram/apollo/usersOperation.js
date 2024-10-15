import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      access_token
      user {
        _id
        name
        username
        email
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($newUser: UserForm!) {
    register(newUser: $newUser) {
      message
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($searchKey: String!) {
    searchUsers(searchKey: $searchKey) {
      _id
      name
      username
      email
      followers {
        followerId
      }
      followings {
        followingId
      }
    }
  }
`;

export const GET_USER = gql`
  query UserById($id: String!) {
    userById(_id: $id) {
      _id
      name
      username
      email
      password
      followers {
        _id
        followingId
        followerId
        user {
          _id
          email
          name
        }
        createdAt
        updatedAt
      }
      followings {
        _id
        followingId
        followerId
        user {
          _id
          email
          name
        }
        createdAt
        updatedAt
      }
    }
  }
`;
