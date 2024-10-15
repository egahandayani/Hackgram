// import { ApolloClient, InMemoryCache } from "@apollo/client";
// import { APOLLO_URI } from "@env";

// const apolloClient = new ApolloClient({
//   uri: APOLLO_URI,
//   cache: new InMemoryCache(),
// });

import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
// import { APOLLO_URI } from "@env";
import { getItemAsync } from "expo-secure-store";

const httpLink = createHttpLink({
  uri: "http://52.77.219.38/",
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getItemAsync("access_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default apolloClient;
