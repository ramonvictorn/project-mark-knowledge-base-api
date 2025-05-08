import { CreateTopicPayload } from "../routes/v1/validation/topics";

export type CreateTopic = CreateTopicPayload & {
  parentTopicId?: string;
  parentVersionId?: string;
  version?: number;
  topicId?: string;
};


