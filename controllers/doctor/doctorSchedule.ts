import type { FastifyRequest, FastifyReply } from "fastify";
import z from "zod";
import DbClient from "../../prisma/DbClient";
import { generateTimeSlots } from "../../utils/generateTimeSlots";

const scheduleSchema = z.array(
  z.object({
    day: z.string(),
    active: z.boolean(),
    gap: z.number().min(1).max(60).optional(),
    duration: z.number().min(1).max(60).optional(),
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
  }),
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

    const formattedSchedule = parsed.data.map((day) => {
      const gap = day.gap || 5;
      const duration = day.duration || 10;

      const sessionsWithSlots: any = {};

      ["morning", "afternoon", "evening"].forEach((sessionName) => {
        const session = (day.sessions as any)[sessionName];
        if (session && session.active && session.start && session.end) {
          sessionsWithSlots[sessionName] = {
            ...session,
            slots: generateTimeSlots(session.start, session.end, duration, gap),
          };
        } else {
          sessionsWithSlots[sessionName] = {
            active: false,
            start: "",
            end: "",
            slots: [],
          };
        }
      });

      return {
        day: day.day,
        gap,
        duration,
        sessions: sessionsWithSlots,
      };
    });

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
