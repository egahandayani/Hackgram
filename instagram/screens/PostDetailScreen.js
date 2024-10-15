import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_COMMENT, GET_POST } from "../apollo/postsOperation";
import { useState } from "react";
import Toast from "react-native-toast-message";

export default function PostDetailScreen({ route }) {
  const { postId } = route.params;

  const [newComment, setNewComment] = useState({
    content: "",
  });

  const [addCommentPost, { loading: mutationLoading, error: mutationError }] =
    useMutation(CREATE_COMMENT, {
      refetchQueries: [{ query: GET_POST, variables: { id: postId } }],
    });

  const handleCommentChange = (value) => {
    setNewComment({
      ...newComment,
      content: value,
    });
  };

  const handleAddComment = () => {
    if (newComment.content.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Comment Failed",
        text2: "Please enter a comment before submitting.",
      });
      return;
    }

    addCommentPost({
      variables: {
        postId: postId,
        comment: newComment,
      },
    })
      .then(() => {
        setNewComment({ content: "" });
      })
      .catch((err) => {
        console.error("Error adding comment:", err);
      });
  };

  const { loading, error, data } = useQuery(GET_POST, {
    variables: {
      id: postId,
    },
  });

  const [modalVisible, setModalVisible] = useState(false);

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

  const formatTags = (tags) => {
    return tags
      .join(",")
      .split(",")
      .map((tag) => `#${tag.trim()}`)
      .join(" ");
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: data.postById.imgUrl }} style={styles.postImage} />
      <View style={styles.interactionContainer}>
        <View style={styles.iconWithText}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <AntDesign name="hearto" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.likes}>{data.postById.likes.length} Likes</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.iconWithText}>
          <TouchableOpacity>
            <FontAwesome name="comment-o" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.comments}>
            {data.postById.comments.length} Comments
          </Text>
        </View>
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Users Who Liked This Post</Text>
            <FlatList
              data={data.postById.likes}
              keyExtractor={(item) => item._id || item.id}
              renderItem={({ item }) => (
                <Text style={styles.modalUser}>{item.username}</Text>
              )}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text> </Text>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.usernameContentContainer}>
        <Text style={styles.username}>{data.postById.author.username}</Text>
        <Text style={styles.content}>{data.postById.content}</Text>
      </View>
      <Text style={styles.tags}>{formatTags(data.postById.tags)}</Text>
      <View style={styles.addCommentContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment.content}
          onChangeText={handleCommentChange}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleAddComment}
          disabled={mutationLoading}
        >
          {mutationLoading ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <FontAwesome name="send-o" size={24} color="black" />
          )}
        </TouchableOpacity>
      </View>

      {mutationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error adding comment: {mutationError.message}
          </Text>
        </View>
      )}

      {data.postById.comments.length > 0 && (
        <View style={styles.commentListContainer}>
          {data.postById.comments.map((comment, index) => (
            <View key={index} style={styles.commentContainer}>
              <Text style={styles.commentUser}>{comment.username}:</Text>
              <Text style={styles.commentContent}>{comment.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  postImage: {
    width: "100%",
    height: 300,
    marginBottom: 16,
    borderRadius: 8,
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
  likes: {
    marginLeft: 8,
    fontWeight: "bold",
    color: "black",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalUser: {
    fontSize: 16,
    paddingVertical: 5,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#f58529",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  comments: {
    marginLeft: 8,
    fontWeight: "bold",
  },
  usernameContentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
    marginRight: 8,
  },
  content: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
  tags: {
    color: "#3498db",
    marginBottom: 16,
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingLeft: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  sendButton: {
    padding: 5,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: "bold",
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentListContainer: {
    marginTop: 16,
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
