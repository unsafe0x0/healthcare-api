import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";
import { hashPassword } from "../../utils/hashPassword";
import { uploadImage } from "../../utils/cloudinary";

const helperSignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string(),
  qualification: z.string(),
  dob: z.string(),
  gender: z.string(),
});

const helperSignup = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || user.role !== "doctor") {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const body = request.body as any;
    const extractValue = (field: any) =>
      field && typeof field === "object" && "value" in field
        ? field.value
        : field;
    const fields = {
      name: extractValue(body.name),
      email: extractValue(body.email),
      password: extractValue(body.password),
      phone: extractValue(body.phone),
      qualification: extractValue(body.qualification),
      dob: extractValue(body.dob),
      gender: extractValue(body.gender),
    };
    const parsed = helperSignupSchema.safeParse(fields);

    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    const { name, email, password, qualification, phone, dob, gender } =
      parsed.data;

    const normalizedEmail = email.toLowerCase();

    const existingHelper = await DbClient.doctorHelper.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingHelper) {
      return reply.status(400).send({ error: "Helper already exists" });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const file = body.profileImage;
    if (!file || typeof file.toBuffer !== "function") {
      return reply.status(400).send({ error: "Profile image is required" });
    }

    const imageBuffer = await file.toBuffer();
    if (imageBuffer.length === 0) {
      return reply
        .status(400)
        .send({ error: "Uploaded profile image is empty" });
    }
    const { url } = await uploadImage(imageBuffer, slug, "doctor-helper");

    const hashedPassword = await hashPassword(password);

    await DbClient.doctorHelper.create({
      data: {
        slug,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        qualification: qualification,
        profileImage: url,
        phone: phone,
        dob: dob,
        gender: gender,
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
