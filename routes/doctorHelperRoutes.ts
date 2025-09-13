import type { FastifyInstance } from "fastify";
import { authMiddleware } from "../middlewares/authMiddleware";
import helperLogin from "../controllers/doctor-helper/helperLogin";
import helperSignup from "../controllers/doctor-helper/helperSignup";
import allHelpers from "../controllers/doctor-helper/allHelpers";
import helperDashboard from "../controllers/doctor-helper/helperDashboard";
import helperUpdate from "../controllers/doctor-helper/helperUpdate";
import helperDelete from "../controllers/doctor-helper/helperDelete";

export default async function doctorHelperRoutes(app: FastifyInstance) {
  app.post("/doctor-helper/login", helperLogin);
  app.post("/doctor-helper/signup", {
    preHandler: authMiddleware(["doctor"]),
    handler: helperSignup,
  });
  app.get("/doctor-helper/all", {
    preHandler: authMiddleware(["doctor"]),
    handler: allHelpers,
  });
  app.get("/doctor-helper/dashboard", {
    preHandler: authMiddleware(["doctorhelper"]),
    handler: helperDashboard,
  });
  app.put("/doctor-helper/update", {
    preHandler: authMiddleware(["doctorhelper", "doctor"]),
    handler: helperUpdate,
  });
  app.delete<{ Params: { id: string } }>("/doctor-helper/delete/:id", {
    preHandler: authMiddleware(["doctor", "doctorhelper"]),
    handler: helperDelete,
  });
}
