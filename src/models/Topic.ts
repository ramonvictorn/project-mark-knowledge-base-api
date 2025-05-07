export interface Topic {
  versionId: string;
  topicId: string;
  parentTopicId?: string;
  parentVersionId?: string;
  isLatestVersion: boolean;
  version: number;
  content: string;
  name: string;
  updatedAt: Date;
  createdAt: Date;
}
