import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

const patientDashboard = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = (request as any).user;

  if (!user || user.role !== "patient") {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    const patient = await DbClient.patient.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        appointments: {
          select: {
            id: true,
            date: true,
            time: true,
            subject: true,
            status: true,
            doctor: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return reply.status(404).send({ error: "Patient not found" });
    }

    return reply.status(200).send({ data: patient });
  } catch (error) {
    console.error("Patient dashboard error:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default patientDashboard;
