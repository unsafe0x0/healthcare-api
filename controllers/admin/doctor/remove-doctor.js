import db from "../../../prisma/db.js";

const removeDoctor = async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ error: "Doctor ID is required" }, 400);
    }

    await db.doctor.delete({ where: { id } });

    return c.json({ message: "Doctor removed successfully" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default removeDoctor;
