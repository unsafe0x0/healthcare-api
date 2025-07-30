import { Hono } from "hono";
import authMiddleware from "../../middlewares/auth-middleware.js";

import newAppointment from "../../controllers/appointment/new-appointment.js";
import acceptAppointment from "../../controllers/appointment/accept-appointment.js";
import cancelAppointment from "../../controllers/appointment/cancel-appointment.js";
import completeAppointment from "../../controllers/appointment/complete-appointment.js";

const appointmentRoutes = new Hono();

appointmentRoutes.post("/new", authMiddleware("patient"), newAppointment);
appointmentRoutes.put(
  "/accept",
  authMiddleware(["doctor", "doctor-helper"]),
  acceptAppointment,
);
appointmentRoutes.put(
  "/cancel",
  authMiddleware(["patient", "doctor", "doctor-helper"]),
  cancelAppointment,
);
appointmentRoutes.put(
  "/complete",
  authMiddleware(["doctor", "doctor-helper"]),
  completeAppointment,
);

export default appointmentRoutes;
