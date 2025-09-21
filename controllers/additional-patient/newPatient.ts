import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";

const newPatientSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10).max(15),
  subject: z.string().min(2),
  consultationFee: z.number().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

const newPatient = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || user.role !== "doctorhelper") {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    const result = newPatientSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({ error: result.error.issues });
    }

    const helper = await DbClient.doctorHelper.findUnique({
      where: { id: user.id },
    });

    if (!helper) {
      return reply.status(404).send({ error: "Helper not found" });
    }

    const doctorId = helper.doctorId;

    if (!doctorId) {
      return reply.status(400).send({ error: "Associated doctor not found" });
    }

    const { name, phone, subject } = result.data;

    await DbClient.additionalPatients.create({
      data: {
        name,
        phone,
        subject,
        consultationFee: result.data.consultationFee || 0,
        date: result.data.date || "",
        time: result.data.time || "",
        doctorId: doctorId,
      },
    });

    return reply
      .status(201)
      .send({ message: "New additional patient created" });
  } catch (error) {
    console.error("Error creating new additional patient:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default newPatient;
