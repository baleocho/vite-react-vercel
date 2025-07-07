import { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}
const isDev = import.meta.env.NODE_ENV === "development";
const API_URL = isDev ? "http://localhost:3000/graphql" : "/api/graphql";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `{ todos { id title completed } }` }),
      });
      const json = await res.json();
      setTodos(json.data.todos);
    } catch (error) {
      console.error("Error fetching todos:", error);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Neon + Express Apollo + Vercel</h1>
      {loading ? (
        <p>Loading todos...</p>
      ) : todos.length === 0 && !loading ? (
        <p>No todos found</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.title} {todo.completed ? "✅" : ""}
            </li>
          ))}
        </ul>
      )}
      <button onClick={fetchTodos} style={{ marginTop: "1rem" }}>
        {loading ? "Refreshing Todos..." : "Refresh Todos"}
      </button>
    </div>
  );
}

export default App;
