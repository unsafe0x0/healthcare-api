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
  dob: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  consultationFee: z.number().nullable().optional(),
  yearsOfExperience: z.number().nullable().optional(),
  profileImage: z
    .object({
      data: z.array(z.number()),
      name: z.string(),
      type: z.string(),
    })
    .optional(),
});

const doctorUpdate = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || (user.role !== "admin" && user.role !== "doctor")) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const parsed = doctorUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
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
      profileImage,
    } = parsed.data;

    const existingDoctor = await DbClient.doctor.findUnique({
      where: { id },
    });

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

    if (email) updateData.email = email.toLowerCase();
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

    if (profileImage) {
      const imageBuffer = Buffer.from(profileImage.data);
      const arrayBuffer = imageBuffer.buffer.slice(
        imageBuffer.byteOffset,
        imageBuffer.byteOffset + imageBuffer.byteLength
      );
      const { url } = (await uploadImage(
        arrayBuffer,
        updateData.slug || existingDoctor.slug,
        "doctor"
      )) as { url: string };
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
