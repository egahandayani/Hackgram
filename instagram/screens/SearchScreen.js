import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SEARCH_USERS } from "../apollo/usersOperation";
import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import Toast from "react-native-toast-message";
import { FOLLOW_USER } from "../apollo/followsOperation";

export default function SearchScreen() {
  const [searchKey, setSearchKey] = useState("");
  const [followStatus, setFollowStatus] = useState({});

  const { loading, error, data, refetch } = useQuery(SEARCH_USERS, {
    variables: { searchKey },
    skip: !searchKey,
  });

  const [followUser] = useMutation(FOLLOW_USER, {
    onCompleted: (data) => {
      console.log("Followed user successfully:", data);
      Toast.show({
        type: "success",
        text1: "Followed",
        text2: "You are now following the user.",
      });
    },
    onError: (err) => {
      console.log("Error following user:", err);
      Toast.show({
        type: "error",
        text1: "Follow Failed",
        text2: err.message,
      });
    },
  });

  const handleSearchChange = (text) => {
    setSearchKey(text);
    refetch();
  };

  const handleFollowUser = (userId) => {
    followUser({
      variables: { followingId: userId },
    }).then(() => {
      setFollowStatus((prevState) => ({
        ...prevState,
        [userId]: true,
      }));
    });
  };

  const renderUserItem = ({ item }) => {
    const isFollowed = followStatus[item._id];

    return (
      <View style={styles.userItem}>
        <Text style={styles.userName}>{item.username}</Text>
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowed ? styles.followedButton : styles.notFollowedButton,
          ]}
          onPress={() => handleFollowUser(item._id)}
        >
          <Text style={styles.followButtonText}>
            {isFollowed ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by username or name"
        value={searchKey}
        onChangeText={handleSearchChange}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
        </View>
      )}

      {data && (
        <FlatList
          data={data.searchUsers}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderUserItem}
        />
      )}

      {!loading &&
        !error &&
        !data?.searchUsers?.length &&
        searchKey.length > 0 && (
          <View style={styles.noResultContainer}>
            <Text style={styles.noResultText}>No users found</Text>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  userName: {
    fontSize: 16,
  },
  followButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
  },
  followButtonText: {
    color: "#fff",
  },
  followedButton: {
    backgroundColor: "#2ecc71",
  },
  notFollowedButton: {
    backgroundColor: "#3498db",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  noResultContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  noResultText: {
    fontSize: 16,
    color: "#888",
  },
});
