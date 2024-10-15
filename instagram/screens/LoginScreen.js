import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/auth";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../apollo/usersOperation";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen({ navigation }) {
  const authContext = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { loading }] = useMutation(LOGIN);

  let [fonts] = useFonts({
    Billabong: require("../assets/fonts/Billabong.otf"),
  });

  if (!fonts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f58529" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  return (
    <LinearGradient
      colors={["#f58529", "#dd2a7b", "#8134af", "#515bd4"]}
      style={styles.container}
    >
      <Text style={[styles.title, { fontFamily: "Billabong" }]}>Instagram</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          if (!username || !password) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Username or password cannot be empty!",
            });
            return;
          }
          try {
            const { data } = await login({
              variables: {
                username,
                password,
              },
            });
            console.log(data.login.access_token);
            console.log(data.login.user, "<<<<<<<<< userId");
            await SecureStore.setItemAsync(
              "access_token",
              data.login.access_token
            );
            await SecureStore.setItemAsync("user", JSON.stringify(data.login.user));
            authContext.setIsSignedIn(true);
            authContext.setUser(data.login.user);
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Login successful!",
            });
          } catch (err) {
            console.log("🚀 ~ onPress={ ~ err:", err);
            Toast.show({
              type: "error",
              text1: "Login Failed",
              text2: "Invalid username or password.",
            });
          }
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Register here</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 48,
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: "#fff",
  },
  registerLink: {
    fontSize: 16,
    color: "#3498db",
    fontWeight: "bold",
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
