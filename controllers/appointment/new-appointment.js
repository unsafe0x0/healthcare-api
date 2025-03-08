import db from "../../prisma/db.js";

const newAppointment = async (c) => {
  try {
    const { doctorId, patientId, date, time } = c.req.body;
    const appointment = await db.appointment.create({
      data: {
        doctorId,
        patientId,
        date,
        time,
      },
    });

    return c.json({ appointment }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default newAppointment;
