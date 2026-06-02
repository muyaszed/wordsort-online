import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/api/words", (c) => {
  return c.json({
    words: [
      { id: "1", text: "apple", category: "fruit" },
      { id: "2", text: "carrot", category: "vegetable" },
      { id: "3", text: "banana", category: "fruit" },
      { id: "4", text: "broccoli", category: "vegetable" },
    ],
  });
});

const port = Number(process.env["PORT"] ?? 3001);

serve({ fetch: app.fetch, port }, () => {
  console.log(`API server running at http://localhost:${port}`);
});
