import jwt from "jsonwebtoken";
import db from "../prisma/db.js";

const authMiddleware = (roles) => {
  return async (c, next) => {
    try {
      const token = c.req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id, role } = decoded;

      if (!roles.includes(role)) {
        return c.json({ error: "Forbidden" }, 403);
      }

      let user = null;

      if (role === "admin") {
        user = await db.admin.findUnique({ where: { id } });
      } else if (role === "patient") {
        user = await db.patient.findUnique({ where: { id } });
      } else if (role === "doctor") {
        user = await db.doctor.findUnique({ where: { id } });
      } else if (role === "doctorHelper") {
        user = await db.doctorHelper.findUnique({ where: { id } });
      }

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      c.set("user", { role, ...user });

      return next();
    } catch (error) {
      console.error(error);
      return c.json({ error: "Unauthorized" }, 401);
    }
  };
};

export default authMiddleware;
