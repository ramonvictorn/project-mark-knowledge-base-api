import { IBaseEntity } from "./Base";

export enum UserRole {
  Viewer = "VIEWER",
  Editor = "EDITOR",
  Admin = "ADMIN",
}

export interface User extends IBaseEntity {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
