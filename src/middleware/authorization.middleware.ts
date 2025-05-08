import { Request, Response, NextFunction } from "express";
import { userService } from "../services";
import { AuthenticatedRequest } from "./types";
import { Action, RoleStrategyFactory } from "../users/userRoleStrategy";
import { ForbiddenError, UnauthorizedError } from "./route.middleware";

export const isAuthorizedUser =
  (action: Action) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers["user-id"];

    if (!userId) {
      throw new UnauthorizedError("Unauthorized");
    }
    const user = await userService.getUserById(userId as string);

    if (!user) {
      throw new UnauthorizedError("Unauthorized");
    }

    (req as AuthenticatedRequest).user = user;
    const roleStrategy = RoleStrategyFactory.createStrategy(user.role);

    if (roleStrategy.canDoAction(action)) {
      next();
    } else {
      throw new ForbiddenError(
        "User does not have permission to do this action"
      );
    }
  };
