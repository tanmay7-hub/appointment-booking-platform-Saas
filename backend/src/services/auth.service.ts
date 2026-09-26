import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(input: RegisterInput) {
  const { name, email, password } = input;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}