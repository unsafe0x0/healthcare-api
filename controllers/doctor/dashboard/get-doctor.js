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
        address: true,
        phone: true,
        profileImage: true,
        totalAppointments: true,
        yearsOfExperience: true,
        consultationFee: true,
        gender: true,
        dob: true,
        schedules: true,
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
    });

    const totalAppointments = await db.appointment.count({
      where: { doctorId: id },
    });

    const uniquePatients = await db.appointment.findMany({
      where: { doctorId: id },
      select: { patientId: true },
      distinct: ["patientId"],
    });

    const totalPatients = uniquePatients.length;

    const totalHelpers = await db.doctorHelper.count({
      where: { doctorId: id },
    });

    return c.json(
      {
        doctor: {
          ...doctor,
          totalAppointments,
          totalPatients,
          totalHelpers,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default getDoctor;
