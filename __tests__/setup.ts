import { redisClient } from "../src/config/redis";

beforeAll(async () => {
  await redisClient.connect();
});

afterAll(async () => {
  await redisClient.quit();
});

afterEach(async () => {
  await redisClient.flushAll();
});
