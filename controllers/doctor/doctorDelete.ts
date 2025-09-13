import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

interface DoctorDeleteRequest {
  Params: {
    id: string;
  };
}

const doctorDelete = async (
  request: FastifyRequest<DoctorDeleteRequest>,
  reply: FastifyReply,
) => {
  const user = (request as any).user;

  if (!user || (user.role !== "doctor" && user.role !== "admin")) {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    await DbClient.doctor.delete({
      where: { id: request.params.id },
    });
    return reply.status(204).send({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default doctorDelete;
