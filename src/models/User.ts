export enum UserRole {
  Viewer = "VIEWER",
  Editor = "EDITOR",
  Admin = "ADMIN",
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
