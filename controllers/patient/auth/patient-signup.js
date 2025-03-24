import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";

const patientSignup = async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const patient = await db.patient.findUnique({ where: { email } });

    if (patient) {
      return c.json({ error: "Patient already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    const newPatient = await db.patient.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return c.json({ message: "Signup Successfully", patient: newPatient }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default patientSignup;
