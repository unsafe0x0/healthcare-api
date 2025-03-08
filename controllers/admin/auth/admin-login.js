import db from "../../../prisma/db.js";
import { generateToken } from "../../../utils/generate-token.js";
import { comparePassword } from "../../../utils/compare-password.js";

const adminLogin = async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and Password are required" }, 400);
    }

    const normalizedEmail = email.toLowerCase();

    const admin = await db.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      return c.json({ error: "Invalid Email or Password" }, 400);
    }

    const isMatch = await comparePassword(password, admin.password);

    if (!isMatch) {
      return c.json({ error: "Invalid Email or Password" }, 400);
    }

    const token = generateToken({ id: admin.id, role: "admin" });

    return c.json(
      {
        message: "Login Successful",
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name },
      },
      200,
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default adminLogin;
