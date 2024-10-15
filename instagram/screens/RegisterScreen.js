import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { REGISTER } from "../apollo/usersOperation";
import Toast from "react-native-toast-message";

export default function RegisterScreen({ navigation }) {
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [register, { loading, error, data }] = useMutation(REGISTER);

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f58529" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );

  const handleChange = (name, value) => {
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleRegister = async () => {
    try {
      await register({
        variables: {
          newUser,
        },
      });

      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "You have successfully registered. Please log in.",
      });

      setTimeout(() => {
        navigation.navigate("Login");
      }, 1500);
    } catch (err) {
      console.log("🚀 ~ onPress={ ~ err:", err);

      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error?.message || "Please check your details and try again.",
      });
    }
  };

  return (
    <LinearGradient
      colors={["#f58529", "#dd2a7b", "#8134af", "#515bd4"]}
      style={styles.container}
    >
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={newUser.name}
        onChangeText={(value) => handleChange("name", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={newUser.username}
        onChangeText={(value) => handleChange("username", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={newUser.email}
        onChangeText={(value) => handleChange("email", value)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={newUser.password}
        onChangeText={(value) => handleChange("password", value)}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f58529",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#fff",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
