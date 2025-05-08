import { Request, Response, NextFunction } from "express";
import { userService } from "../services";
import { AuthenticatedRequest } from "./types";
import { Action, RoleStrategyFactory } from "../users/userRoleStrategy";
import { UnauthorizedError } from "./route.middleware";

export const isAuthorizedUser =
  (action: Action) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userId: string | undefined = req.headers["user-id"] as string;
    const { allowed, user } = await checkUserHasPermission(action, userId);

    if (!allowed || !user) {
      throw new UnauthorizedError("Unauthorized");
    }

    (req as AuthenticatedRequest).user = user;

    next();
  };

export const checkUserHasPermission = async (
  action: Action,
  userId?: string
) => {
  if (!userId) {
    return {
      allowed: false,
    };
  }

  const user = await userService.getUserById(userId);

  if (!user) {
    return {
      allowed: false,
    };
  }

  const roleStrategy = RoleStrategyFactory.createStrategy(user.role);

  return {
    allowed: roleStrategy.canDoAction(action),
    user,
  };
};
