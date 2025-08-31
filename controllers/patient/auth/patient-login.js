import db from "../../../prisma/db.js";
import { comparePassword } from "../../../utils/compare-password.js";
import { generateToken } from "../../../utils/generate-token.js";

const patientLogin = async (c) => {
  try {
    const { email, phone, password } = await c.req.json();

    if ((!email && !phone) || !password || (email === "" && phone === "")) {
      return c.json({ error: "Email or Phone and Password are required" }, 400);
    }
    let patient = null;
    if (email) {
      patient = await db.patient.findUnique({ where: { email } });
    } else if (phone) {
      patient = await db.patient.findUnique({ where: { phone } });
    }

    if (!patient) {
      return c.json({ error: "Patient does not exist" }, 400);
    }

    const isMatch = await comparePassword(password, patient.password);

    if (!isMatch) {
      return c.json({ error: "Invalid credentials" }, 400);
    }

    const token = generateToken(patient.id, "patient");

    return c.json({ message: "Login Successful", token }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default patientLogin;
