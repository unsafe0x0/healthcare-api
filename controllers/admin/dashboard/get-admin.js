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

    const totalPatients = await db.patient.count();
    const totalDoctors = await db.doctor.count();
    const totalAppointments = await db.appointment.count();

    return c.json(
      {
        admin: {
          ...admin,
          totalPatients,
          totalDoctors,
          totalAppointments,
        },
      },
      200
    );
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getAdmin;
