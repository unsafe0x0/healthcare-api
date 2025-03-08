import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";
import { uploadImage } from "../../../utils/cloudinary.js";

const updateHelper = async (c) => {
  try {
    const { id, name, email, password, profileImage } = await c.req.json();

    if (!id) {
      return c.json({ error: "Helper ID is required" }, 400);
    }

    const updatedData = {};

    if (name) {
      updatedData.name = name;
    }
    if (email) {
      updatedData.email = email.toLowerCase();
    }
    if (password) {
      updatedData.password = await hashPassword(password);
    }
    if (profileImage) {
      const slug = name.toLowerCase().split(" ").join("-");
      const { url } = await uploadImage(profileImage, slug, "doctor-helper");
      updatedData.profileImage = url;
    }

    const updatedHelper = await db.doctorHelper.update({
      where: { id },
      data: {
        ...updatedData,
      },
    });

    return c.json(
      { message: "Helper updated successfully", helper: updatedHelper },
      200,
    );
  } catch (error) {
    console.error("Error updating helper:", error.message);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default updateHelper;
