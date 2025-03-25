import db from "../../../prisma/db.js";

const updateSchedule = async (c) => {
  try {
    const { id } = c.get("user");
    const { schedule } = await c.req.json();

    if (!Array.isArray(schedule) || schedule.length !== 7) {
      return c.json(
        { error: "Invalid schedule format. Must be an array of 7 days." },
        400,
      );
    }

    const formattedSchedule = schedule.map((day) => ({
      day: day.day,
      sessions: {
        morning: day.sessions.morning || { active: false, start: "", end: "" },
        afternoon: day.sessions.afternoon || {
          active: false,
          start: "",
          end: "",
        },
        evening: day.sessions.evening || { active: false, start: "", end: "" },
      },
    }));

    const existingSchedule = await db.schedule.findUnique({
      where: { doctorId: id },
    });

    let updatedSchedule;

    if (existingSchedule) {
      updatedSchedule = await db.schedule.update({
        where: { doctorId: id },
        data: { entries: formattedSchedule, updatedAt: new Date() },
      });
    } else {
      updatedSchedule = await db.schedule.create({
        data: {
          doctorId: id,
          entries: formattedSchedule,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return c.json(
      { message: "Schedule updated successfully", schedule: updatedSchedule },
      200,
    );
  } catch (error) {
    console.error("Error updating schedule:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default updateSchedule;
