import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

const doctorDashboard = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = (request as any).user;

  if (!user || user.role !== "doctor") {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    const doctor = await DbClient.doctor.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        slug: true,
        name: true,
        email: true,
        specialty: true,
        qualification: true,
        address: true,
        phone: true,
        profileImage: true,
        totalAppointments: true,
        yearsOfExperience: true,
        consultationFee: true,
        gender: true,
        dob: true,
        schedules: true,
        doctorHelpers: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            qualification: true,
            phone: true,
            dob: true,
            gender: true,
          },
        },
        appointments: {
          select: {
            id: true,
            appointmentId: true,
            date: true,
            time: true,
            subject: true,
            status: true,
            patient: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const totalAppointments = await DbClient.appointment.count({
      where: { doctorId: user.id },
    });

    const uniquePatients = await DbClient.appointment.findMany({
      where: { doctorId: user.id },
      select: { patientId: true },
      distinct: ["patientId"],
    });

    const totalPatients = uniquePatients.length;

    const totalHelpers = await DbClient.doctorHelper.count({
      where: { doctorId: user.id },
    });

    const doctorData = {
      ...doctor,
      totalAppointments,
      totalPatients,
      totalHelpers,
    };

    return reply.send({
      message: "Doctor dashboard data",
      doctor: doctorData,
    });
  } catch (error) {
    console.error("Error in doctorDashboard:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default doctorDashboard;
