import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";

const adminSignup = async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: "Name, Email and Password are required" }, 400);
    }

    const normalizedEmail = email.toLowerCase();

    const existingAdmin = await db.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingAdmin) {
      return c.json({ error: "Admin already exists" }, 400);
    }

    const hashedPassword = await hashPassword(password);

    await db.admin.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return c.json({ message: "Signup Successful" }, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default adminSignup;
