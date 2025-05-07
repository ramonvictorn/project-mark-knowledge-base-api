import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../config/redis";
import { Topic } from "../models/Topic";
import { BaseRepository } from "./BaseRepository";
import { CreateTopic } from "./types";

export class TopicRepository implements BaseRepository<Topic> {
  private readonly keyPrefix = "topic:";

  async findAll(): Promise<Topic[]> {
    const keys = await redisClient.keys(`${this.keyPrefix}*`);
    if (keys.length === 0) return [];

    const topics: Topic[] = [];
    for (const key of keys) {
      const jsonData = await redisClient.get(key);
      if (jsonData) {
        const topic = this.deserializeTopic(jsonData);
        topics.push(topic);
      }
    }

    return topics;
  }

  async findLastVersion(topicId: string): Promise<Topic | null> {
    const allTopics = await this.findAll();

    const topicVersions = allTopics
      .filter((topic) => topic.topicId === topicId)
      .sort((a, b) => a.version - b.version);

    if (topicVersions.length === 0) return null;

    return topicVersions[topicVersions.length - 1];
  }

  async findByVersion(
    topicId: string,
    versionNumber: number
  ): Promise<Topic | null> {
    const allTopics = await this.findAll();

    const topic = allTopics.find(
      (topic) => topic.topicId === topicId && topic.version === versionNumber
    );

    return topic ?? null;
  }

  async findAllLastVersion(): Promise<Topic[]> {
    const allTopics = await this.findAll();

    return allTopics.filter((topic) => topic.isLatestVersion);
  }

  async findByVersionId(versionId: string): Promise<Topic | null> {
    const allTopics = await this.findAll();

    const topic = allTopics.find((topic) => topic.versionId === versionId);

    if (!topic) {
      throw new Error("Topic not found");
    }

    return topic;
  }

  async create(topicData: CreateTopic): Promise<Topic> {
    const versionId = uuidv4();
    const topicId = topicData.topicId ?? uuidv4();
    const now = new Date();

    const topic: Topic = {
      ...topicData,
      version: topicData.version ?? 1,
      isLatestVersion: true,
      topicId,
      versionId,
      createdAt: now,
      updatedAt: now,
    };

    const key = `${this.keyPrefix}${versionId}`;
    await redisClient.set(key, this.serializeTopic(topic));

    return topic;
  }

  async update(
    versionId: string,
    topicData: Partial<Topic>
  ): Promise<Topic | null> {
    const topic = await this.findByVersionId(versionId);

    if (!topic) return null;

    const updatedTopic: Topic = {
      ...topic,
      ...topicData,
      updatedAt: new Date(),
    };

    const key = `${this.keyPrefix}${versionId}`;
    await redisClient.set(key, this.serializeTopic(updatedTopic));

    return updatedTopic;
  }

  async delete(versionId: string): Promise<boolean> {
    const key = `${this.keyPrefix}${versionId}`;
    const result = await redisClient.del(key);

    return result === 1;
  }

  private serializeTopic(topic: Topic): string {
    return JSON.stringify({
      ...topic,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
    });
  }

  private deserializeTopic(jsonData: string): Topic {
    const data = JSON.parse(jsonData);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}
