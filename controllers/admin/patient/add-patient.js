import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";

const addPatient = async (c) => {
  try {
    const { name, email, password, phone, address } = await c.req.json();

    if (!name || !email || !password || !phone || !address) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const normalizedEmail = email.toLowerCase();

    const existingPatient = await db.patient.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingPatient) {
      return c.json({ error: "Patient already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    await db.patient.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone,
        address,
      },
    });

    return c.json({ message: "Patient added successfully" }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default addPatient;
