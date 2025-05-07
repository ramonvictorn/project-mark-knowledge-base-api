import express, { Request, Response, RequestHandler } from "express";
import { topicService } from "../../services";
import {
  CreateTopicPayload,
  UpdateTopicPayload,
  ErrorResponse,
  TopicResponse,
} from "./topics.types";
import { isAuthorizedUser } from "../../middleware/authorization.middleware";

const router = express.Router();

router.get(
  "/",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    try {
      const topics = await topicService.getAllTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      const errorResponse: ErrorResponse = {
        error: "Failed to fetch topics",
      };
      res.status(500).json(errorResponse);
    }
  }
);

router.get(
  "/:id/tree",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    try {
      const topics = await topicService.getTopicsTree(req.params.id);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      const errorResponse: ErrorResponse = {
        error: "Failed to fetch topics",
      };
      res.status(500).json(errorResponse);
    }
  }
);

router.get(
  "/:sourceId/shortest-path/:targetId",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    try {
      const path = await topicService.findShortestPath(
        req.params.sourceId,
        req.params.targetId
      );
      res.json(path);
    } catch (error) {
      console.error("Error fetching shortest path:", error);
      const errorResponse: ErrorResponse = {
        error: "Failed to fetch shortest path",
      };
      res.status(500).json(errorResponse);
    }
  }
);

router.get("/:id", isAuthorizedUser("READ"), (async (
  req: Request,
  res: Response
) => {
  try {
    const version = req.query.version
      ? parseInt(req.query.version as string)
      : undefined;
    const topic = await topicService.getTopicById(req.params.id, version);
    if (!topic) {
      const errorResponse: ErrorResponse = {
        error: "Topic not found",
      };
      return res.status(404).json(errorResponse);
    }
    res.json(topic);
  } catch (error) {
    console.error("Error fetching topic:", error);
    const errorResponse: ErrorResponse = {
      error: "Failed to fetch topic",
    };
    res.status(500).json(errorResponse);
  }
}) as RequestHandler);

router.post(
  "/",
  isAuthorizedUser("WRITE"),
  async (
    req: Request<object, TopicResponse, CreateTopicPayload>,
    res: Response
  ) => {
    try {
      const newTopic = await topicService.createTopic(req.body);
      res.status(201).json(newTopic);
    } catch (error) {
      console.error("Error creating topic:", error);
      const errorResponse: ErrorResponse = {
        error: "Failed to create topic",
      };
      res.status(500).json(errorResponse);
    }
  }
);

router.patch(
  "/:id",
  isAuthorizedUser("WRITE"),
  async (
    req: Request<{ id: string }, TopicResponse, UpdateTopicPayload>,
    res: Response
  ) => {
    try {
      const updatedTopic = await topicService.updateTopic(
        req.params.id,
        req.body
      );

      if (!updatedTopic) {
        const errorResponse: ErrorResponse = {
          error: "Topic not found",
        };
        res.status(404).json(errorResponse);
        return;
      }

      res.json(updatedTopic);
    } catch (error) {
      console.error("Error updating topic:", error);
      const errorResponse: ErrorResponse = {
        error: "Failed to update topic",
      };
      res.status(500).json(errorResponse);
    }
  }
);

router.delete(
  "/:id",
  isAuthorizedUser("DELETE"),
  async (req: Request, res: Response) => {
    try {
      const success = await topicService.deleteTopic(req.params.id);
      if (!success) {
        const errorResponse: ErrorResponse = {
          error: "Topic not found",
        };
        res.status(404).json(errorResponse);
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting topic:", error);
      const errorResponse: ErrorResponse = {
        error: "Failed to delete topic",
      };
      res.status(500).json(errorResponse);
    }
  }
);

export default router;
