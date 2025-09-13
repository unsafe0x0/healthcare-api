import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";

interface DoctorProfileRequest {
  Params: {
    slug: string;
  };
}

const doctorProfile = async (
  request: FastifyRequest<DoctorProfileRequest>,
  reply: FastifyReply
) => {
  try {
    const { slug } = request.params;

    const doctors = await DbClient.doctor.findUnique({
      where: {
        slug: slug,
      },
      select: {
        slug: true,
        name: true,
        email: true,
        specialty: true,
        qualification: true,
        profileImage: true,
        totalAppointments: true,
        phone: true,
        address: true,
        schedules: true,
        yearsOfExperience: true,
        consultationFee: true,
        gender: true,
      },
    });

    return reply
      .status(200)
      .send({ message: "Doctor fetched successfully", data: doctors });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default doctorProfile;
