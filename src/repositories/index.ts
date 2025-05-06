import { TopicRepository } from './TopicRepository';
import { ResourceRepository } from './ResourceRepository';
import { UserRepository } from './UserRepository';


const topicsRepository = new TopicRepository();
const resourcesRepository = new ResourceRepository();
const usersRepository = new UserRepository();

export {
  topicsRepository,
  resourcesRepository,
  usersRepository
}; 