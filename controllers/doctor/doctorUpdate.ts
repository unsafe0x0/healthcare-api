import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";
import { hashPassword } from "../../utils/hashPassword";
import { uploadImage } from "../../utils/cloudinary";

const doctorUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  specialty: z.string().optional(),
  qualification: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  consultationFee: z.number().optional().nullable(),
  yearsOfExperience: z.number().optional().nullable(),
});

const doctorUpdate = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  if (!user || (user.role !== "admin" && user.role !== "doctor")) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const body = request.body as any;
    const extractValue = (field: any) =>
      field && typeof field === "object" && "value" in field
        ? field.value
        : field;
    const fields = {
      id: extractValue(body.id),
      name: extractValue(body.name),
      email: extractValue(body.email),
      password: extractValue(body.password),
      specialty: extractValue(body.specialty),
      qualification: extractValue(body.qualification),
      phone: extractValue(body.phone),
      address: extractValue(body.address),
      dob: extractValue(body.dob),
      gender: extractValue(body.gender),
      consultationFee: extractValue(body.consultationFee)
        ? parseInt(extractValue(body.consultationFee), 10)
        : null,
      yearsOfExperience: extractValue(body.yearsOfExperience)
        ? parseInt(extractValue(body.yearsOfExperience), 10)
        : null,
    };

    const parsed = doctorUpdateSchema.safeParse(fields);
    if (!parsed.success) {
      console.log(parsed.error);
      return reply.status(400).send({ error: parsed.error.issues });
    }

    const {
      id,
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

    const existingDoctor = await DbClient.doctor.findUnique({ where: { id } });
    if (!existingDoctor) {
      return reply.status(404).send({ error: "Doctor not found" });
    }

    if (user.role === "doctor" && user.id !== id) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const updateData: any = {};

    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    if (email) {
      const normalizedEmail = email.toLowerCase();
      const emailConflict = await DbClient.doctor.findUnique({
        where: { email: normalizedEmail },
      });
      if (emailConflict && emailConflict.id !== id) {
        return reply.status(400).send({ error: "Email already in use" });
      }
      updateData.email = normalizedEmail;
    }

    if (password) updateData.password = await hashPassword(password);
    if (specialty) updateData.specialty = specialty;
    if (qualification) updateData.qualification = qualification;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (dob !== undefined) updateData.dob = dob !== "" ? dob : null;
    if (gender !== undefined) updateData.gender = gender !== "" ? gender : null;
    if (consultationFee !== undefined)
      updateData.consultationFee = consultationFee;
    if (yearsOfExperience !== undefined)
      updateData.yearsOfExperience = yearsOfExperience;

    const file = body.profileImage;
    if (file) {
      const { url } = await uploadImage(
        file,
        updateData.slug || existingDoctor.slug,
        "doctor",
      );
      updateData.profileImage = url;
    }

    await DbClient.doctor.update({
      where: { id },
      data: updateData,
    });

    return reply.status(200).send({ message: "Doctor updated successfully" });
  } catch (error) {
    console.error("Doctor update error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default doctorUpdate;
