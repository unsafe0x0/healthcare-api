import db from "../../prisma/db.js";

const cancelAppointment = async (c) => {
  try {
    const { appointmentId } = await c.req.json();

    const cancelAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { status: "cancelled" },
    });

    return c.json(
      {
        message: "Appointment cancelled successfully",
        appointment: cancelAppointment,
      },
      200
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default cancelAppointment;
