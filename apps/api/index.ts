import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Client } from 'pg';
import bodyParser from 'body-parser';
import 'dotenv/config';

console.log('process.env.DATABASE_URL', process.env.DATABASE_URL)
const app = express();
app.use(bodyParser.json());

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
    addTodo: async (_: any, { title }: any) => {
      const res = await pgClient.query(
        'INSERT INTO todos (title, completed) VALUES ($1, false) RETURNING *',
        [title]
      );
      return res.rows[0];
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

async function start() {
  await server.start();
  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(server) as unknown as import('express').RequestHandler
  );
  app.listen(3000, () => {
    console.log('🚀 Server ready at http://localhost:3000/graphql');
  });
}

start();

// async function startApolloServer() {
//   const app = express();
//   //const httpServer = http.createServer(app);

//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });

//   await server.start();

//   app.use(
//     '/graphql',
//     bodyParser.json(),
//     expressMiddleware(server) as unknown as import('express').RequestHandler
//   );

//   app.listen(3000, () => {
//     console.log('🚀 Server ready at http://localhost:3000/graphql');
//   });
// }
// startApolloServer();