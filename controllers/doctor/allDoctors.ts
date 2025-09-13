import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

const allDoctors = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const doctors = await DbClient.doctor.findMany({
      select: {
        slug: true,
        name: true,
        email: true,
        gender: true,
        profileImage: true,
        specialty: true,
        qualification: true,
        yearsOfExperience: true,
        consultationFee: true,
        totalAppointments: true,
        address: true,
      },
    });

    return reply
      .status(200)
      .send({ message: "Doctors fetched successfully", data: doctors });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default allDoctors;
