import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";
import { uploadImage } from "../../../utils/cloudinary.js";

const doctorUpdate = async (c) => {
  try {
    const doctor = c.get("user");
    if (!doctor) return c.json({ error: "Unauthorized" }, 401);

    const {
      name,
      email,
      password,
      specialty,
      qualification,
      profileImage,
      phone,
      address,
    } = await c.req.json();

    const updatedData = {};
    if (name) {
      updatedData.name = name;
    }
    if (email) {
      updatedData.email = email.toLowerCase();
    }
    if (specialty) {
      updatedData.specialty = specialty;
    }
    if (qualification) {
      updatedData.qualification = qualification;
    }
    if (phone) {
      updatedData.phone = phone;
    }
    if (address) {
      updatedData.address = address;
    }
    if (password) {
      updatedData.password = await hashPassword(password);
    }

    if (profileImage && name) {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const { url } = await uploadImage(profileImage, slug, "doctor");
      updatedData.profileImage = url;
    }

    await db.doctor.update({
      where: { id: doctor.id },
      data: {
        ...updatedData,
      },
    });

    return c.json({ message: "Doctor updated successfully" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default doctorUpdate;
