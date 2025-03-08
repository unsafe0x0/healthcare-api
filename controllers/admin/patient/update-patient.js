import db from "../../../prisma/db.js";
import { hashPassword } from "../../../utils/hash-password.js";

const updatePatient = async (c) => {
  try {
    const { id, name, email, password } = await c.req.json();

    if (!id) {
      return c.json({ error: "Patient ID is required" }, 400);
    }

    const patient = await db.patient.findUnique({ where: { id } });

    if (!patient) {
      return c.json({ error: "Patient does not exist" }, 404);
    }

    const updatedData = {};

    if (name) {
      updatedData.name = name;
    }
    if (email) {
      updatedData.email = email.toLowerCase();
    }
    if (password) {
      updatedData.password = await hashPassword(password);
    }

    const updatedPatient = await db.patient.update({
      where: { id },
      data: {
        ...updatedData,
      },
    });

    return c.json(
      { message: "Patient updated successfully", patient: updatedPatient },
      200,
    );
  } catch (error) {
    console.error("Error updating patient:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default updatePatient;
