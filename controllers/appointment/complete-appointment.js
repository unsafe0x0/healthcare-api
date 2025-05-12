import db from "../../prisma/db.js";

const completeAppointment = async (c) => {
  try {
    const { appointmentId } = await c.req.json();

    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { status: "completed" },
    });

    return c.json(
      {
        message: "Appointment completed successfully",
        appointment,
      },
      200,
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default completeAppointment;
