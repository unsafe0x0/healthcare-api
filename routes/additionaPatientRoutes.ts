import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";
import newPatient from "../controllers/additional-patient/newPatient";
import deletePatient from "../controllers/additional-patient/deletePatient";

export default async function additionalPatientRoutes(app: FastifyInstance) {
  app.post("/additional-patient/new", {
    preHandler: authMiddleware(["doctor", "doctorhelper"]),
    handler: newPatient,
  });

  app.delete<{
    Params: { id: string };
  }>("/additional-patient/:id", {
    preHandler: authMiddleware(["doctor", "doctorhelper"]),
    handler: deletePatient,
  });
}
