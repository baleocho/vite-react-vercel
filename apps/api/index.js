import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Client } from 'pg';
import { json } from 'body-parser';
import http from 'http';
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
            const res = await pgClient.query('SELECT * FROM todos ORDER BY id');
            return res.rows;
        },
    },
    Mutation: {
        addTodo: async (_, { title }) => {
            const res = await pgClient.query('INSERT INTO todos (title, completed) VALUES ($1, false) RETURNING *', [title]);
            return res.rows[0];
        },
    },
};
async function startApolloServer() {
    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });
    await server.start();
    app.use('/', json(), expressMiddleware(server, {
        context: async ({ req }) => ({ token: req.headers.token }), // Example context
    }));
    await new Promise(() => httpServer.listen({ port: 4000 }));
    console.log(`🚀 Server ready at http://localhost:4000/`);
}
startApolloServer();
