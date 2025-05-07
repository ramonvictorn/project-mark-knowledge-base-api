import { Request, Response, Router } from "express";
import { userService } from "../../services";
import { UserRole } from "../../models/User";
import { isAuthorizedUser } from "../../middleware/authorization.middleware";

const router: Router = Router();

router.get(
  "/",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

router.get(
  "/:id",
  isAuthorizedUser("READ"),
  async (req: Request, res: Response) => {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }
);

router.post(
  "/",
  isAuthorizedUser("GRANT_ACCESS"),
  async (req: Request, res: Response) => {
    try {
      const { name, email, role } = req.body;

      if (!name || !email || !role) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ error: "Invalid role" });
        return;
      }

      const user = await userService.createUser({ name, email, role });
      res.status(201).json(user);
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Failed to create user" });
    }
  }
);

router.put(
  "/:id",
  isAuthorizedUser("GRANT_ACCESS"),
  async (req: Request, res: Response) => {
    try {
      const { name, email, role } = req.body;
      const user = await userService.updateUser(req.params.id, {
        name,
        email,
        role,
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ error: "Failed to update user" });
    }
  }
);

router.delete(
  "/:id",
  isAuthorizedUser("GRANT_ACCESS"),
  async (req: Request, res: Response) => {
    try {
      const success = await userService.deleteUser(req.params.id);
      if (!success) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting user:", err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

export default router;
