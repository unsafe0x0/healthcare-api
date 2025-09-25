import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

const helperDashboard = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const user = (request as any).user;

  if (!user || user.role !== "doctorhelper") {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    const helper = await DbClient.doctorHelper.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        qualification: true,
        phone: true,
        dob: true,
        gender: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true,
            qualification: true,
            profileImage: true,
            totalAppointments: true,
            schedules: true,
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
            additionalPatients: {
              select: {
                id: true,
                name: true,
                phone: true,
                subject: true,
                consultationFee: true,
                date: true,
                time: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!helper) {
      return reply.status(404).send({ error: "Helper not found" });
    }

    return reply
      .status(200)
      .send({ message: "Dashboard data fetched successfully", data: helper });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default helperDashboard;
