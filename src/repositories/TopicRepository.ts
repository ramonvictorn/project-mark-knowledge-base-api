import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../config/redis';
import { Topic } from '../models/Topic';
import { BaseRepository } from './BaseRepository';

export class TopicRepository implements BaseRepository<Topic> {
  private readonly keyPrefix = 'topic:';

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

  async findById(id: string): Promise<Topic | null> {
    const key = `${this.keyPrefix}${id}`;
    const jsonData = await redisClient.get(key);
    
    if (!jsonData) return null;
    
    return this.deserializeTopic(jsonData);
  }

  async create(topicData: Omit<Topic, 'id'>): Promise<Topic> {
    const id = uuidv4();
    const now = new Date();
    
    const topic: Topic = {
      id,
      ...topicData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    
    const key = `${this.keyPrefix}${id}`;
    await redisClient.set(key, this.serializeTopic(topic));
    
    return topic;
  }

  async update(id: string, topicData: Partial<Topic>): Promise<Topic | null> {
    const topic = await this.findById(id);
    
    if (!topic) return null;
    
    const updatedTopic: Topic = {
      ...topic,
      ...topicData,
      updatedAt: new Date(),
      version: topic.version + 1
    };
    
    const key = `${this.keyPrefix}${id}`;
    await redisClient.set(key, this.serializeTopic(updatedTopic));
    
    return updatedTopic;
  }

  async delete(id: string): Promise<boolean> {
    const key = `${this.keyPrefix}${id}`;
    const result = await redisClient.del(key);
    
    return result === 1;
  }

  private serializeTopic(topic: Topic): string {
    return JSON.stringify({
      ...topic,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString()
    });
  }

  private deserializeTopic(jsonData: string): Topic {
    const data = JSON.parse(jsonData);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  }
} 