import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import DbClient from "../../prisma/DbClient";
import { hashPassword } from "../../utils/hashPassword";

const signupSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().min(10).max(15).optional().nullable(),
    password: z.string().min(6),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone must be provided",
    path: ["email"],
  });

const patientSignup = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const result = signupSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send(result.error);
    }

    const { name, email, phone, password } = result.data;
    const existingUser = await DbClient.patient.findFirst({
      where: email ? { email } : { phone },
    });

    if (existingUser) {
      return reply.status(409).send({ error: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    await DbClient.patient.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return reply.status(201).send({ message: "Signup successful" });
  } catch (error) {
    console.error("Error signing up:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default patientSignup;
