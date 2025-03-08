import db from "../../../prisma/db.js";

const updateSchedule = async (c) => {
  try {
    const { id } = c.get("user");

    const { days, startTime, endTime, active } = await c.req.json();

    if (!days || !startTime || !endTime || !active) {
      return c.json({ error: "All fields are required" }, 400);
    }

    if (
      !Array.isArray(days) ||
      !Array.isArray(startTime) ||
      !Array.isArray(endTime) ||
      !Array.isArray(active) ||
      days.length !== 7 ||
      startTime.length !== 7 ||
      endTime.length !== 7 ||
      active.length !== 7
    ) {
      return c.json(
        { error: "Invalid schedule format. All arrays must have 7 values." },
        400,
      );
    }

    const schedule = await db.schedule.findUnique({
      where: { doctorId: id },
    });

    if (!schedule) {
      return c.json({ error: "Schedule does not exist" }, 400);
    }

    const updatedSchedule = await db.schedule.update({
      where: { doctorId: id },
      data: {
        days,
        startTime,
        endTime,
        active,
      },
    });

    return c.json(
      { message: "Schedule updated successfully", updatedSchedule },
      200,
    );
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default updateSchedule;
