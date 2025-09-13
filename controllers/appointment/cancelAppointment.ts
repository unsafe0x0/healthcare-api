import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";
import { sendEmail } from "../../services/SendMail";

interface CancelAppointmentRequest {
  Params: {
    appointmentId: string;
  };
}

const cancelAppointment = async (
  request: FastifyRequest<CancelAppointmentRequest>,
  reply: FastifyReply
) => {
  const { appointmentId } = request.params;

  const user = (request as any).user;
  if (
    !user ||
    (user.role !== "patient" &&
      user.role !== "doctor" &&
      user.role !== "doctorhelper")
  ) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const updated = await DbClient.appointment.update({
      where: { id: appointmentId },
      data: { status: "canceled" },
    });

    if (!updated) {
      return reply.status(404).send({ error: "Appointment not found" });
    }

    const appointment = await DbClient.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (appointment?.patientId) {
      const patient = await DbClient.patient.findUnique({
        where: { id: appointment.patientId },
      });

      if (patient?.email && patient?.name) {
        const body = `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 8px; color: #333;">
            <h2 style="color: #dc3545;">⚠️ Appointment Canceled</h2>
            <p>Dear Mr/Ms <strong>${patient.name}</strong>,</p>
            <p>Your appointment for <strong>${appointment.date}</strong> at <strong>${appointment.time}</strong> has been <span style="color:#dc3545; font-weight:bold;">canceled</span>.</p>
            <p>If you wish to reschedule, please contact the clinic or reschedule via our website.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="font-size: 0.9em; color: #666;">This is an automated notification. Please do not reply.</p>
          </div>
        `;

        await sendEmail({
          to: patient.email,
          subject: "Appointment Canceled",
          body,
        });
      }
    }

    return reply.status(204).send();
  } catch (error) {
    console.error("Error canceling appointment:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default cancelAppointment;
