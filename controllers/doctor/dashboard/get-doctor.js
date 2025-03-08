import db from "../../../prisma/db.js";

const getDoctor = async (c) => {
  try {
    const { id } = c.get("user");

    const doctor = await db.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        email: true,
        specialty: true,
        qualification: true,
        profileImage: true,
        totalAppointments: true,
        doctorHelpers: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        appointments: {
          select: {
            id: true,
            date: true,
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
    });

    if (!doctor) return c.json({ error: "Doctor does not exist" }, 400);

    return c.json({ doctor }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getDoctor;
