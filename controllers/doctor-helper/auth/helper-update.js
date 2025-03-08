import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";

const helperUpdate = async (c) => {
  try {
    const helper = c.get("user");
    if (!helper) return c.json({ error: "Unauthorized" }, 401);

    const { name, email, password, profileImage } = await c.req.json();

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
      const { url } = await uploadImage(profileImage, slug, "helper");
      updatedData.profileImage = url;
    }

    const updatedHelper = await db.helper.update({
      where: { id: helper.id },
      data: {
        ...updatedData,
      },
    });

    return c.json({ message: "Helper updated successfully" }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default helperUpdate;
