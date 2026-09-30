import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
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


export const login = async (data: LoginData) => {
    const { email, password } = data;
  
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
  
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }
  
    // 2. Compare password with stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );
  
    if (!passwordMatches) {
      throw new Error("INVALID_CREDENTIALS");
    }
  
    // 3. Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );
  
    // 4. Return safe user data + token
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  };