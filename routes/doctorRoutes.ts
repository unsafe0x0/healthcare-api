import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";
import doctorLogin from "../controllers/doctor/doctorLogin";
import doctorSignup from "../controllers/doctor/doctorSignup";
import doctorUpdate from "../controllers/doctor/doctorUpdate";
import doctorDashboard from "../controllers/doctor/doctorDashboard";
import allDoctors from "../controllers/doctor/allDoctors";
import doctorProfile from "../controllers/doctor/doctorProfile";
import doctorDelete from "../controllers/doctor/doctorDelete";
import doctorSchedule from "../controllers/doctor/doctorSchedule";

export default async function doctorRoutes(app: FastifyInstance) {
  app.post("/doctor/login", doctorLogin);
  app.get("/doctor/all", allDoctors);
  app.get<{ Params: { slug: string } }>("/doctor/profile/:slug", doctorProfile);
  app.get("/doctor/dashboard", {
    preHandler: authMiddleware(["doctor"]),
    handler: doctorDashboard,
  });
  app.post("/doctor/signup", {
    preHandler: authMiddleware(["admin"]),
    handler: doctorSignup,
  });
  app.put("/doctor/update", {
    preHandler: authMiddleware(["doctor", "admin"]),
    handler: doctorUpdate,
  });
  app.put("/doctor/schedule", {
    preHandler: authMiddleware(["doctor"]),
    handler: doctorSchedule,
  });
  app.delete<{
    Params: { id: string };
  }>("/doctor/delete/:id", {
    preHandler: authMiddleware(["doctor", "admin"]),
    handler: doctorDelete,
  });
}
