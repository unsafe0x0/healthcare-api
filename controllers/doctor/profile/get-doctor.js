import db from "../../../prisma/db.js";

const getDoctorProfile = async (c) => {
  try {
    const { slug } = c.req.query();

    if (!slug) {
      return c.json({ error: "Doctor slug is required" }, 400);
    }

    const doctor = await db.doctor.findUnique({
      where: { slug },
      select: {
        slug: true,
        name: true,
        email: true,
        specialty: true,
        qualification: true,
        profileImage: true,
        totalAppointments: true,
        phone: true,
        address: true,
        schedules: true,
        yearsOfExperience: true,
        consultationFee: true,
        gender: true,
      },
    });

    if (!doctor) {
      return c.json({ error: "Doctor does not exist" }, 400);
    }

    return c.json(doctor, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getDoctorProfile;
