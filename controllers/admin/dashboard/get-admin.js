import db from "../../../prisma/db.js";

const getAdmin = async (c) => {
  try {
    const { id } = c.get("user");

    const admin = await db.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!admin) {
      return c.json({ error: "Admin not found" }, 404);
    }

    return c.json({ admin }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getAdmin;
