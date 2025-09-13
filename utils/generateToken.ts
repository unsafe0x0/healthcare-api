import jwt from "jsonwebtoken";

export const generateToken = (userId: string, role: string) => {
  const token = jwt.sign({ id: userId, role }, process.env.JWT_SECRET || "", {
    expiresIn: "7d",
  });
  return token;
};
