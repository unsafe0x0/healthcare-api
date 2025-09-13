import type { FastifyRequest, FastifyReply } from "fastify";
import DbClient from "../../prisma/DbClient";
import { sendEmail } from "../../services/SendMail";

interface AcceptAppointmentRequest {
  Params: {
    appointmentId: string;
  };
}

const acceptAppointment = async (
  request: FastifyRequest<AcceptAppointmentRequest>,
  reply: FastifyReply
) => {
  const user = (request as any).user;

  if (!user || (user.role !== "doctor" && user.role !== "doctorhelper")) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const { appointmentId } = request.params;

    const updated = await DbClient.appointment.update({
      where: { id: appointmentId },
      data: { status: "accepted" },
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
        <h2 style="color: #38a1ee;">🎉 Congratulations Mr/Ms ${patient.name}</h2>
        <p>Your appointment for <strong>${appointment.date}</strong> at <strong>${appointment.time}</strong> has been <span style="color:#28a745; font-weight:bold;">accepted</span>.</p>
        <p>Please visit the clinic on time.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="font-size: 0.9em; color: #666;">This is an automated confirmation message. Please do not reply.</p>
      </div>
    `;

        await sendEmail({
          to: patient.email,
          subject: "Appointment Accepted",
          body,
        });
      }
    }

    return reply.status(204).send();
  } catch (error) {
    console.error("Error accepting appointment:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default acceptAppointment;
