import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";
import { hashPassword } from "../../utils/hashPassword";
import { uploadImage } from "../../utils/cloudinary";

const helperUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  qualification: z.string().optional(),
  phone: z.string().optional(),
  dob: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  profileImage: z
    .object({
      data: z.array(z.number()),
      name: z.string(),
      type: z.string(),
    })
    .optional(),
});

const helperUpdate = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || (user.role !== "doctor" && user.role !== "doctorhelper")) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const parsed = helperUpdateSchema.safeParse(request.body);

    if (!parsed.success) {
      console.log("Validation errors:", parsed.error.issues);
      return reply.status(400).send({ error: parsed.error.issues });
    }

    const {
      id,
      name,
      email,
      password,
      qualification,
      phone,
      dob,
      gender,
      profileImage,
    } = parsed.data;

    const existingHelper = await DbClient.doctorHelper.findUnique({
      where: { id },
    });

    if (!existingHelper) {
      return reply.status(404).send({ error: "Helper not found" });
    }

    const updateData: any = {};

    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, "-");
    }

    if (email) {
      const emailOwner = await DbClient.doctorHelper.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (emailOwner && emailOwner.id !== id) {
        return reply.status(400).send({ error: "Email already in use" });
      }
      updateData.email = email.toLowerCase();
    }

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (qualification !== undefined)
      updateData.qualification = qualification || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (dob !== undefined) updateData.dob = dob || null;
    if (gender !== undefined) updateData.gender = gender || null;

    if (profileImage) {
      const imageBuffer = Buffer.from(profileImage.data);
      const arrayBuffer = imageBuffer.buffer.slice(
        imageBuffer.byteOffset,
        imageBuffer.byteOffset + imageBuffer.byteLength,
      );
      const { url } = (await uploadImage(
        arrayBuffer,
        updateData.slug || existingHelper.slug,
        "doctorhelper",
      )) as { url: string };
      updateData.profileImage = url;
    }

    await DbClient.doctorHelper.update({
      where: { id },
      data: updateData,
    });

    return reply.status(200).send({ message: "Helper updated successfully" });
  } catch (error) {
    console.error("Helper update error:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default helperUpdate;
