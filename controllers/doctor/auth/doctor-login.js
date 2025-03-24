import db from "../../../prisma/db.js";
import { generateToken } from "../../../utils/generate-token.js";
import { comparePassword } from "../../../utils/compare-password.js";

const doctorLogin = async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and Password are required" }, 400);
    }

    const doctor = await db.doctor.findUnique({ where: { email } });
    if (!doctor) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const isMatch = await comparePassword(password, doctor.password);
    if (!isMatch) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const token = generateToken(doctor.id, "doctor");

    return c.json({ message: "Login successful", token }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default doctorLogin;
