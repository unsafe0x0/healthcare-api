import DbClient from "../prisma/DbClient";
import type { FastifyRequest } from "fastify";

interface AuditLogData {
  method: string;
  url: string;
  action: string;
  userId?: string;
  role?: string;
  ip?: string;
}

export async function logRequest(
  req: FastifyRequest,
  data: Omit<AuditLogData, "ip">,
) {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.ip ||
    req.socket.remoteAddress;

  try {
    await DbClient.auditLog.create({
      data: {
        method: data.method,
        url: data.url,
        action: data.action,
        userId: data.userId ?? null,
        role: data.role ?? null,
        ip,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
