import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";
import { generateToken } from "../../utils/generateToken";
import { comparePassword } from "../../utils/comparePassword";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const doctorLogin = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = loginSchema.safeParse(request.body);

    if (!body.success) {
      return reply.status(400).send({ error: body.error.issues });
    }

    const { email, password } = body.data;

    const normalizedEmail = email.toLowerCase();

    const doctor = await DbClient.doctor.findUnique({
      where: { email: normalizedEmail },
    });

    if (!doctor) {
      return reply.status(400).send({ error: "Invalid Email or Password" });
    }

    const isMatch = await comparePassword(password, doctor.password);

    if (!isMatch) {
      return reply.status(400).send({ error: "Invalid Email or Password" });
    }

    const token = generateToken(doctor.id, "doctor");

    return reply.status(200).send({
      message: "Login Successful",
      token,
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default doctorLogin;
