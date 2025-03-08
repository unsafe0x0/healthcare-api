import db from "../../../prisma/db";
import { hashPassword } from "../../../utils/hash-password.js";
import { uploadImage } from "../../../utils/cloudinary.js";

const addHelper = async (c) => {
  try {
    const { id } = c.get("user");

    const { name, email, password, profileImage } = await c.req.json();

    if (!name || !email || !password || !profileImage) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const normalizedEmail = email.toLowerCase();

    const helper = await db.doctorHelper.findUnique({ where: { email } });

    if (helper) {
      return c.json({ error: "Helper already exists" }, 400);
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const { url } = await uploadImage(profileImage, slug, "doctor-helper");
    const hashedPassword = await hashPassword(password);

    const newHelper = await db.doctorHelper.create({
      data: {
        slug,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        profileImage: url,
        doctorId: id,
      },
    });

    return c.json(
      { message: "Helper added Successfully", helper: newHelper },
      200,
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default addHelper;
