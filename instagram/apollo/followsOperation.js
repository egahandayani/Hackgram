import { gql } from "@apollo/client";

export const FOLLOW_USER = gql`
  mutation FollowUser($followingId: String) {
    followUser(followingId: $followingId) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
    }
  }
`;
