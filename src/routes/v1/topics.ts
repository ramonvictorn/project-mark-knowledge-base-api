import express, { Request, Response } from "express";
import { topicService } from "../../services";
import { ErrorResponse, TopicResponse } from "./topics.types";
import { isAuthorizedUser } from "../../middleware/authorization.middleware";
import {
  CreateTopicPayload,
  createTopicSchema,
  UpdateTopicPayload,
  updateTopicSchema,
} from "./validation/topics";
import { validateData } from "../../middleware/validation.middleware";
import { NotFoundError } from "../../middleware/route.middleware";

const router = express.Router();

router.get(
  "/",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    const topics = await topicService.getAllTopics();
    res.json(topics);
  }
);

router.get(
  "/:id/tree",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    const topics = await topicService.getTopicsTree(req.params.id);
    res.json(topics);
  }
);

router.get(
  "/:sourceId/shortest-path/:targetId",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    const path = await topicService.findShortestPath(
      req.params.sourceId,
      req.params.targetId
    );
    res.json(path);
  }
);

router.get(
  "/:id",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    const version = req.query.version
      ? parseInt(req.query.version as string)
      : undefined;

    const topic = await topicService.getTopicById(req.params.id, version);

    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    res.json(topic);
  }
);

router.post(
  "/",
  validateData(createTopicSchema),
  isAuthorizedUser("WRITE"),
  async (
    req: Request<object, TopicResponse, CreateTopicPayload>,
    res: Response
  ) => {
    const newTopic = await topicService.createTopic(req.body);
    res.status(201).json(newTopic);
  }
);

router.patch(
  "/:id",
  validateData(updateTopicSchema),
  isAuthorizedUser("WRITE"),
  async (
    req: Request<{ id: string }, TopicResponse, UpdateTopicPayload>,
    res: Response
  ) => {
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
  }
);

router.delete(
  "/:id",
  isAuthorizedUser("DELETE"),
  async (req: Request, res: Response) => {
    const success = await topicService.deleteTopic(req.params.id);
    if (!success) {
      const errorResponse: ErrorResponse = {
        error: "Topic not found",
      };
      res.status(404).json(errorResponse);
      return;
    }

    res.status(204).send();
  }
);

export default router;
