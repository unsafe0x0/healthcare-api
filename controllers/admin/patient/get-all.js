import db from "../../../prisma/db.js";

const getAllPatients = async (c) => {
  try {
    const patients = await db.patient.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    return c.json({ patients }, 200);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getAllPatients;
