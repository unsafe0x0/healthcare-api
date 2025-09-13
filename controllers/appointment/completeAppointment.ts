import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";
import { sendEmail } from "../../services/SendMail";

interface CompleteAppointmentRequest {
  Params: {
    appointmentId: string;
  };
}

const completeAppointment = async (
  request: FastifyRequest<CompleteAppointmentRequest>,
  reply: FastifyReply
) => {
  const { appointmentId } = request.params;

  const user = (request as any).user;
  if (!user || (user.role !== "doctor" && user.role !== "doctorhelper")) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const updated = await DbClient.appointment.update({
      where: { id: appointmentId },
      data: { status: "complete" },
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
            <h2 style="color: #007bff;">✅ Appointment Completed</h2>
            <p>Dear Mr/Ms <strong>${patient.name}</strong>,</p>
            <p>Your appointment for <strong>${appointment.date}</strong> at <strong>${appointment.time}</strong> has been marked as <span style="color:#007bff; font-weight:bold;">complete</span>.</p>
            <p>Thank you for visiting the clinic.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="font-size: 0.9em; color: #666;">This is an automated notification. Please do not reply.</p>
          </div>
        `;

        await sendEmail({
          to: patient.email,
          subject: "Appointment Completed",
          body,
        });
      }
    }

    return reply.status(204).send();
  } catch (error) {
    console.error("Error completing appointment:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default completeAppointment;
