import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

const adminDashboard = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || user.role !== "admin") {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    let data: any;

    const admin = await DbClient.admin.findUnique({
      where: { id: user.id },
    });

    if (!admin) {
      return reply.status(404).send({ error: "Admin not found" });
    }

    const doctors = await DbClient.doctor.findMany({});
    const patients = await DbClient.patient.findMany({});
    const doctorHelpers = await DbClient.doctorHelper.findMany({});
    const totalDoctors = doctors.length;
    const totalPatients = patients.length;
    const totalHelpers = doctorHelpers.length;
    const totalAppointments = await DbClient.appointment.count();

    data = {
      admin: {
        ...admin,
        totalDoctors,
        totalPatients,
        totalHelpers,
        totalAppointments,
      },
      doctors,
      patients,
      doctorHelpers,
    };

    return reply.status(200).send({ data });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default adminDashboard;
