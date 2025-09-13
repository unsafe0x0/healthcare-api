import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import DbClient from "../../prisma/DbClient";
import { hashPassword } from "../../utils/hashPassword";

const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(6).optional(),
  })
  .refine((data) => data.email || data.phone || data.name || data.password, {
    message: "At least one field must be provided",
    path: ["name", "email", "phone", "password"],
  });

const patientUpdate = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user as any;

  if (!user || user.role !== "patient") {
    return reply.status(403).send("Forbidden");
  }
  try {
    const result = updateSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send(result.error);
    }

    const { name, email, phone, password } = result.data;

    const updateData: any = { name, email, phone };

    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await DbClient.patient.update({
      where: { id: user.id },
      data: updateData,
    });

    reply.send({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating patient:", error);
    reply.status(500).send("Internal Server Error");
  }
};

export default patientUpdate;
