import db from "../../prisma/db.js";
import dayjs from "dayjs";

const newAppointment = async (c) => {
  try {
    const { slug, date, time, subject } = await c.req.json();

    const patientId = c.get("user").id;

    const doctor = await db.doctor.findUnique({
      where: { slug },
      select: {
        id: true,
        schedules: true,
      },
    });

    const existingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        date,
        time,
      },
    });

    if (existingAppointment) {
      return c.json(
        { error: "Appointment already booked. Choose another time." },
        400
      );
    }

    if (
      !doctor ||
      !Array.isArray(doctor.schedules) ||
      doctor.schedules.length === 0
    ) {
      return c.json({ error: "Doctor or schedule not found" }, 404);
    }

    const schedule = doctor.schedules[0];

    if (!Array.isArray(schedule.entries)) {
      return c.json({ error: "Doctor schedule is invalid" }, 500);
    }

    const scheduleEntries = schedule.entries;
    const dayName = dayjs(date).format("dddd");

    const timeToMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const isTimeInRange = (start, end, t) => {
      const tMin = timeToMinutes(t);
      return timeToMinutes(start) <= tMin && tMin <= timeToMinutes(end);
    };

    const daySchedule = scheduleEntries.find((entry) => entry.day === dayName);
    if (!daySchedule) {
      return c.json({ error: `Doctor not available on ${dayName}` }, 400);
    }

    let available = false;
    for (const session of ["morning", "afternoon", "evening"]) {
      const range = daySchedule.sessions[session];
      if (
        range.active &&
        range.start &&
        range.end &&
        isTimeInRange(range.start, range.end, time)
      ) {
        available = true;
        break;
      }
    }

    if (!available) {
      return c.json({ error: "Doctor not available at this time" }, 400);
    }

    const appointment = await db.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId,
        date,
        time,
        subject,
      },
    });

    return c.json(
      { message: "Appointment booked successfully", appointment },
      200
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default newAppointment;
