import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import DbClient from "../../prisma/DbClient";
import { generateToken } from "../../utils/generateToken";
import { comparePassword } from "../../utils/comparePassword";

const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15).optional(),
    password: z.string().min(6),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone must be provided",
    path: ["email", "phone"],
  });

const patientLogin = async (request: FastifyRequest, reply: FastifyReply) => {
  const result = loginSchema.safeParse(request.body);

  if (!result.success) {
    return reply.status(400).send(result.error);
  }

  const { email, phone, password } = result.data;

  try {
    const user = await DbClient.patient.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id, "patient");

    return reply.status(200).send({
      message: "Login Successful",
      token,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    reply.status(500).send("Internal Server Error");
  }
};

export default patientLogin;
