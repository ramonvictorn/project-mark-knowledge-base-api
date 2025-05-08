import { Express } from "express";
import request from "supertest";
import { User, UserRole } from "../src/models/User";

export const createTestUser = async (
  app: Express,
  role: UserRole = UserRole.Viewer,
  token: string = ""
) => {
  const response = await request(app)
    .post("/v1/users")
    .set("user-id", `${token}`)
    .send({
      name: `Test User ${role}`,
      email: `test@example.com`,
      role,
    });

  return response.body;
};

export const getAuthToken = async (app: Express, user: User) => {
  return user.id;
};
