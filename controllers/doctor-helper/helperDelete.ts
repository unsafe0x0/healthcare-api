import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

interface HelperDeleteRequest {
  Params: {
    id: string;
  };
}

const helperDelete = async (
  request: FastifyRequest<HelperDeleteRequest>,
  reply: FastifyReply,
) => {
  const user = (request as any).user;

  if (!user || (user.role !== "doctor" && user.role !== "doctorhelper")) {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    await DbClient.doctorHelper.delete({
      where: { id: request.params.id },
    });
    return reply
      .status(204)
      .send({ message: "Doctor helper deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor helper:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default helperDelete;
