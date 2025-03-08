import db from "../../../prisma/db.js";

const removePatient = async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ error: "Patient ID is required" }, 400);
    }

    await db.patient.delete({ where: { id } });

    return c.json({ message: "Patient removed successfully" }, 200);
  } catch (error) {
    console.error("Error removing patient:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default removePatient;
