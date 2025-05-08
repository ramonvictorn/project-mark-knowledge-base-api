import { BadRequestError, NotFoundError } from "../middleware/route.middleware";
import { ITopic, Topic } from "../models/Topic";
import { topicsRepository } from "../repositories";
import { CreateTopic } from "../repositories/types";
import {
  CreateTopicPayload,
  UpdateTopicPayload,
} from "../routes/v1/validation/topics";

export class TopicService {
  async getAllTopics(): Promise<Topic[]> {
    return topicsRepository.findAllLastVersion();
  }

  async getTopicsTree(topicId: string) {
    const mainParentTopic = await topicsRepository.findLastVersion(topicId);

    if (!mainParentTopic) {
      throw new NotFoundError("Parent topic not found");
    }

    const topics = await topicsRepository.findAll();

    type TreeNode = Partial<ITopic> & { children: TreeNode[] };

    const buildTree = (currentParent: ITopic): TreeNode => {
      const childTopics = topics.filter(
        (topic) =>
          topic.parentTopicId === currentParent.topicId && topic.isLatestVersion
      );

      return {
        ...currentParent,
        children: childTopics.map((child) => buildTree(child)),
      };
    };

    return buildTree(mainParentTopic);
  }

  async getTopicById(
    id: string,
    versionNumber?: number
  ): Promise<Topic | null> {
    if (versionNumber) {
      return topicsRepository.findByVersion(id, versionNumber);
    }

    return topicsRepository.findLastVersion(id);
  }

  async createTopic(topicData: CreateTopicPayload): Promise<ITopic> {
    const topicToCreated = new Topic({
      name: topicData.name,
      content: topicData.content,
    });

    if (topicData.parentTopicId) {
      const parentTopic = await topicsRepository.findLastVersion(
        topicData.parentTopicId
      );

      if (!parentTopic) {
        throw new BadRequestError("Parent topic not found");
      }

      topicToCreated.addParent(parentTopic);
    }

    return topicsRepository.create(topicToCreated);
  }

  async updateTopic(
    topicId: string,
    topicData: UpdateTopicPayload
  ): Promise<Topic | null> {
    const allTopicVersions = await topicsRepository.findTopicVersions(topicId);
    const latestTopic = allTopicVersions?.find(
      (topic) => topic.isLatestVersion
    );

    if (!latestTopic) {
      throw new NotFoundError("Topic not found");
    }

    if (!latestTopic.isLatestVersion) {
      throw new BadRequestError("Topic is not the latest version");
    }

    await topicsRepository.update(latestTopic.versionId, {
      isLatestVersion: false,
    });

    const newTopicData: CreateTopic = {
      name: topicData.name ?? latestTopic.name,
      content: topicData.content ?? latestTopic.content,
      version: latestTopic.version + 1,
      topicId: latestTopic.topicId,
    };

    const currentParentTopicId = latestTopic.parentTopicId;
    const newParentTopicId = topicData.parentTopicId;

    let parentTopicIdToUse: string | null | undefined =
      newParentTopicId ?? currentParentTopicId;
    const removeParentTopicId =
      newParentTopicId === null && !!currentParentTopicId;

    if (removeParentTopicId) {
      parentTopicIdToUse = null;
    }

    const needToReassignVersions = currentParentTopicId !== parentTopicIdToUse;

    if (parentTopicIdToUse) {
      const parentTopic = await topicsRepository.findLastVersion(
        parentTopicIdToUse
      );

      if (!parentTopic) {
        throw new NotFoundError("Parent topic not found");
      }

      newTopicData.parentTopicId = parentTopic.topicId;
      newTopicData.parentVersionId = parentTopic.versionId;
    }

    const newTopic = await topicsRepository.create(newTopicData);

    if (needToReassignVersions) {
      allTopicVersions?.forEach(async (topic) => {
        await topicsRepository.update(topic.versionId, {
          parentTopicId: newTopic.parentTopicId,
          parentVersionId: newTopic.versionId,
        });
      });
    }

    return newTopic;
  }

  async deleteTopic(id: string): Promise<boolean> {
    const topicVersionsToDelete = await topicsRepository.findTopicVersions(id);

    if (!topicVersionsToDelete?.length) {
      throw new NotFoundError("Topic not found");
    }

    const parentOfTopicToDelete = topicVersionsToDelete[0].parentTopicId
      ? await topicsRepository.findLastVersion(
          topicVersionsToDelete[0].parentTopicId
        )
      : null;

    const children = await topicsRepository.findAllChildren(id);

    const newParentChildren = parentOfTopicToDelete ?? children[0];

    const reassignmentQueue: Topic[] = [...children];

    while (reassignmentQueue.length > 0) {
      const topic = reassignmentQueue.shift();

      if (topic) {
        await topicsRepository.update(topic.versionId, {
          parentTopicId: newParentChildren.topicId,
          parentVersionId: newParentChildren.versionId,
        });
      }
    }

    topicVersionsToDelete.forEach(async (topic) => {
      await topicsRepository.delete(topic.versionId);
    });

    return true;
  }

  async findShortestPath(sourceTopicId: string, targetTopicId: string) {
    const topics = await topicsRepository.findAllLastVersion();

    const topicMap = new Map<string, ITopic>();
    topics.forEach((topic) => {
      topicMap.set(topic.topicId, topic);
    });

    const sourceTopic = topicMap.get(sourceTopicId);
    const targetTopic = topicMap.get(targetTopicId);

    if (!sourceTopic || !targetTopic) {
      throw new NotFoundError("Source or target topic not found");
    }

    if (sourceTopicId === targetTopicId) {
      return [sourceTopic];
    }

    if (!sourceTopic.parentTopicId && !targetTopic.parentTopicId) {
      throw new NotFoundError(
        "Source or target without parent topic to be connected"
      );
    }

    const queue: { topic: ITopic; path: ITopic[] }[] = [];
    const visited = new Set<string>();

    queue.push({ topic: sourceTopic, path: [sourceTopic] });
    visited.add(sourceTopicId);

    while (queue.length > 0) {
      const { topic, path } = queue.shift()!;

      const topicsToVerify: ITopic[] = [];

      if (topic.parentTopicId) {
        const parent = topicMap.get(topic.parentTopicId);
        if (parent) {
          topicsToVerify.push(parent);
        }
      }

      const children = topics.filter((t) => t.parentTopicId === topic.topicId);
      topicsToVerify.push(...children);

      for (const nextTopic of topicsToVerify) {
        if (nextTopic.topicId === targetTopicId) {
          return [...path, nextTopic];
        }

        if (!visited.has(nextTopic.topicId)) {
          visited.add(nextTopic.topicId);
          queue.push({ topic: nextTopic, path: [...path, nextTopic] });
        }
      }
    }

    throw new NotFoundError("No path found between source and target topics");
  }
}
