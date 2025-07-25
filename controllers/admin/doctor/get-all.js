import db from "../../../prisma/db.js";

const getAllDoctors = async (c) => {
  try {
    const doctors = await db.doctor.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        qualification: true,
        profileImage: true,
        phone: true,
        address: true,
        totalAppointments: true,
        yearsOfExperience: true,
        gender: true,
        consultationFee: true,
        dob: true,
      },
    });

    return c.json({ doctors }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getAllDoctors;
