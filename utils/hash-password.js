import bcryptjs from "bcryptjs";

export const hashPassword = async (password) => {
  return await bcryptjs.hash(password, 10);
};
