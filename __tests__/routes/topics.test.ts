import request from "supertest";
import { app } from "../../src/server";
import { createTestUser, getAuthToken } from "../helpers";
import { UserRole } from "../../src/models/User";

describe("Topic Routes", () => {
  let adminToken: string;
  let editorToken: string;
  let viewerToken: string;

  beforeEach(async () => {
    const admin = await createTestUser(app, UserRole.Admin);
    adminToken = await getAuthToken(app, admin);

    const editor = await createTestUser(app, UserRole.Editor, adminToken);
    const viewer = await createTestUser(app, UserRole.Viewer, adminToken);

    editorToken = await getAuthToken(app, editor);
    viewerToken = await getAuthToken(app, viewer);
  });

  describe("POST /v1/topics", () => {
    it("should create a new topic", async () => {
      const topicData = {
        name: "React Topic",
        content: "React Content",
      };

      const response = await request(app)
        .post("/v1/topics")
        .set("user-id", `${editorToken}`)
        .send(topicData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("topicId");
      expect(response.body.name).toBe(topicData.name);
    });

    it("should not allow viewers to create topics", async () => {
      const topicData = {
        name: "Test Topic",
        content: "Test Content",
      };

      const response = await request(app)
        .post("/v1/topics")
        .set("user-id", `${viewerToken}`)
        .send(topicData);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /v1/topics", () => {
    it("should return all topics", async () => {
      const topicData = {
        name: "Test Topic",
        content: "Test Content",
      };

      await request(app)
        .post("/v1/topics")
        .set("user-id", `${editorToken}`)
        .send(topicData);
      await request(app)
        .post("/v1/topics")
        .set("user-id", `${editorToken}`)
        .send(topicData);

      const response = await request(app)
        .get("/v1/topics")
        .set("user-id", `${viewerToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it("should return 401 when user is not authenticated", async () => {
      const response = await request(app).get("/v1/topics");

      expect(response.status).toBe(401);
    });

    it("should return 401 when user is not authenticated with a valid token", async () => {
      const response = await request(app)
        .get("/v1/topics")
        .set("user-id", `some-invalid-user-id`);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /v1/topics/:id", () => {
    it("should return a topic by id", async () => {
      const topicData = {
        name: "Test Topic",
        content: "Test Content",
      };

      const createResponse = await request(app)
        .post("/v1/topics")
        .set("user-id", `${editorToken}`)
        .send(topicData);

      const topicId = createResponse.body.topicId;

      const response = await request(app)
        .get(`/v1/topics/${topicId}`)
        .set("user-id", `${viewerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.topicId).toBe(topicId);
    });

    it("should return 404 for non-existent topic", async () => {
      const response = await request(app)
        .get("/v1/topics/non-existent-id")
        .set("user-id", `${viewerToken}`);

      expect(response.status).toBe(404);
    });
  });
});
