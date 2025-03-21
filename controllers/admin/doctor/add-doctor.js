import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";
import { uploadImage } from "../../../utils/cloudinary.js";

const doctorSignup = async (c) => {
  try {
    const formData = await c.req.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const specialty = formData.get("specialty");
    const qualification = formData.get("qualification");
    const phone = formData.get("phone");
    const address = formData.get("address");
    const profileImage = formData.get("profileImage");

    if (
      !name ||
      !email ||
      !password ||
      !specialty ||
      !qualification ||
      !profileImage ||
      !phone ||
      !address
    ) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const normalizedEmail = email.toLowerCase();
    const existingDoctor = await db.doctor.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingDoctor) {
      return c.json({ error: "Doctor already exists" }, 400);
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const imageBuffer = await profileImage.arrayBuffer();
    const { url } = await uploadImage(imageBuffer, slug, "doctor");

    const hashedPassword = await hashPassword(password);

    await db.doctor.create({
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
      },
    });

    return c.json({ message: "Signup Successful" }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default doctorSignup;
