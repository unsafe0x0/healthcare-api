import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

interface DoctorDeleteRequest {
  Params: {
    id: string;
  };
}

const patientDelete = async (
  request: FastifyRequest<DoctorDeleteRequest>,
  reply: FastifyReply,
) => {
  const user = (request as any).user;

  if (!user || (user.role !== "patient" && user.role !== "admin")) {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    await DbClient.patient.delete({
      where: { id: request.params.id },
    });
    return reply.status(204).send({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default patientDelete;
