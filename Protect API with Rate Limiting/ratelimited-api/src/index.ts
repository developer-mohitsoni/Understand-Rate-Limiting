import { Hono } from "hono";

const app = new Hono();

app.get("/todos", (c) => {
  return c.json({ todos: ["Buy milk", "Walk the dog", "Do laundry"] });
});

export default app;
