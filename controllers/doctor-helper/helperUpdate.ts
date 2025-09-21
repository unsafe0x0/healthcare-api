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
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
});

const helperUpdate = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || (user.role !== "doctor" && user.role !== "doctorhelper")) {
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
      qualification: extractValue(body.qualification),
      phone: extractValue(body.phone),
      dob: body.dob !== undefined ? extractValue(body.dob) : undefined,
      gender: body.gender !== undefined ? extractValue(body.gender) : undefined,
    };

    const parsed = helperUpdateSchema.safeParse(fields);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues });
    }

    const { id, name, email, password, qualification, phone, dob, gender } =
      parsed.data;

    const existingHelper = await DbClient.doctorHelper.findUnique({
      where: { id },
    });
    if (!existingHelper) {
      return reply.status(404).send({ error: "Helper not found" });
    }

    if (user.role === "doctorhelper" && user.id !== id) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const updateData: any = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, "-");
    }
    if (email) {
      const normalizedEmail = email.toLowerCase();
      const emailOwner = await DbClient.doctorHelper.findUnique({
        where: { email: normalizedEmail },
      });
      if (emailOwner && emailOwner.id !== id) {
        return reply.status(400).send({ error: "Email already in use" });
      }
      updateData.email = normalizedEmail;
    }
    if (password) {
      updateData.password = await hashPassword(password);
    }
    if (qualification !== undefined)
      updateData.qualification = qualification !== "" ? qualification : null;
    if (phone !== undefined) updateData.phone = phone !== "" ? phone : null;
    if (dob !== undefined) updateData.dob = dob !== "" ? dob : null;
    if (gender !== undefined) updateData.gender = gender !== "" ? gender : null;

    let file = body.profileImage;
    if (file && typeof file.toBuffer === "function") {
      const imageBuffer = await file.toBuffer();
      if (imageBuffer.length > 0) {
        const { url } = await uploadImage(
          imageBuffer,
          updateData.slug || existingHelper.slug,
          "doctorhelper"
        );
        updateData.profileImage = url;
      }
    } else if (file && file.data && Array.isArray(file.data)) {
      const imageBuffer = Buffer.from(file.data);
      const { url } = await uploadImage(
        imageBuffer,
        updateData.slug || existingHelper.slug,
        "doctorhelper"
      );
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
