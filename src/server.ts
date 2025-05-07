import express from "express";
import routes from "./routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Knowledge Base API is running!");
});

app.use("/", routes);

export const startServer = () => {
  app.listen(port, () => {
    return console.log(`Listening at http://localhost:${port}`);
  });
};
