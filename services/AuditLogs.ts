import DbClient from "../prisma/DbClient";

interface AuditLogData {
  method: string;
  url: string;
  action: string;
  userId?: string;
  role?: string;
  ip?: string;
}

export async function logRequest(data: AuditLogData) {
  try {
    await DbClient.auditLog.create({
      data: {
        method: data.method,
        url: data.url,
        action: data.action,
        userId: data.userId ?? null,
        role: data.role ?? null,
        ip: data.ip ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
