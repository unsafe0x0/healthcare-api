import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

interface DeletePatientRequest {
  Params: {
    id: string;
  };
}

const deletePatient = async (
  request: FastifyRequest<DeletePatientRequest>,
  reply: FastifyReply,
) => {
  const user = (request as any).user;

  if (!user || user.role !== "doctorhelper") {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    const { id } = request.params;

    await DbClient.additionalPatients.delete({
      where: { id },
    });

    return reply
      .status(200)
      .send({ message: "Additional patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting additional patient:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default deletePatient;
