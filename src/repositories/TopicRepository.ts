import { redisClient } from "../config/redis";
import { NotFoundError } from "../middleware/route.middleware";
import { ITopic, Topic } from "../models/Topic";
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
        topics.push(new Topic(topic));
      }
    }

    return topics;
  }

  async findLastVersion(topicId: string) {
    const allTopics = await this.findAll();
    // TODO: CAN BE IMPROVED WITH FIND + ISLAST VERSION
    const topicVersions = allTopics
      .filter((topic) => topic.topicId === topicId)
      .sort((a, b) => a.version - b.version);

    if (topicVersions.length === 0) return null;

    return new Topic(topicVersions[topicVersions.length - 1]);
  }

  async findByVersion(
    topicId: string,
    versionNumber: number
  ): Promise<Topic | null> {
    const allTopics = await this.findAll();

    const topic = allTopics.find(
      (topic) => topic.topicId === topicId && topic.version === versionNumber
    );

    return topic ? new Topic(topic) : null;
  }

  async findTopicVersions(topicId: string): Promise<Topic[] | null> {
    const allTopics = await this.findAll();

    const topic = allTopics.filter((topic) => topic.topicId === topicId);

    return topic.map((topic) => new Topic(topic));
  }

  async findAllLastVersion(): Promise<Topic[]> {
    const allTopics = await this.findAll();

    return allTopics
      .filter((topic) => topic.isLatestVersion)
      .map((topic) => new Topic(topic));
  }

  async findByVersionId(versionId: string): Promise<Topic | null> {
    const allTopics = await this.findAll();

    const topic = allTopics.find((topic) => topic.versionId === versionId);

    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    return new Topic(topic);
  }

  async create(topicData: CreateTopic): Promise<Topic> {
    const topic = new Topic({
      ...topicData,
      isLatestVersion: true,
    });

    const key = `${this.keyPrefix}${topic.versionId}`;
    await redisClient.set(key, this.serializeTopic(topic));

    return new Topic(topic);
  }

  async update(
    versionId: string,
    topicData: Partial<ITopic>
  ): Promise<Topic | null> {
    const topic = await this.findByVersionId(versionId);

    if (!topic) return null;

    const updatedTopic: ITopic = {
      ...topic,
      ...topicData,
      updatedAt: new Date(),
    };

    const key = `${this.keyPrefix}${versionId}`;
    await redisClient.set(key, this.serializeTopic(updatedTopic));

    return new Topic(updatedTopic);
  }

  async delete(versionId: string): Promise<boolean> {
    const key = `${this.keyPrefix}${versionId}`;
    const result = await redisClient.del(key);

    return result === 1;
  }

  async findAllChildren(topicId: string): Promise<Topic[]> {
    const allTopics = await this.findAll();

    const topics = allTopics.filter((topic) => topic.parentTopicId === topicId);

    return topics.map((topic) => new Topic(topic));
  }

  private serializeTopic(topic: ITopic): string {
    return JSON.stringify({
      ...topic,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
    });
  }

  private deserializeTopic(jsonData: string): Topic {
    const data = JSON.parse(jsonData);
    return new Topic({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }
}
