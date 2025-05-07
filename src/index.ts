import { connectRedis } from "./config/redis";
import { startServer } from "./server";

const main = async () => {
  await connectRedis();
  startServer();
};

main();
