import express from "express";
import AuthRouter from "./routes/auth.route.js";
import UserRouter from "./routes/user.route.js";
import FollowRouter from "./routes/follow.route.js";
import supabase from "./lib/supabase.js";
import FeedRouter from "./routes/feed.route.js";

const app = express();
const port = 3001;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ msg: "test" });
});

app.use("/api/auth", AuthRouter);
app.use("/api/user", UserRouter);
app.use("/api/follow",FollowRouter);
app.use("/api/feed",FeedRouter)

// test koneksi supabase client
app.get("/supabase-storage-test", async (req, res) => {
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    return res.status(500).json({
      status: "FAILED",
      error: error.message,
    });
  }

  res.json({
    status: "OK",
    buckets: data.map((b) => b.name),
  });
});

app.listen(port, () => {
  console.log(`berjalan d http://localhost:${port}`);
});
