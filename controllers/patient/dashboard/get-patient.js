import db from "../../../prisma/db.js";

const getPatient = async (c) => {
  try {
    const { id } = c.get("user");

    const patient = await db.patient.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        appointments: {
          select: {
            id: true,
            date: true,
            time: true,
            subject: true,
            status: true,
            doctor: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return c.json({ patient }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getPatient;
