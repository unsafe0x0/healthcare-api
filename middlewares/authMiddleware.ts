import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: string;
}

export function authMiddleware(roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers["authorization"];
      const token = authHeader?.replace("Bearer ", "");

      if (!token) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      if (!roles.includes(decoded.role)) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      (request as any).user = {
        id: decoded.id,
        role: decoded.role.toLowerCase(),
      };

      return;
    } catch (error) {
      request.log.error(error);
      return reply.status(401).send({ error: "Unauthorized" });
    }
  };
}
