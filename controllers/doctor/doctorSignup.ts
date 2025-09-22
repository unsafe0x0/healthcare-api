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
  consultationFee: z.number().optional().nullable(),
  yearsOfExperience: z.number().optional().nullable(),
});

const doctorSignup = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || user.role !== "admin") {
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
      specialty: extractValue(body.specialty),
      qualification: extractValue(body.qualification),
      phone: extractValue(body.phone),
      address: extractValue(body.address),
      dob: extractValue(body.dob),
      gender: extractValue(body.gender),
      consultationFee: body.consultationFee,
      yearsOfExperience: body.yearsOfExperience,
    };
    const parsed = doctorSignupSchema.safeParse(fields);

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
    } = parsed.data;

    const normalizedEmail = email.toLowerCase();

    const existingDoctor = await DbClient.doctor.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingDoctor) {
      return reply.status(400).send({ error: "Doctor already exists" });
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
    const { url } = await uploadImage(imageBuffer, slug, "doctor");

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
        consultationFee: consultationFee,
        yearsOfExperience: yearsOfExperience,
      },
    });

    return reply.status(201).send({ message: "Signup Successful" });
  } catch (error) {
    console.error("Doctor signup error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default doctorSignup;
