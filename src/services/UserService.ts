import { Request } from "express";
import { checkUserHasPermission } from "../middleware/authorization.middleware";
import { User } from "../models/User";
import { usersRepository } from "../repositories";
import { CreateUserPayload } from "../routes/v1/validation/users";
import { UnauthorizedError } from "../middleware/route.middleware";

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return usersRepository.findAll();
  }

  async getUserById(id: string): Promise<User | null> {
    return usersRepository.findById(id);
  }

  async createUser(
    req: Request<
      Record<string, never>,
      Record<string, never>,
      CreateUserPayload
    >
  ): Promise<User> {
    const isFirstUser = (await usersRepository.findAll()).length === 0;

    const userId = req.headers["user-id"] as string;

    if (!isFirstUser) {
      const { allowed, user } = await checkUserHasPermission(
        "GRANT_ACCESS",
        userId
      );

      if (!allowed) {
        throw new UnauthorizedError("Unauthorized");
      }

      if (!user) {
        throw new UnauthorizedError("Unauthorized");
      }
    }

    return usersRepository.create({
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    return usersRepository.update(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return usersRepository.delete(id);
  }
}
