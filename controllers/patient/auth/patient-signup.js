import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";

const patientSignup = async (c) => {
  try {
    const { name, email, phone, password } = await c.req.json();

    if (
      !name ||
      !password ||
      (!email && !phone) ||
      (email === "" && phone === "")
    ) {
      console.log("Validation failed", { name, email, phone, password });
      return c.json(
        { error: "Name, password, and either email or phone are required" },
        400
      );
    }

    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    const patient = await db.patient.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (patient) {
      return c.json({ error: "Patient already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    const patientData = {
      name,
      password: hashedPassword,
      role: "patient",
    };
    if (email) patientData.email = email;
    if (phone) patientData.phone = phone;

    const newPatient = await db.patient.create({
      data: patientData,
    });

    return c.json({ message: "Signup Successfully", patient: newPatient }, 200);
  } catch (error) {
    console.error("Signup error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export default patientSignup;
