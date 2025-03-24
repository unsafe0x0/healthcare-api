import { Hono } from "hono";
import authMiddleware from "../../middlewares/auth-middleware.js";

import deleteDoctor from "../../controllers/doctor/auth/doctor-delete.js";
import doctorLogin from "../../controllers/doctor/auth/doctor-login.js";
import doctorUpdate from "../../controllers/doctor/auth/doctor-update.js";

import getDoctor from "../../controllers/doctor/dashboard/get-doctor.js";

import getHelpers from "../../controllers/doctor/helper/get-helpers.js";
import addHelper from "../../controllers/doctor/helper/add-helper.js";
import removeHelper from "../../controllers/doctor/helper/remove-helper.js";
import updateHelper from "../../controllers/doctor/helper/update-helper.js";

import getAllDoctor from "../../controllers/doctor/profile/get-all.js";
import getDoctorProfile from "../../controllers/doctor/profile/get-doctor.js";

import updateSchedule from "../../controllers/doctor/schedule/update-schedule.js";

const doctorRoutes = new Hono();

doctorRoutes.post("/auth/login", doctorLogin);
doctorRoutes.get("/profile", getDoctorProfile);
doctorRoutes.get("/all", getAllDoctor);

doctorRoutes.use(authMiddleware("doctor"));

doctorRoutes.put("/auth/update", doctorUpdate);
doctorRoutes.delete("/auth/delete", deleteDoctor);

doctorRoutes.get("/dashboard", getDoctor);

doctorRoutes.put("/schedule/update", updateSchedule);

doctorRoutes.get("/helpers", getHelpers);
doctorRoutes.post("/helper/add", addHelper);
doctorRoutes.put("/helper/update", updateHelper);
doctorRoutes.delete("/helper/remove", removeHelper);

export default doctorRoutes;
