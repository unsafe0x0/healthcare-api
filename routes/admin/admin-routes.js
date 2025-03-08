import { Hono } from "hono";
import authMiddleware from "../../middlewares/auth-middleware.js";

import adminLogin from "../../controllers/admin/auth/admin-login.js";
import adminSignup from "../../controllers/admin/auth/admin-signup.js";

import getAdmin from "../../controllers/admin/dashboard/get-admin.js";

import getAllDoctors from "../../controllers/admin/doctor/get-all.js";
import addDoctor from "../../controllers/admin/doctor/add-doctor.js";
import removeDoctor from "../../controllers/admin/doctor/remove-doctor.js";
import updateDoctor from "../../controllers/admin/doctor/update-doctor.js";

import getAllPatients from "../../controllers/admin/patient/get-all.js";
import addPatient from "../../controllers/admin/patient/add-patient.js";
import removePatient from "../../controllers/admin/patient/remove-patient.js";
import updatePatient from "../../controllers/admin/patient/update-patient.js";

const adminRoutes = new Hono();

adminRoutes.post("/login", adminLogin);
adminRoutes.post("/signup", adminSignup);

adminRoutes.use(authMiddleware(["admin"]));

adminRoutes.get("/dashboard", getAdmin);

adminRoutes.get("/doctors", getAllDoctors);
adminRoutes.post("/doctor/add", addDoctor);
adminRoutes.post("/doctor/remove", removeDoctor);
adminRoutes.post("/doctor/update", updateDoctor);

adminRoutes.get("/patients", getAllPatients);
adminRoutes.post("/patient/add", addPatient);
adminRoutes.post("/patient/remove", removePatient);
adminRoutes.post("/patient/update", updatePatient);

export default adminRoutes;
