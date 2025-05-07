import { User, UserRole } from "../models/User";
import { usersRepository } from "../repositories";

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return usersRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return usersRepository.findById(id);
  }

  async createUser(userData: { name: string; email: string; role: UserRole }): Promise<User> {
    return usersRepository.create({
      ...userData,
      createdAt: new Date()
    });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    return usersRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.delete(id);
  }
} 