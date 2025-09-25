import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";
import newAppointment from "../controllers/appointment/newAppointment";
import acceptAppointment from "../controllers/appointment/acceptAppointment";
import cancelAppointment from "../controllers/appointment/cancelAppointment";
import completeAppointment from "../controllers/appointment/completeAppointment";
import getAppointment from "../controllers/appointment/getAppointment";

export default async function appointmentRoutes(app: FastifyInstance) {
  app.post("/appointment/new", {
    preHandler: authMiddleware(["patient"]),
    handler: newAppointment,
  });

  app.patch<{ Params: { appointmentId: string } }>(
    "/appointment/:appointmentId/accept",
    {
      preHandler: authMiddleware(["doctor", "doctorhelper"]),
      handler: acceptAppointment,
    },
  );

  app.patch<{ Params: { appointmentId: string } }>(
    "/appointment/:appointmentId/cancel",
    {
      preHandler: authMiddleware(["patient", "doctor", "doctorhelper"]),
      handler: cancelAppointment,
    },
  );

  app.patch<{ Params: { appointmentId: string } }>(
    "/appointment/:appointmentId/complete",
    {
      preHandler: authMiddleware(["doctor", "doctorhelper"]),
      handler: completeAppointment,
    },
  );
  app.get<{ Params: { appointmentId: string } }>(
    "/appointment/:appointmentId",
    {
      preHandler: authMiddleware([
        "patient",
        "doctor",
        "doctorhelper",
        "admin",
      ]),
      handler: getAppointment,
    },
  );
}
