import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";
import { uploadImage } from "../../../utils/cloudinary.js";

const addHelper = async (c) => {
  try {
    const { id } = c.get("user");
    const formData = await c.req.formData();

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const profileImage = formData.get("profileImage");

    if (!name || !email || !password || !profileImage) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const normalizedEmail = email.toLowerCase();
    const existingHelper = await db.doctorHelper.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingHelper) {
      return c.json({ error: "Helper already exists" }, 400);
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const imageBuffer = await profileImage.arrayBuffer();
    const { url } = await uploadImage(imageBuffer, slug, "doctor-helper");
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
      201
    );
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default addHelper;
