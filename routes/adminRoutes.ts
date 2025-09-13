import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";
import adminLogin from "../controllers/admin/adminLogin";
import adminSignup from "../controllers/admin/adminSignup";
import adminDashboard from "../controllers/admin/adminDashboard";

export default async function adminRoutes(app: FastifyInstance) {
  app.post("/admin/login", adminLogin);
  app.post("/admin/signup", adminSignup);
  app.get("/admin/dashboard", {
    preHandler: authMiddleware(["admin"]),
    handler: adminDashboard,
  });
}
