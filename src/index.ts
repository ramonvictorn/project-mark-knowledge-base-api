import express from "express";
import { connectRedis } from "./config/redis";
import routes from "./routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

connectRedis().catch(console.error);

app.get("/", (req, res) => {
  res.send("Knowledge Base API is running!");
});

app.use("/", routes);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
