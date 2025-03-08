import db from "../../../prisma/db.js";
import { comparePassword } from "../../../utils/compare-password.js";
import { generateToken } from "../../../utils/generate-token.js";

const patientLogin = async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and Password are required" }, 400);
    }

    const patient = await db.patient.findUnique({ where: { email } });

    if (!patient) {
      return c.json({ error: "Patient does not exist" }, 400);
    }

    const isMatch = await comparePassword(password, patient.password);

    if (!isMatch) {
      return c.json({ error: "Invalid Email or Password" }, 400);
    }

    const token = generateToken({ id: patient.id, role: "patient" });

    return c.json({ message: "Login Successful", token }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default patientLogin;
