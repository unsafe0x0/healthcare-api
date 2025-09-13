import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

const allHelpers = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as any;

  if (!user || (user.role !== "doctor" && user.role !== "admin")) {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    const helpers = await DbClient.doctorHelper.findMany({});

    return reply
      .status(200)
      .send({ message: "Doctor helpers fetched successfully", data: helpers });
  } catch (error) {
    console.error("Error fetching doctor helpers:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default allHelpers;
