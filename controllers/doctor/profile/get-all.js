import db from "../../../prisma/db.js";

const getAllDoctor = async (c) => {
  try {
    const doctors = await db.doctor.findMany({
      select: {
        slug: true,
        name: true,
        email: true,
        specialty: true,
        qualification: true,
        profileImage: true,
        totalAppointments: true,
        address: true,
      },
    });

    return c.json({ doctors }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getAllDoctor;
