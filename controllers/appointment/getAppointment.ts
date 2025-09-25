import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

interface AppointmentRequest {
  Params: {
    appointmentId: string;
  };
}

const getAppointment = async (
  request: FastifyRequest<AppointmentRequest>,
  reply: FastifyReply,
) => {
  const user = (request as any).user;

  if (
    !user ||
    (user.role !== "patient" &&
      user.role !== "doctor" &&
      user.role !== "doctorhelper" &&
      user.role !== "admin")
  ) {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    const { appointmentId } = request.params;

    let where: any = { appointmentId };

    if (user.role === "patient") {
      where.patientId = user.id;
    } else if (user.role === "doctor") {
      where.doctorId = user.id;
    } else if (user.role === "doctorhelper") {
      const helper = await DbClient.doctorHelper.findUnique({
        where: { id: user.id },
        select: { doctorId: true },
      });
      if (!helper) {
        return reply.status(403).send({ error: "Forbidden" });
      }
      where.doctorId = helper.doctorId;
    }

    const appointmentData = await DbClient.appointment.findFirst({
      where,
      select: {
        appointmentId: true,
        date: true,
        time: true,
        subject: true,
        status: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            specialty: true,
            qualification: true,
            profileImage: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!appointmentData) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    return reply.status(200).send({
      message: "Appointment fetched successfully",
      data: appointmentData,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default getAppointment;
