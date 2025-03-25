import db from "../../../prisma/db.js";

const getAllHelpers = async (c) => {
  try {
    const helpers = await db.doctorHelper.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    return c.json({ helpers }, 200);
  } catch (error) {
    return c.json({ error: error.message || "Failed to get all helpers" }, 500);
  }
};

export default getAllHelpers;
