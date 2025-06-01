import express from "express";
import { User } from "shared";

const app = express();
const port = 3000;

app.get("/api/user", (req, res) => {
  const user: User = { id: 1, name: "Alice" };
  res.json(user);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
