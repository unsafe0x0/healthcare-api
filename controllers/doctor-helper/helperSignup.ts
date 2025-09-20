import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";
import { hashPassword } from "../../utils/hashPassword";
import { uploadImage } from "../../utils/cloudinary";

const helperSignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  qualification: z.string().optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  profileImage: z
    .object({
      data: z.array(z.number()),
      name: z.string(),
      type: z.string(),
    })
    .optional(),
});

const helperSignup = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || user.role !== "doctor") {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const parsed = helperSignupSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    const {
      name,
      email,
      password,
      qualification,
      phone,
      dob,
      gender,
      profileImage,
    } = parsed.data;

    if (!profileImage) {
      return reply.status(400).send({ error: "Profile image is required" });
    }

    const normalizedEmail = email.toLowerCase();

    const existingHelper = await DbClient.doctorHelper.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingHelper) {
      return reply.status(400).send({ error: "Helper already exists" });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const imageBuffer = Buffer.from(profileImage.data);
    const arrayBuffer = imageBuffer.buffer.slice(
      imageBuffer.byteOffset,
      imageBuffer.byteOffset + imageBuffer.byteLength,
    );

    const { url } = (await uploadImage(arrayBuffer, slug, "doctorhelper")) as {
      url: string;
    };

    const hashedPassword = await hashPassword(password);

    await DbClient.doctorHelper.create({
      data: {
        slug,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        qualification: qualification || null,
        profileImage: url,
        phone: phone || null,
        dob: dob || null,
        gender: gender || null,
        doctorId: user.id,
      },
    });

    return reply.status(201).send({ message: "Signup Successful" });
  } catch (error) {
    console.error("Helper signup error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default helperSignup;
