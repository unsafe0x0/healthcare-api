import db from "../../../prisma/db.js";

const getHelpers = async (c) => {
  try {
    const { id } = c.get("user");

    const doctorHelpers = await db.doctorHelper.findMany({
      where: { doctorId: id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    });

    return c.json({ doctorHelpers }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getHelpers;
