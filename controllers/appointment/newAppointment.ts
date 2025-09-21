import type { FastifyRequest, FastifyReply } from "fastify";
import dayjs from "dayjs";
import DbClient from "../../prisma/DbClient";
import { sendEmail } from "../../services/SendMail";
import { aptIdHash } from "../../utils/appointmentId";
import { generateQr } from "../../utils/generateQr";

interface AppointmentRequest {
  slug: string;
  date: string;
  time: string;
  subject: string;
}

interface Session {
  active: boolean;
  start?: string;
  end?: string;
  slots?: string[];
}

interface ScheduleEntry {
  day: string;
  sessions: {
    morning?: Session;
    afternoon?: Session;
    evening?: Session;
  };
}

const newAppointment = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  if (!user || user.role !== "patient") {
    return reply.status(403).send({ error: "Forbidden" });
  }
  try {
    const { slug, date, time, subject } = request.body as AppointmentRequest;

    const patientId = user.id;

    const doctor = await DbClient.doctor.findUnique({
      where: { slug },
      select: { id: true, schedules: true },
    });

    if (!doctor) return reply.status(404).send({ error: "Doctor not found" });

    const existingAppointment = await DbClient.appointment.findFirst({
      where: { doctorId: doctor.id, date, time },
    });
    if (existingAppointment)
      return reply.status(400).send({ error: "Not available at this slot" });

    const schedules = doctor.schedules ?? [];
    if (schedules.length === 0)
      return reply.status(404).send({ error: "Doctor schedule not found" });

    const schedule = schedules[0];
    if (!schedule || !schedule.entries)
      return reply.status(500).send({ error: "Doctor schedule invalid" });

    const scheduleEntries = Array.isArray(schedule.entries)
      ? (schedule.entries as unknown as ScheduleEntry[])
      : [];

    const dayName = dayjs(date).format("dddd");
    const daySchedule = scheduleEntries.find((entry) => entry.day === dayName);
    if (!daySchedule)
      return reply
        .status(400)
        .send({ error: `Doctor not available on ${dayName}` });

    let available = false;
    for (const sessionName of ["morning", "afternoon", "evening"] as const) {
      const session = daySchedule.sessions[sessionName];
      if (session?.active && session?.slots?.includes(time)) {
        available = true;
        break;
      }
    }

    if (!available)
      return reply
        .status(400)
        .send({ error: "Doctor not available at this slot" });

    const appointmentId = aptIdHash(
      `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    );

    const qrCode = await generateQr(appointmentId);

    const appointment = await DbClient.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId,
        date,
        time,
        subject,
        appointmentId,
      },
    });

    const patient = await DbClient.patient.findUnique({
      where: { id: patientId },
    });

    const doctorDetails = await DbClient.doctor.findUnique({
      where: { id: doctor.id },
    });

    if (patient?.email && patient?.name) {
      const body = `
        <div style="max-width:600px;margin:0 auto;padding:12px;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                    background:#ffffff;border-radius:12px;
                    box-shadow:0 4px 12px rgba(0,0,0,0.08);color:#2d3748;">

          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="margin:0;font-size:24px;color:#2f855a;">
              Appointment Confirmed
            </h1>
            <p style="margin-top:8px;font-size:16px;color:#4a5568;">
              We've reserved your spot
            </p>
          </div>

          <p style="font-size:16px;line-height:1.6;">
            Hello <strong>${patient.name}</strong>,
          </p>

          <p style="font-size:16px;line-height:1.6;">
            Your appointment with <strong>${
              doctorDetails?.name
            }</strong> is booked for
            <strong>${dayjs(date).format("dddd, MMM D, YYYY")}</strong> at
            <strong>${time}</strong>.
          </p>

          <div style="background:#e6fffa;border:1px solid #81e6d9;
                      border-radius:8px;padding:16px;margin:24px 0;">
            <p style="margin:0;font-size:15px;color:#2d3748;">
              <strong>Appointment ID:</strong> <code style="background:#f0fff4;padding:2px 6px;border-radius:4px;font-family:monospace;">${appointmentId}</code>
            </p>
          </div>

          <div style="background:#f7fafc;border:1px solid #e2e8f0;
                      border-radius:8px;padding:16px;margin:24px 0;">
            <p style="margin:0;font-size:15px;color:#2d3748;">
              Please arrive a few minutes early and bring any necessary documents.
            </p>
          </div>

          <div style="text-align:center;margin:32px 0;">
            <img src="${qrCode}" alt="QR Code"
                 style="width:200px;height:200px;" />
            <p style="font-size:14px;color:#718096;margin-top:8px;">
              Present this code at the clinic
            </p>
          </div>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />

          <p style="font-size:13px;color:#a0aec0;text-align:center;">
            This is an automated email—please don't reply.
          </p>
        </div>
      `;

      await sendEmail({
        to: patient.email,
        subject: "Appointment Confirmation",
        body,
      });
    }

    return reply
      .status(200)
      .send({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    console.error(error);
    return reply.status(500).send("Internal Server Error");
  }
};

export default newAppointment;
