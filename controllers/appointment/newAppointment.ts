import type { FastifyRequest, FastifyReply } from "fastify";
import dayjs from "dayjs";
import DbClient from "../../prisma/DbClient";
import { sendEmail } from "../../services/SendMail";

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
      where: { doctorId: doctor.id, patientId, date, time },
    });
    if (existingAppointment)
      return reply
        .status(400)
        .send({ error: "Appointment already booked. Choose another time." });

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

    const timeToMinutes = (t: string) => {
      const parts = t.split(":");
      if (parts.length !== 2) return NaN;
      const h = Number(parts[0]);
      const m = Number(parts[1]);
      if (isNaN(h) || isNaN(m)) return NaN;
      return h * 60 + m;
    };

    const isTimeInRange = (start?: string, end?: string, t?: string) => {
      if (!start || !end || !t) return false;
      const tMin = timeToMinutes(t);
      const startMin = timeToMinutes(start);
      const endMin = timeToMinutes(end);
      if (isNaN(tMin) || isNaN(startMin) || isNaN(endMin)) return false;
      return startMin <= tMin && tMin <= endMin;
    };

    let available = false;
    for (const sessionName of ["morning", "afternoon", "evening"] as const) {
      const session = daySchedule.sessions[sessionName];
      if (session?.active && isTimeInRange(session.start, session.end, time)) {
        available = true;
        break;
      }
    }

    if (!available)
      return reply
        .status(400)
        .send({ error: "Doctor not available at this time" });

    const appointment = await DbClient.appointment.create({
      data: { doctorId: doctor.id, patientId, date, time, subject },
    });

    const patient = await DbClient.patient.findUnique({
      where: { id: patientId },
    });

    const doctorDetails = await DbClient.doctor.findUnique({
      where: { id: doctor.id },
    });

    if (patient?.email && patient?.name) {
      const body = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 8px; color: #333;">
      <h2 style="color: #28a745;">🎉 Appointment Confirmed</h2>
      <p>Dear Mr/Ms <strong>${patient.name}</strong>,</p>
      <p>Your appointment with <strong>${doctorDetails?.name}</strong> for <strong>${date}</strong> at <strong>${time}</strong> has been successfully booked.</p>
      <p>Please arrive on time at the clinic.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
      <p style="font-size: 0.9em; color: #666;">This is an automated confirmation email. Please do not reply.</p>
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
