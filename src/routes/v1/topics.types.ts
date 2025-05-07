export interface CreateTopicPayload {
  name: string;
  content: string;
  parentTopicId?: string;
}

export interface UpdateTopicPayload {
  name: string;
  content: string;
  parentTopicId?: string;
}

export interface TopicResponse {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  parentTopicId?: string;
  originalTopicId: string;
  isLatestVersion: boolean;
}

export interface TopicTreeNode {
  id: string;
  name: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  children: TopicTreeNode[];
}

export interface ErrorResponse {
  error: string;
  message?: string;
}
