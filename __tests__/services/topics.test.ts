import { TopicService } from "../../src/services/TopicService";
import { topicsRepository } from "../../src/repositories";
import { Topic } from "../../src/models/Topic";
import { NotFoundError } from "../../src/middleware/route.middleware";

jest.mock("../../src/repositories", () => ({
  topicsRepository: {
    findLastVersion: jest.fn(),
    findAll: jest.fn(),
  },
}));

describe("TopicService", () => {
  let topicService: TopicService;

  beforeEach(() => {
    topicService = new TopicService();
    jest.clearAllMocks();
  });

  describe("getTopicsTree", () => {
    it("should return a tree structure of topics starting from the given topic", async () => {
      const programmingLanguages = new Topic({
        topicId: "prog-lang-id",
        name: "Programming Languages",
        content: "Overview of different programming languages",
        version: 1,
        isLatestVersion: true,
      });

      const python = new Topic({
        topicId: "python-id",
        name: "Python",
        content: "Python programming language",
        version: 1,
        isLatestVersion: true,
        parentTopicId: "prog-lang-id",
      });

      const javascript = new Topic({
        topicId: "js-id",
        name: "JavaScript",
        content: "JavaScript programming language",
        version: 1,
        isLatestVersion: true,
        parentTopicId: "prog-lang-id",
      });

      (topicsRepository.findLastVersion as jest.Mock).mockResolvedValue(
        programmingLanguages
      );
      (topicsRepository.findAll as jest.Mock).mockResolvedValue([
        programmingLanguages,
        python,
        javascript,
      ]);

      const result = await topicService.getTopicsTree("prog-lang-id");

      expect(result).toEqual({
        ...programmingLanguages,
        children: [
          {
            ...python,
            children: [],
          },
          {
            ...javascript,
            children: [],
          },
        ],
      });

      expect(topicsRepository.findLastVersion).toHaveBeenCalledWith(
        "prog-lang-id"
      );
      expect(topicsRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it("should throw NotFoundError when parent topic is not found", async () => {
      (topicsRepository.findLastVersion as jest.Mock).mockResolvedValue(null);

      await expect(
        topicService.getTopicsTree("non-existent-id")
      ).rejects.toThrow(NotFoundError);
      await expect(
        topicService.getTopicsTree("non-existent-id")
      ).rejects.toThrow("Parent topic not found");
    });

    it("should handle deep nested topic structures", async () => {
      const root = new Topic({
        topicId: "root-id",
        name: "Root",
        content: "Root content",
        version: 1,
        isLatestVersion: true,
      });

      const child1 = new Topic({
        topicId: "child1-id",
        name: "Child 1",
        content: "Child 1 content",
        version: 1,
        isLatestVersion: true,
        parentTopicId: "root-id",
      });

      const child2 = new Topic({
        topicId: "child2-id",
        name: "Child 2",
        content: "Child 2 content",
        version: 1,
        isLatestVersion: true,
        parentTopicId: "child1-id",
      });

      const child3 = new Topic({
        topicId: "child3-id",
        name: "Child 3",
        content: "Child 3 content",
        version: 1,
        isLatestVersion: true,
        parentTopicId: "child2-id",
      });

      const child4 = new Topic({
        topicId: "child4-id",
        name: "Child 4",
        content: "Child 4 content",
        version: 1,
        isLatestVersion: true,
        parentTopicId: "child3-id",
      });

      const child4Two = new Topic({
        topicId: "child4-two-id",
        name: "Child 4 Two",
        content: "Child 4 Two content",
        version: 1,
        isLatestVersion: true,
        parentTopicId: "child3-id",
      });

      (topicsRepository.findLastVersion as jest.Mock).mockResolvedValue(root);
      (topicsRepository.findAll as jest.Mock).mockResolvedValue([
        root,
        child1,
        child2,
        child3,
        child4,
        child4Two,
      ]);

      const result = await topicService.getTopicsTree("root-id");

      expect(result).toEqual({
        ...root,
        children: [
          {
            ...child1,
            children: [
              {
                ...child2,
                children: [
                  {
                    ...child3,
                    children: [
                      {
                        ...child4,
                        children: [],
                      },
                      {
                        ...child4Two,
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    });
  });
});
