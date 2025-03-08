import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import dotenv from "dotenv";

import adminRoutes from "./routes/admin/admin-routes.js";
import doctorRoutes from "./routes/doctor/doctor-routes.js";
import doctorHelperRoutes from "./routes/doctor-helper/doctor-helper-routes.js";
import appointmentRoutes from "./routes/appointment/appointment-routes.js";
import patientRoutes from "./routes/patient/patient-routes.js";

dotenv.config();
const server = new Hono();

server.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    maxAge: 3600,
  }),
);

server.use(logger());

server.get("/", (c) => {
  return c.text("Hello from the server");
});

server.get("/health", (c) => {
  return c.json({ status: "ok" });
});

server.route("/admin", adminRoutes);
server.route("/doctor", doctorRoutes);
server.route("/doctor-helper", doctorHelperRoutes);
server.route("/appointment", appointmentRoutes);
server.route("/patient", patientRoutes);

const PORT = process.env.PORT || 3000;

console.log(`Server is running on port ${PORT}`);

serve({
  fetch: server.fetch,
  port: PORT,
});
