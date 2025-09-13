import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import compress from "@fastify/compress";
import multipart from "@fastify/multipart";
import caching from "@fastify/caching";
import etag from "@fastify/etag";
import adminRoutes from "./routes/adminRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import patientRoutes from "./routes/patientRoutes";
import doctorHelperRoutes from "./routes/doctorHelperRoutes";
import additionalPatientRoutes from "./routes/additionaPatientRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import { logRequest } from "./services/AuditLogs";
import { sendEmail } from "./services/SendMail";

const app = fastify({ logger: false });

await app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
await app.register(helmet);
await app.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
  allowList: ["127.0.0.1", "::1"],
});
await app.register(compress, { global: true });
await app.register(multipart, {
  attachFieldsToBody: true,
  limits: { fileSize: 10 * 1024 * 1024 },
});
await app.register(etag);
await app.register(caching);

app.addHook("onRequest", (request, reply, done) => {
  (request as any).startTime = process.hrtime();
  done();
});

app.addHook("onResponse", (request, reply, done) => {
  const method = request.method;
  const url = request.url;
  const status = reply.statusCode;
  const startTime = (request as any).startTime as [number, number];
  const diff = process.hrtime(startTime);
  const timeMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
  console.log(`${method} ${url} ${status} ${timeMs}ms`);
  done();
});

app.get("/", async (request, reply) => {
  reply.header("cache-control", "public, max-age=60");
  return { status: "Healthy" };
});

app.get("/healthcheck", async (request, reply) => {
  reply.header("cache-control", "public, max-age=60");
  return { status: "Healthy" };
});

await adminRoutes(app);
await doctorRoutes(app);
await patientRoutes(app);
await doctorHelperRoutes(app);
await additionalPatientRoutes(app);
await appointmentRoutes(app);

app.addHook("onResponse", async (request, reply) => {
  if (request.url === "/favicon.ico" || request.url === "/") {
    return;
  }

  await logRequest({
    method: request.method,
    url: request.url,
    action: `${request.method} ${request.url}`,
    userId: request.user?.id,
    role: request.user?.role,
    ip: request.ip,
  });
});

const start = async () => {
  try {
    const PORT = parseInt(process.env.PORT || "3000", 10);
    await app.listen({ port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
