const jwt = require("jsonwebtoken");
const conectarDB = require("./config/db");

//Conectar a la base de datos

conectarDB();

//configuracion server apollo
const { ApolloServer } = require("apollo-server");
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");

//servidor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers["authorization"] || "";
    if (token) {
      try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET);
        // console.log(usuario);
        return { usuario };
      } catch (error) {
        console.log(error);
      }
    }
  },
});

//Arrancar el servidor
server.listen().then(({ url }) => {
  console.log(`Server ready on url ${url}`);
});
