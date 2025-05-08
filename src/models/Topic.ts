import { v4 as uuidv4 } from "uuid";
import { IBaseEntity } from "./Base";

export interface ITopic extends IBaseEntity {
  versionId: string;
  topicId: string;
  parentTopicId?: string;
  parentVersionId?: string;
  version: number;
  isLatestVersion: boolean;
  content: string;
  name: string;
}

export class Topic implements ITopic {
  versionId: string;
  topicId: string;
  parentTopicId?: string;
  parentVersionId?: string;
  isLatestVersion: boolean;
  version: number;
  content: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Topic>) {
    this.versionId = data.versionId ?? uuidv4();
    this.topicId = data.topicId ?? uuidv4();
    this.parentTopicId = data.parentTopicId;
    this.parentVersionId = data.parentVersionId;
    this.isLatestVersion = data.isLatestVersion ?? true;
    this.version = data.version ?? 1;
    this.content = data.content ?? "";
    this.name = data.name ?? "";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addParent(parent: Topic): void {
    this.parentTopicId = parent.topicId;
    this.parentVersionId = parent.versionId;
  }
}
