import { IBaseEntity } from "./Base";

export enum ResourceType {
  VIDEO = "VIDEO",
  ARTICLE = "ARTICLE",
  PDF = "PDF",
}

export interface Resource extends IBaseEntity {
  id: string;
  topicId: string;
  url: string;
  description: string;
  type: ResourceType;
}
