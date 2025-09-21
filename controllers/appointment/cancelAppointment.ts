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
  reply: FastifyReply,
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
          <div style="max-width:600px;margin:0 auto;padding:12px;
                      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                      background:#ffffff;border-radius:12px;
                      box-shadow:0 4px 12px rgba(0,0,0,0.08);color:#2d3748;">

            <div style="text-align:center;margin-bottom:24px;">
              <h1 style="margin:0;font-size:24px;color:#c53030;">
                Appointment Canceled
              </h1>
              <p style="margin-top:8px;font-size:16px;color:#4a5568;">
                Your scheduled visit has been canceled
              </p>
            </div>

            <p style="font-size:16px;line-height:1.6;">
              Hello <strong>${patient.name}</strong>,
            </p>

            <p style="font-size:16px;line-height:1.6;">
              Your appointment on <strong>${appointment?.date}</strong> at
              <strong>${appointment?.time}</strong> has been
              <span style="color:#c53030;font-weight:bold;">canceled</span>.
            </p>

            <div style="background:#fed7d7;border:1px solid #fc8181;
                        border-radius:8px;padding:16px;margin:24px 0;">
              <p style="margin:0;font-size:15px;color:#2d3748;">
                <strong>Appointment ID:</strong> <code style="background:#fff5f5;padding:2px 6px;border-radius:4px;font-family:monospace;">${appointment?.appointmentId}</code>
              </p>
            </div>

            <div style="background:#f7fafc;border:1px solid #e2e8f0;
                        border-radius:8px;padding:16px;margin:24px 0;">
              <p style="margin:0;font-size:15px;color:#2d3748;">
                If you'd like to reschedule, please contact the clinic or use our website.
              </p>
            </div>

            <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />

            <p style="font-size:13px;color:#a0aec0;text-align:center;">
              This is an automated notification—please don't reply.
            </p>
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
