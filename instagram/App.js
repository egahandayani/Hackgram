import { SafeAreaProvider } from "react-native-safe-area-context";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "./config/apolloClient";
import { AuthProvider } from "./contexts/auth";
import Navigation from "./components/Navigation";
import Toast from "react-native-toast-message";

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <Navigation />
          <Toast />
        </SafeAreaProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
