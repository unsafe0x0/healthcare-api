import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";

const scheduleSchema = z.array(
  z.object({
    day: z.string(),
    sessions: z.object({
      morning: z
        .object({
          active: z.boolean(),
          start: z.string(),
          end: z.string(),
        })
        .optional(),
      afternoon: z
        .object({
          active: z.boolean(),
          start: z.string(),
          end: z.string(),
        })
        .optional(),
      evening: z
        .object({
          active: z.boolean(),
          start: z.string(),
          end: z.string(),
        })
        .optional(),
    }),
  })
);

const doctorSchedule = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;

  if (!user || user.role !== "doctor") {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const parsed = scheduleSchema.safeParse((request.body as any)?.schedule);

    if (!parsed.success || parsed.data.length !== 7) {
      return reply.status(400).send({
        error: "Invalid schedule format. Must be an array of 7 days.",
      });
    }

    const formattedSchedule = parsed.data.map((day) => ({
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

    const existingSchedule = await DbClient.schedule.findUnique({
      where: { doctorId: user.id },
    });

    let updatedSchedule;

    if (existingSchedule) {
      updatedSchedule = await DbClient.schedule.update({
        where: { doctorId: user.id },
        data: { entries: formattedSchedule, updatedAt: new Date() },
      });
    } else {
      updatedSchedule = await DbClient.schedule.create({
        data: {
          doctorId: user.id,
          entries: formattedSchedule,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return reply.status(200).send({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Error updating schedule:", error);
    return reply.status(500).send({ error: "Internal Server Error" });
  }
};

export default doctorSchedule;
