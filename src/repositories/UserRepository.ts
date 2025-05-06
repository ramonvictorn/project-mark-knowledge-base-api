import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../config/redis';
import { User } from '../models/User';
import { BaseRepository } from './BaseRepository';

export class UserRepository implements BaseRepository<User> {
  private readonly keyPrefix = 'user:';

  async findAll(): Promise<User[]> {
    const keys = await redisClient.keys(`${this.keyPrefix}*`);
    if (keys.length === 0) return [];

    const users: User[] = [];
    for (const key of keys) {
      const jsonData = await redisClient.get(key);
      if (jsonData) {
        const user = this.deserializeUser(jsonData);
        users.push(user);
      }
    }
    
    return users;
  }

  async findById(id: string): Promise<User | null> {
    const key = `${this.keyPrefix}${id}`;
    const jsonData = await redisClient.get(key);
    
    if (!jsonData) return null;
    
    return this.deserializeUser(jsonData);
  }


  async create(userData: Omit<User, 'id'>): Promise<User> {
    const id = uuidv4();
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      createdAt: now
    };
    
    const key = `${this.keyPrefix}${id}`;
    await redisClient.set(key, this.serializeUser(user));
    
    return user;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const user = await this.findById(id);
    
    if (!user) return null;
    
    const updatedUser: User = {
      ...user,
      ...userData
    };
    
    const key = `${this.keyPrefix}${id}`;
    await redisClient.set(key, this.serializeUser(updatedUser));
    
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    const key = `${this.keyPrefix}${id}`;
    const result = await redisClient.del(key);
    
    return result === 1;
  }

  private serializeUser(user: User): string {
    return JSON.stringify({
      ...user,
      createdAt: user.createdAt.toISOString()
    });
  }

  private deserializeUser(jsonData: string): User {
    const data = JSON.parse(jsonData);
    return {
      ...data,
      createdAt: new Date(data.createdAt)
    };
  }
} 