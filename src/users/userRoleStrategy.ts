import { UserRole } from "../models/User";

export type Action = "READ" | "WRITE" | "DELETE" | "GRANT_ACCESS";

export interface IUserRoleStrategy {
  canDoAction(action: Action): boolean;
}

export class AdminRoleStrategy implements IUserRoleStrategy {
  canDoAction(): boolean {
    return true;
  }
}

export class EditorRoleStrategy implements IUserRoleStrategy {
  canDoAction(action: Action): boolean {
    if (action === "DELETE" || action === "GRANT_ACCESS") {
      return false;
    }

    return true;
  }
}

export class ViewerRoleStrategy implements IUserRoleStrategy {
  canDoAction(action: Action): boolean {
    if (action === "READ") {
      return true;
    }

    return false;
  }
}

export class RoleStrategyFactory {
  static createStrategy(role: UserRole): IUserRoleStrategy {
    switch (role) {
      case UserRole.Admin:
        return new AdminRoleStrategy();
      case UserRole.Editor:
        return new EditorRoleStrategy();
      case UserRole.Viewer:
        return new ViewerRoleStrategy();
      default:
        throw new Error("Invalid role");
    }
  }
}
