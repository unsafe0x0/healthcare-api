import db from "../../prisma/db.js";

const newAppointment = async (c) => {
  try {
    const { doctorId, patientId, date, time, subject } = c.req.body;

    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId,
        date,
        time,
      },
    });

    if (existingAppointment) {
      return c.json(
        { error: "Appointment already booked choose another time" },
        400
      );
    }

    const appointment = await db.appointment.create({
      data: {
        doctorId,
        patientId,
        date,
        time,
        subject,
      },
    });

    return c.json(
      { message: "Appointment booked successfully", appointment },
      200
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default newAppointment;
