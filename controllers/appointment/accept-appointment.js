import db from "../../prisma/db.js";

const acceptAppointment = async (c) => {
  try {
    const { appointmentId } = await c.req.json();

    const appointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { status: "accepted" },
    });

    return c.json(
      {
        message: "Appointment accepted successfully",
        appointment,
      },
      200,
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default acceptAppointment;
