import { Hono } from "hono";
import authMiddleware from "../../middlewares/auth-middleware.js";

import newAppointment from "../../controllers/appointment/new-appointment.js";
import acceptAppointment from "../../controllers/appointment/accept-appointment.js";
import cancelAppointment from "../../controllers/appointment/cancel-appointment.js";
import completeAppointment from "../../controllers/appointment/complete-appointment.js";

const appointmentRoutes = new Hono();

appointmentRoutes.post("/new", authMiddleware("patient"), newAppointment);
appointmentRoutes.post(
  "/accept",
  authMiddleware(["doctor", "doctorHelper"]),
  acceptAppointment,
);
appointmentRoutes.post(
  "/cancel",
  authMiddleware(["patient", "doctor", "doctorHelper"]),
  cancelAppointment,
);
appointmentRoutes.post(
  "/complete",
  authMiddleware(["doctor", "doctorHelper"]),
  completeAppointment,
);

export default appointmentRoutes;
