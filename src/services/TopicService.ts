import { Topic } from '../models/Topic';
import { topicsRepository } from '../repositories';

export class TopicService {
  async getAllTopics(): Promise<Topic[]> {
    return topicsRepository.findAll();
  }

  async getTopicById(id: string): Promise<Topic | null> {
    return topicsRepository.findById(id);
  }

  async createTopic(topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Topic> {
    const now = new Date();
    const newTopicData: Omit<Topic, 'id'> = {
      ...topicData,
      createdAt: now,
      updatedAt: now,
      version: 1
    };
    
    return topicsRepository.create(newTopicData);
  }

  async updateTopic(id: string, topicData: Partial<Topic>): Promise<Topic | null> {
    const existingTopic = await topicsRepository.findById(id);
    if (!existingTopic) {
      return null;
    }

    return topicsRepository.update(id, topicData);
  }

  async deleteTopic(id: string): Promise<boolean> {
    return topicsRepository.delete(id);
  }
} 