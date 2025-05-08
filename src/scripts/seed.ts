import axios from "axios";
import { CreateTopicPayload } from "../routes/v1/validation/topics";

const API_BASE_URL = "http://localhost:3000/v1";

const topics: CreateTopicPayload[] = [
  // root
  {
    name: "Programming Languages",
    content:
      "Overview of different programming languages and their characteristics",
  },
  {
    name: "Web Development",
    content:
      "Comprehensive guide to web development technologies and practices",
  },
  {
    name: "Data Science",
    content: "Introduction to data science concepts and tools",
  },
  // children
  {
    name: "Python",
    content: "Python programming language fundamentals and best practices",
    parentTopicId: "programming-languages", // Will be replaced with actual ID
  },
  {
    name: "JavaScript",
    content: "JavaScript programming language and its ecosystem",
    parentTopicId: "programming-languages", // Will be replaced with actual ID
  },
  {
    name: "Java",
    content: "Java programming language and enterprise development",
    parentTopicId: "programming-languages", // Will be replaced with actual ID
  },

  // Web Development children
  {
    name: "Frontend Development",
    content: "Frontend development technologies and frameworks",
    parentTopicId: "web-development", // Will be replaced with actual ID
  },
  {
    name: "Backend Development",
    content: "Backend development technologies and best practices",
    parentTopicId: "web-development", // Will be replaced with actual ID
  },

  // Frontend Development children
  {
    name: "React",
    content: "React library for building user interfaces",
    parentTopicId: "frontend-development", // Will be replaced with actual ID
  },
  // React children
  {
    name: "Next.js",
    content:
      "Next.js framework for building server-side rendered React applications",
    parentTopicId: "react", // Will be replaced with actual ID
  },
  {
    name: "NPM",
    content: "NPM is a package manager for Node.js",
    parentTopicId: "react", // Will be replaced with actual ID
  },
  {
    name: "Vue.js",
    content: "Vue.js framework for building user interfaces",
    parentTopicId: "frontend-development", // Will be replaced with actual ID
  },

  // Data Science children
  {
    name: "Machine Learning",
    content: "Introduction to machine learning concepts and algorithms",
    parentTopicId: "data-science", // Will be replaced with actual ID
  },
  {
    name: "Data Analysis",
    content: "Tools and techniques for data analysis",
    parentTopicId: "data-science", // Will be replaced with actual ID
  },
];

const topicIdMap = new Map<string, string>();

async function createTopic(topic: CreateTopicPayload): Promise<void> {
  try {
    const response = await axios.post(`${API_BASE_URL}/topics`, topic, {
      headers: {
        "user-id": "3f6140e1-ddb7-4df7-9691-d100a7277dad",
      },
    });
    const createdTopic = response.data;

    // Store the ID mapping using the topic name as key
    topicIdMap.set(
      topic.name.toLowerCase().replace(/\s+/g, "-"),
      createdTopic.topicId
    );

    console.log(`Created topic: ${topic.name}`);
  } catch (error) {
    console.error(`Error creating topic ${topic.name}:`, error);
  }
}

async function seedDatabase() {
  console.log("Starting database seeding...");

  // First, create all root level topics
  const rootTopics = topics.filter((topic) => !topic.parentTopicId);
  for (const topic of rootTopics) {
    await createTopic(topic);
  }

  // Then create all child topics with proper parent IDs
  const childTopics = topics.filter((topic) => topic.parentTopicId);
  for (const topic of childTopics) {
    const parentId = topicIdMap.get(topic.parentTopicId!);
    if (parentId) {
      await createTopic({
        ...topic,
        parentTopicId: parentId,
      });
    } else {
      console.error(`Parent topic not found for: ${topic.name}`);
    }
  }

  console.log("Database seeding completed!");
  console.log("Created topic IDs:", Object.fromEntries(topicIdMap));
}

// Run the seeding
seedDatabase().catch(console.error);
