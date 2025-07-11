import { useEffect, useState } from "react";

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}
const isDev = import.meta.env.VITE_APP_ENV === "development";
const API_URL = isDev ? "http://localhost:3000/graphql" : "/graphql";

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

  const handleAddTodo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const completed = formData.get("completed") === "on";
    console.log("first", title);
    console.log("first", completed);

    // setLoading(true);
    // try {
    //   const res = await fetch(API_URL, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ query: `{ todos { id title completed } }` }),
    //   });
    //   const json = await res.json();
    //   setTodos(json.data.todos);
    // } catch (error) {
    //   console.error("Error fetching todos:", error);
    //   setTodos([]);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Neon + Express Apollo + Vercel</h1>
      <h4 className="m-0 p-0">API_URL {API_URL}</h4>
      <h4 className="m-0 p-0">Environment: {import.meta.env.VITE_APP_ENV}</h4>
      <div className="d-flex gap-1 mt-2">
        <div className="col-12 col-md-6 h-100">
          <div className="card">
            <div className="d-flex flex-column gap-1">
              <h5>My tasks</h5>
              {loading ? (
                <p>Loading todos...</p>
              ) : todos.length === 0 && !loading ? (
                <p>No todos found</p>
              ) : (
                <ul>
                  {todos.map((todo) => (
                    <li key={todo.id}>
                      {todo.title} {todo.completed ? "✅" : "❌"}
                    </li>
                  ))}
                </ul>
              )}
              <button className="mt-auto" onClick={fetchTodos}>
                {loading ? "Refreshing Todos..." : "Refresh Todos"}
              </button>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTodo(e);
              }}
              className="d-flex flex-column gap-1 h-100"
            >
              <h5>Add new task</h5>

              <input required type="text" placeholder="tasks title" name="title" style={{borderRadius: "0.25rem", padding: "0.5rem"}} />
              <div>
                <input type="checkbox" name="completed" />
                <span> Completed</span>
              </div>
              <button type="submit" className="mt-auto">
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
