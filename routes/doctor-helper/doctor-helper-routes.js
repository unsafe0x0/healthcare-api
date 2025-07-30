import { Hono } from "hono";
import authMiddleware from "../../middlewares/auth-middleware.js";

import helperLogin from "../../controllers/doctor-helper/auth/helper-login.js";
import helperUpdate from "../../controllers/doctor-helper/auth/helper-update.js";
import getHelper from "../../controllers/doctor-helper/dashboard/get-helper.js";

const doctorHelperRoutes = new Hono();

doctorHelperRoutes.post("/auth/login", helperLogin);

doctorHelperRoutes.use(authMiddleware("doctor-helper"));

doctorHelperRoutes.put("/auth/update", helperUpdate);
doctorHelperRoutes.get("/dashboard", getHelper);

export default doctorHelperRoutes;
