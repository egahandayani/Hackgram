const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { userTypeDefs, userResolvers } = require("./schema/user");
const { postTypeDefs, postResolvers } = require("./schema/post");
const { followTypeDefs, followResolvers } = require("./schema/follow");
const auth = require("./middlewares/auth");

const server = new ApolloServer({
  typeDefs: [userTypeDefs, postTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postResolvers, followResolvers],
  introspection: true,
});

startStandaloneServer(server, {
  listen: { port: process.env.PORT || 3000 },

  context: ({ req, res }) => {
    return {
      auth: async () => await auth(req),
    };
  },
}).then(({ url }) => {
  console.log(`🚀  Server ready at: ${url}`);
});
