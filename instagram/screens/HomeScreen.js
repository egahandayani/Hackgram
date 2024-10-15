import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_LIKE, GET_POSTS } from "../apollo/postsOperation";
import { useEffect, useState } from "react";

const profileIcon = require("../assets/profile.jpg");

export default function HomeScreen({ navigation }) {
  const { loading, error, data } = useQuery(GET_POSTS);
  const [addLikePost] = useMutation(CREATE_LIKE);

  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    if (data && data.posts) {
      const initialLikedPosts = {};
      data.posts.forEach((post) => {
        initialLikedPosts[post._id] = post.likes.some(
          (like) => like.username == "currentUser"
        );
      });
      setLikedPosts(initialLikedPosts);
    }
  }, [data]);

  const handleLikePost = async (postId) => {
    try {
      const currentLiked = likedPosts[postId];
      await addLikePost({
        variables: {
          postId: postId,
          like: {},
        },
      });

      setLikedPosts((prevLikedPosts) => ({
        ...prevLikedPosts,
        [postId]: !currentLiked,
      }));

      const updatedPosts = data.posts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            likes: currentLiked
              ? post.likes.filter((like) => like.username !== "currentUser")
              : [...post.likes, { username: "currentUser" }],
          };
        }
        return post;
      });
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f58529" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error fetching posts: {error.message}
        </Text>
      </View>
    );
  }

  if (!data || !data.posts) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No posts found.</Text>
      </View>
    );
  }

  const formatTags = (tags) => {
    return tags
      .join(",")
      .split(",")
      .map((tag) => `#${tag.trim()}`)
      .join(" ");
  };

  const renderPost = ({ item }) => (
    <View key={item._id} style={styles.postContainer}>
      <View style={styles.userInfoContainer}>
        <Image source={profileIcon} style={styles.profileImage} />
        <Text style={styles.username}>{item.author.username}</Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Post Detail", { postId: item._id })}
        onLongPress={() => handleLikePost(item._id)}
      >
        <Image source={{ uri: item.imgUrl }} style={styles.postImage} />
      </TouchableOpacity>
      <View style={styles.interactionContainer}>
        <View style={styles.iconWithText}>
          <TouchableOpacity onPress={() => handleLikePost(item._id)}>
            <AntDesign
              name={likedPosts[item._id] ? "heart" : "hearto"}
              color="red"
              size={24}
            />
          </TouchableOpacity>
          <Text style={styles.likes}>{item.likes.length} Likes</Text>
        </View>
        <View style={styles.iconWithText}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Post Detail", { postId: item._id })
            }
          >
            <FontAwesome name="comment-o" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.comments}>{item.comments.length} Comments</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      <Text style={styles.tags}>{formatTags(item.tags)}</Text>
    </View>
  );

  return (
    <FlatList
      data={data.posts}
      keyExtractor={(item) => item._id}
      renderItem={renderPost}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  postContainer: {
    marginBottom: 24,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: 300,
    marginBottom: 8,
    borderRadius: 8,
  },
  content: {
    fontSize: 16,
    marginBottom: 4,
  },
  tags: {
    color: "#3498db",
    marginBottom: 8,
  },
  commentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likes: {
    marginLeft: 8,
    fontWeight: "bold",
  },
  comments: {
    marginLeft: 8,
    fontWeight: "bold",
  },
  interactionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconWithText: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f58529",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e74c3c",
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
  },
});
