import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { Client } from "pg";
import bodyParser from "body-parser";
import "dotenv/config";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: "*", // Allow all origins for development; adjust as needed for production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// PostgreSQL (Neon)
const pgClient = new Client({
    connectionString: process.env.DATABASE_URL,
});
pgClient.connect();
// GraphQL typeDefs + resolvers
const typeDefs = `#graphql
  type Todo {
    id: ID!
    title: String!
    completed: Boolean!
  }

  type Query {
    todos: [Todo!]!
  }

  type Mutation {
    addTodo(title: String!): Todo
  }
`;
const resolvers = {
    Query: {
        todos: async () => {
            const res = await pgClient.query("SELECT * FROM todos ORDER BY id");
            return res.rows;
        },
    },
    Mutation: {
        addTodo: async (_, { title }) => {
            const res = await pgClient.query("INSERT INTO todos (title, completed) VALUES ($1, false) RETURNING *", [title]);
            return res.rows[0];
        },
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
await server.start();
app.use(express.static(path.join(__dirname, "dist")));
app.use("/graphql", bodyParser.json(), expressMiddleware(server));
app.listen(PORT, () => {
    console.log(`Front end at http://localhost:${PORT}/`);
    console.log(`GraphQL server ready at http://localhost:${PORT}/graphql`);
});
