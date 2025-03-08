import db from "../../../prisma/db.js";

const deleteSchedule = async (c) => {
  try {
    const { id } = c.get("user");

    const schedule = await db.schedule.findUnique({
      where: { doctorId: id },
    });

    if (!schedule) {
      return c.json({ error: "Schedule does not exist" }, 400);
    }

    await db.schedule.delete({
      where: { doctorId: id },
    });

    return c.json({ message: "Schedule deleted successfully" }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default deleteSchedule;
