import db from "../../prisma/db.js";

const newPatient = async (c) => {
  try {
    const { name, phone, subject } = await c.req.json();
    const user = c.get("user");
    let doctorId;
    if (user.role === "doctor-helper") {
      const helper = await db.doctorHelper.findUnique({
        where: { id: user.id },
        select: { doctorId: true },
      });
      doctorId = helper?.doctorId;
    } else {
      doctorId = user.id;
    }
    const patient = await db.additionalPatients.create({
      data: {
        name,
        phone,
        subject,
        doctorId,
      },
    });
    return c.json({ message: "New patient created", data: patient }, 201);
  } catch (error) {
    console.error("Error creating patient:", error);
    return c.json({ message: "Error creating patient" }, 500);
  }
};

export default newPatient;
