import db from "../../../prisma/db.js";

const removeHelper = async (c) => {
  try {
    const { id } = await c.req.json();

    if (!id) {
      return c.json({ error: "Helper ID is required" }, 400);
    }

    await db.doctorHelper.delete({ where: { id } });

    return c.json({ message: "Helper removed successfully" }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

export default removeHelper;
