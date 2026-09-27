import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import type {registerInput  , loginInput} from "../validations/auth.validation.js"

export async function registerUser(input:registerInput) {
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

export async function loginUser(input: loginInput){
    const {email , password } = input;

    const user = await prisma.user.findUnique({where :{email}});
   
    if(!user){
        throw new Error("Invalid credentials");
    }

    const check = await bcrypt.compare(password , user.passwordHash);

    if(!check){
        throw new Error("Invalid credentials");
    }
    
    return {
       id: user.id,
       name: user.email,
       email:user.email
    }
}