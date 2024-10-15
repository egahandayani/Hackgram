import { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../contexts/auth";
import { deleteItemAsync } from "expo-secure-store";
import { GET_USER } from "../apollo/usersOperation";
import { useQuery } from "@apollo/client";

const renderFollowerItem = ({ item }) => (
  <View style={styles.followerItem}>
    <Text style={styles.followerName}>{item.user.name}</Text>
  </View>
);

const renderFollowingItem = ({ item }) => (
  <View style={styles.followingItem}>
    <Text style={styles.followingName}>{item.user.name}</Text>
  </View>
);

export default function ProfileScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const userId = authContext?.user._id;

  const { loading, error, data } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  const userProfile = data?.userById;

  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{userProfile.name}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile.followers?.length}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile.followings?.length}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Followers</Text>
      <FlatList
        data={userProfile.followers}
        keyExtractor={(item) => item._id}
        renderItem={renderFollowerItem}
      />

      <Text style={styles.sectionTitle}>Following</Text>
      <FlatList
        data={userProfile.followings}
        keyExtractor={(item) => item._id}
        renderItem={renderFollowingItem}
      />

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.logoutButton}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.logoutButtonModal}
                onPress={async () => {
                  await deleteItemAsync("access_token");
                  authContext.setIsSignedIn(false);
                }}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButtonModal}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  followerItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  followerName: {
    fontSize: 16,
  },
  followingItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  followingName: {
    fontSize: 16,
  },
  logoutButton: {
    marginVertical: 16,
    padding: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
  },
  logoutButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  modalText: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  logoutButtonModal: {
    flex: 1,
    marginRight: 5,
    padding: 10,
    backgroundColor: "#f44336",
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButtonModal: {
    flex: 1,
    marginLeft: 5,
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
