import express from "express";
import cors from "cors";
import { User } from "shared";

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // or use '*' for all origins (not recommended for production)
    credentials: true, // if you're using cookies or HTTP auth
  })
);

app.get("/api/user", (req, res) => {
  const user: User = { id: 1, name: "Alice" };
  res.json(user);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
