import db from "../../../prisma/db.js";

const deleteDoctor = async (c) => {
  try {
    const { id } = c.get("user");

    await db.doctor.delete({ where: { id } });

    return c.json({ message: "Doctor removed successfully" }, 204);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Doctor not found" }, 404);
  }
};

export default deleteDoctor;
