import { v4 as uuidv4 } from "uuid";
import { redisClient } from "../config/redis";
import { Resource } from "../models/Resource";
import { BaseRepository } from "./BaseRepository";

export class ResourceRepository implements BaseRepository<Resource> {
  private readonly keyPrefix = "resource:";

  async findAll(): Promise<Resource[]> {
    const keys = await redisClient.keys(`${this.keyPrefix}*`);
    if (keys.length === 0) return [];

    const resources: Resource[] = [];
    for (const key of keys) {
      const jsonData = await redisClient.get(key);
      if (jsonData) {
        const resource = this.deserializeResource(jsonData);
        resources.push(resource);
      }
    }

    return resources;
  }

  async findById(id: string): Promise<Resource | null> {
    const key = `${this.keyPrefix}${id}`;
    const jsonData = await redisClient.get(key);

    if (!jsonData) return null;

    return this.deserializeResource(jsonData);
  }

  async create(resourceData: Omit<Resource, "id">): Promise<Resource> {
    const id = uuidv4();
    const now = new Date();

    const resource: Resource = {
      id,
      ...resourceData,
      createdAt: now,
      updatedAt: now,
    };

    const key = `${this.keyPrefix}${id}`;
    await redisClient.set(key, this.serializeResource(resource));

    return resource;
  }

  async update(
    id: string,
    resourceData: Partial<Resource>
  ): Promise<Resource | null> {
    const resource = await this.findById(id);

    if (!resource) return null;

    const updatedResource: Resource = {
      ...resource,
      ...resourceData,
      updatedAt: new Date(),
    };

    const key = `${this.keyPrefix}${id}`;
    await redisClient.set(key, this.serializeResource(updatedResource));

    return updatedResource;
  }

  async delete(id: string): Promise<boolean> {
    const key = `${this.keyPrefix}${id}`;
    const result = await redisClient.del(key);

    return result === 1;
  }

  private serializeResource(resource: Resource): string {
    return JSON.stringify({
      ...resource,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
    });
  }

  private deserializeResource(jsonData: string): Resource {
    const data = JSON.parse(jsonData);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }
}
