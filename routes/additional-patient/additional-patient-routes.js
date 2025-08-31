import { Hono } from "hono";
import authMiddleware from "../../middlewares/auth-middleware";

import newPatient from "../../controllers/additional-patient/new-patient.js";
import getPatients from "../../controllers/additional-patient/get-patients.js";
import deletePatient from "../../controllers/additional-patient/delete-patient.js";

const additionalPatientRoutes = new Hono();

additionalPatientRoutes.use(authMiddleware(["doctor", "doctor-helper"]));

additionalPatientRoutes.post("/create", newPatient);

additionalPatientRoutes.get("/get", getPatients);

additionalPatientRoutes.delete("/delete", deletePatient);

export default additionalPatientRoutes;
