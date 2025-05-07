import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User";
import { userService } from "../services";
import { AuthenticatedRequest } from "./types";

export const mappedRolesToNumber: Record<UserRole, number> = {
  [UserRole.Viewer]: 1,
  [UserRole.Editor]: 10,
  [UserRole.Admin]: 20,
};

export type Action = "READ" | "WRITE" | "DELETE" | "GRANT_ACCESS";

const minimumRoleByAction: Record<Action, number> = {
  READ: mappedRolesToNumber.VIEWER,
  WRITE: mappedRolesToNumber.EDITOR,
  DELETE: mappedRolesToNumber.ADMIN,
  GRANT_ACCESS: mappedRolesToNumber.ADMIN,
};

export const isAuthorizedUser =
  (action: Action) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers["user-id"];

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await userService.getUserById(userId as string);

    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    (req as AuthenticatedRequest).user = user;

    if (mappedRolesToNumber[user.role] >= minimumRoleByAction[action]) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
