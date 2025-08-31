import db from "../../prisma/db";

const getPatients = async (c) => {
  try {
    const patients = await db.additionalPatients.findMany();
    if (!patients) {
      return c.json({ message: "Patients not found" }, 404);
    }
    return c.json({ message: "Fetched patients", patients });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return c.json({ message: "Error fetching patients" }, 500);
  }
};

export default getPatients;
