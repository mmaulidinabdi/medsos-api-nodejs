import express from "express";
import AuthRouter from "./routes/auth.route.js";

const app = express();
const port = 3001;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ msg: "test" });
});

app.use("/api/auth", AuthRouter);

app.listen(port, () => {
  console.log(`berjalan d http://localhost:${port}`);
});
