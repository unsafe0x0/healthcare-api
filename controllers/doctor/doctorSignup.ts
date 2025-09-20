import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";
import { hashPassword } from "../../utils/hashPassword";
import { uploadImage } from "../../utils/cloudinary";

const doctorSignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  specialty: z.string(),
  qualification: z.string(),
  phone: z.string(),
  address: z.string(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  consultationFee: z.string().optional().nullable(),
  yearsOfExperience: z.string().optional().nullable(),
  profileImage: z.object({
    data: z.array(z.number()),
    name: z.string(),
    type: z.string(),
  }),
});

const doctorSignup = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || user.role !== "admin") {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const parsed = doctorSignupSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    const {
      name,
      email,
      password,
      specialty,
      qualification,
      phone,
      address,
      dob,
      gender,
      consultationFee,
      yearsOfExperience,
      profileImage,
    } = parsed.data;

    const normalizedEmail = email.toLowerCase();

    const existingDoctor = await DbClient.doctor.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingDoctor) {
      return reply.status(400).send({ error: "Doctor already exists" });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const imageBuffer = Buffer.from(profileImage.data);
    const arrayBuffer = imageBuffer.buffer.slice(
      imageBuffer.byteOffset,
      imageBuffer.byteOffset + imageBuffer.byteLength,
    );
    const { url } = (await uploadImage(arrayBuffer, slug, "doctor")) as {
      url: string;
    };

    const hashedPassword = await hashPassword(password);

    await DbClient.doctor.create({
      data: {
        slug,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        specialty,
        qualification,
        profileImage: url,
        phone,
        address,
        dob: dob || null,
        gender: gender || null,
        consultationFee: consultationFee ? parseInt(consultationFee) : null,
        yearsOfExperience: yearsOfExperience
          ? parseInt(yearsOfExperience)
          : null,
      },
    });

    return reply.status(201).send({ message: "Signup Successful" });
  } catch (error) {
    console.error("Doctor signup error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default doctorSignup;
