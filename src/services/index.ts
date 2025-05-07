import { TopicService } from './TopicService';
import { UserService } from './UserService';

export const topicService = new TopicService();
export const userService = new UserService();

export {
  TopicService,
  UserService
}; 