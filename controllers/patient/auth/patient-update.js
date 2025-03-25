import db from "../../../prisma/db";
import { hashPassword } from "../../../utils/hash-password";

const updatePatient = async (c) => {
  try {
    const formData = await c.req.formData();

    const { id } = c.get("user");

    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const phone = formData.get("phone");

    if (!id) {
      return c.json({ error: "Patient ID is required" }, 400);
    }

    const patient = await db.patient.findUnique({ where: { id } });
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }

    const updatedData = {};

    if (name) updatedData.name = name;
    if (email) updatedData.email = email.toLowerCase();
    if (password) updatedData.password = await hashPassword(password);
    if (phone) updatedData.phone = phone;

    const updatedPatient = await db.patient.update({
      where: { id },
      data: updatedData,
    });

    return c.json(
      { message: "Patient updated successfully", patient: updatedPatient },
      200,
    );
  } catch (error) {
    return c.json({ error: error.message || "Failed to update patient" }, 500);
  }
};

export default updatePatient;
