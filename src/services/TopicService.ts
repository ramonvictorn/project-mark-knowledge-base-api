import { Topic } from "../models/Topic";
import { topicsRepository } from "../repositories";
import { CreateTopic } from "../repositories/types";
import {
  CreateTopicPayload,
  UpdateTopicPayload,
} from "../routes/v1/topics.types";

export class TopicService {
  async getAllTopics(): Promise<Topic[]> {
    return topicsRepository.findAllLastVersion();
  }

  async getTopicsTree(topicId: string) {
    const mainParentTopic = await topicsRepository.findLastVersion(topicId);

    if (!mainParentTopic) {
      throw new Error("Parent topic not found");
    }

    const topics = await topicsRepository.findAll();

    type TreeNode = Partial<Topic> & { children: TreeNode[] };

    const buildTree = (currentParent: Topic): TreeNode => {
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

  async getTopicById(id: string, versionNumber?: number): Promise<Topic | null> {
    if (versionNumber) {
      return topicsRepository.findByVersion(id, versionNumber);
    }

    return topicsRepository.findLastVersion(id);
  }

  async createTopic(topicData: CreateTopicPayload): Promise<Topic> {
    const createTopicData: CreateTopic = {
      name: topicData.name,
      content: topicData.content,
    };

    if (topicData.parentTopicId) {
      const parentTopic = await topicsRepository.findLastVersion(
        topicData.parentTopicId
      );

      if (!parentTopic) {
        throw new Error("Parent topic not found");
      }

      createTopicData.parentTopicId = parentTopic.topicId;
      createTopicData.parentVersionId = parentTopic.versionId;
    }

    return topicsRepository.create(createTopicData);
  }

  async updateTopic(
    topicId: string,
    topicData: UpdateTopicPayload
  ): Promise<Topic | null> {
    const latestTopic = await topicsRepository.findLastVersion(topicId);
    // TODO: return error if topic is not found
    if (!latestTopic) {
      return null;
    }

    if (!latestTopic.isLatestVersion) {
      return null;
    }

    const updatedExistingTopic = {
      ...latestTopic,
      isLatestVersion: false,
    };

    await topicsRepository.update(latestTopic.versionId, updatedExistingTopic);

    const newTopicData: CreateTopic = {
      name: topicData.name ?? latestTopic.name,
      content: topicData.content ?? latestTopic.content,
      version: latestTopic.version + 1,
      topicId: latestTopic.topicId,
    };

    const parentTopicId = topicData.parentTopicId ?? latestTopic.parentTopicId;
    if (parentTopicId) {
      const parentTopic = await topicsRepository.findLastVersion(parentTopicId);

      if (!parentTopic) {
        throw new Error("Parent topic not found");
      }

      newTopicData.parentTopicId = parentTopic.topicId;
      newTopicData.parentVersionId = parentTopic.versionId;
    }

    const newTopic = await topicsRepository.create(newTopicData);

    return newTopic;
  }

  async deleteTopic(id: string): Promise<boolean> {
    return topicsRepository.delete(id);
  }

  async findShortestPath(sourceTopicId: string, targetTopicId: string) {
    const topics = await topicsRepository.findAllLastVersion();

    const topicMap = new Map<string, Topic>();
    topics.forEach((topic) => {
      topicMap.set(topic.topicId, topic);
    });

    const sourceTopic = topicMap.get(sourceTopicId);
    const targetTopic = topicMap.get(targetTopicId);

    if (!sourceTopic || !targetTopic) {
      throw new Error("Source or target topic not found");
    }

    if (sourceTopicId === targetTopicId) {
      return [sourceTopic];
    }

    if (!sourceTopic.parentTopicId && !targetTopic.parentTopicId) {
      throw new Error("Source or target without parent topic to be connected");
    }

    const queue: { topic: Topic; path: Topic[] }[] = [];
    const visited = new Set<string>();

    queue.push({ topic: sourceTopic, path: [sourceTopic] });
    visited.add(sourceTopicId);

    while (queue.length > 0) {
      const { topic, path } = queue.shift()!;

      const topicsToVerify: Topic[] = [];

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

    throw new Error("No path found between source and target topics");
  }
}
