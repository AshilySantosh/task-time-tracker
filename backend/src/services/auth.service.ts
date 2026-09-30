import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

interface SignupData {
  name: string;
  email: string;
  password: string;
}

export const signup = async (data: SignupData) => {
  const { name, email, password } = data;

  // 1. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // 3. Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  return user;
};