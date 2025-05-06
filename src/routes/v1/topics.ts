import express, { Request, Response, RequestHandler } from 'express';
import { topicService } from '../../services';
import { Topic } from '../../models/Topic';

const router = express.Router();

router.get('/', (async (req: Request, res: Response) => {
  try {
    const topics = await topicService.getAllTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
}) as RequestHandler);

router.get('/:id', (async (req: Request, res: Response) => {
  try {
    const topic = await topicService.getTopicById(req.params.id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
}) as RequestHandler);

router.post('/', (async (req: Request, res: Response) => {
  try {
    const { name, content, parentTopicId } = req.body;
    
    if (!name || !content) {
      return res.status(400).json({ error: 'Name and content are required' });
    }
    
    const topicData = {
      name,
      content,
      ...(parentTopicId && { parentTopicId })
    };
    
    const newTopic = await topicService.createTopic(topicData);
    res.status(201).json(newTopic);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
}) as RequestHandler);

router.put('/:id', (async (req: Request, res: Response) => {
  try {
    const { name, content, parentTopicId } = req.body;
    const updateData: Partial<Topic> = {};
    
    if (name) updateData.name = name;
    if (content) updateData.content = content;
    if (parentTopicId !== undefined) updateData.parentTopicId = parentTopicId;
    
    const updatedTopic = await topicService.updateTopic(req.params.id, updateData);
    if (!updatedTopic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.json(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
}) as RequestHandler);

router.delete('/:id', (async (req: Request, res: Response) => {
  try {
    const success = await topicService.deleteTopic(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
}) as RequestHandler);

export default router; 