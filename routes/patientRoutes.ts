import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";
import patientLogin from "../controllers/patient/patientLogin";
import patientSignup from "../controllers/patient/patientSignup";
import patientUpdate from "../controllers/patient/patientUpdate";
import patientDashboard from "../controllers/patient/patientDashboard";
import patientDelete from "../controllers/patient/patientDelete";

export default async function patientRoutes(app: FastifyInstance) {
  app.post("/patient/login", patientLogin);
  app.post("/patient/signup", patientSignup);
  app.put("/patient/update", {
    preHandler: authMiddleware(["patient"]),
    handler: patientUpdate,
  });
  app.get("/patient/dashboard", {
    preHandler: authMiddleware(["patient"]),
    handler: patientDashboard,
  });
  app.delete<{
    Params: { id: string };
  }>("/patient/delete/:id", {
    preHandler: authMiddleware(["patient", "admin"]),
    handler: patientDelete,
  });
}
