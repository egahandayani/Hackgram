import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import PostDetailScreen from "../screens/PostDetailScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import CreatePostScreen from "../screens/CreatePostScreen";
import SearchScreen from "../screens/SearchScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/auth";
import { getItemAsync } from "expo-secure-store";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Create Post") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF6347",
        tabBarInactiveTintColor: "#gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Create Post" component={CreatePostScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const authContext = useContext(AuthContext);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await getItemAsync("access_token");
      const user = await getItemAsync("user"); 
      if (token) {
        authContext.setIsSignedIn(true);
        if (user) {
          authContext.setUser(JSON.parse(user));
        }
      }
      setReady(true);
    };

    checkAuthentication();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {authContext.isSignedIn ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{
                title: "Home",
                headerShown: false,
              }}
            />
            <Stack.Screen name="Post Detail" component={PostDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
});
