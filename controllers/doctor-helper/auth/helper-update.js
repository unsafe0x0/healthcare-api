import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";
import { uploadImage } from "../../../utils/cloudinary.js";

const updateHelper = async (c) => {
  try {
    const formData = await c.req.formData();

    const { id } = c.get("user");

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const profileImage = formData.get("profileImage");

    if (!id) {
      return c.json({ error: "Helper ID is required" }, 400);
    }

    const helper = await db.doctorHelper.findUnique({ where: { id } });
    if (!helper) {
      return c.json({ error: "Helper not found" }, 404);
    }

    const updatedData = {};

    if (name) updatedData.name = name;
    if (email) updatedData.email = email.toLowerCase();
    if (password) updatedData.password = await hashPassword(password);

    if (profileImage) {
      const slug = (name || helper.name).toLowerCase().replace(/\s+/g, "-");
      const imageBuffer = await profileImage.arrayBuffer();
      const { url } = await uploadImage(imageBuffer, slug, "doctor-helper");
      updatedData.profileImage = url;
    }

    const updatedHelper = await db.doctorHelper.update({
      where: { id },
      data: updatedData,
    });

    return c.json(
      { message: "Helper updated successfully", helper: updatedHelper },
      200
    );
  } catch (error) {
    console.error("Error updating helper:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default updateHelper;
