import { useMutation } from "@apollo/client";
import { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import { CREATE_POST } from "../apollo/postsOperation";

export default function CreatePostScreen({ navigation }) {
  const [newPost, setNewPost] = useState({
    content: "",
    tags: "",
    imgUrl: "",
  });

  const [createPost, { loading, error, data }] = useMutation(CREATE_POST, {
    refetchQueries: ["Posts"],
  });

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
        <Text style={styles.errorText}>Error create post: {error.message}</Text>
      </View>
    );
  }

  const handleChange = (name, value) => {
    setNewPost({
      ...newPost,
      [name]: value,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Post Content</Text>
      <TextInput
        style={styles.largeInput}
        placeholder="What's on your mind?"
        value={newPost.content}
        onChangeText={(value) => handleChange("content", value)}
      />

      <Text style={styles.label}>Tags</Text>
      <TextInput
        style={styles.input}
        placeholder="ex. beach"
        value={newPost.tags}
        onChangeText={(value) => handleChange("tags", value)}
      />

      <Text style={styles.label}>Image URL</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter image URL"
        value={newPost.imgUrl}
        onChangeText={(value) => handleChange("imgUrl", value)}
      />

      <Button
        title="Post"
        onPress={async () => {
          console.log(newPost, "<<<<<<<<<<<< newPost");
          await createPost({
            variables: {
              newPost,
            },
          });
          navigation.navigate("Home");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  largeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    height: 100,
    fontSize: 18,
    borderRadius: 8,
    marginBottom: 16,
    textAlignVertical: "top",
  },
});
