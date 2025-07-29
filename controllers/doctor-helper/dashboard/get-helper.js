import db from "../../../prisma/db.js";

const getHelper = async (c) => {
  try {
    const { id } = c.get("user");

    const helper = await db.doctorHelper.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            specialty: true,
            qualification: true,
            profileImage: true,
            totalAppointments: true,
            appointments: {
              select: {
                id: true,
                date: true,
                time: true,
                subject: true,
                status: true,
                patient: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!helper) {
      return c.json({ error: "Helper does not exist" }, 400);
    }

    return c.json({ helper }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getHelper;
