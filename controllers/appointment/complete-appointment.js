import db from "../../prisma/db.js";

const completeAppointment = async (c) => {
  try {
    const { appointmentId } = c.req.body;

    const appointment = await db.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return c.json({ error: "Appointment not found" }, 404);
    }

    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { status: "completed" },
    });

    return c.json(
      {
        message: "Appointment completed successfully",
        appointment: updatedAppointment,
      },
      200,
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default completeAppointment;
