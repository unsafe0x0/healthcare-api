import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";
import { hashPassword } from "../../utils/hashPassword";

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const adminSignup = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = signupSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: body.error.issues });
    }

    const { name, email, password } = body.data;

    const normalizedEmail = email.toLowerCase();

    const existingAdmin = await DbClient.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      return reply.status(400).send({ error: "Admin already exists" });
    }

    const hashedPassword = await hashPassword(password);

    await DbClient.admin.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return reply.status(200).send({ message: "Signup Successful" });
  } catch (error) {
    console.error("Admin signup error:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default adminSignup;
