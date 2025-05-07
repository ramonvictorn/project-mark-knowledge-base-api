import { CreateTopicPayload } from "../routes/v1/topics.types";

export type CreateTopic = CreateTopicPayload & {
  parentTopicId?: string;
  parentVersionId?: string;
  version?: number;
  topicId?: string;
};


