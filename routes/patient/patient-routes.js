import { Hono } from "hono";
import authMiddleware from "../../middlewares/auth-middleware.js";

import patientLogin from "../../controllers/patient/auth/patient-login.js";
import patientSignup from "../../controllers/patient/auth/patient-signup.js";

import getPatient from "../../controllers/patient/dashboard/get-patient.js";
import updatePatient from "../../controllers/patient/auth/patient-update.js";

const patientRoutes = new Hono();

patientRoutes.post("/auth/login", patientLogin);
patientRoutes.post("/auth/signup", patientSignup);

patientRoutes.use(authMiddleware("patient"));

patientRoutes.get("/dashboard", getPatient);
patientRoutes.put("/auth/update", updatePatient);

export default patientRoutes;
