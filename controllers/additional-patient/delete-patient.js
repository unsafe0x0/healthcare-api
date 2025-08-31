import db from "../../prisma/db";

const deletePatient = async (c) => {
  try {
    const { id } = await c.req.json();
    const patient = await db.additionalPatients.delete({
      where: { id },
    });
    return c.json({ message: "Deleted patient", data: patient });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return c.json({ message: "Error deleting patient" }, 500);
  }
};

export default deletePatient;
