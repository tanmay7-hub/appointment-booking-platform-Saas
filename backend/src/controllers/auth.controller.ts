import { Request, Response } from "express";
import { registerUser  , loginUser} from "../services/auth.service.js";
import  {registerSchema , loginSchema} from "../validations/auth.validation.js"
import {generateToken} from "../utils/jwt.js"
export async function register(req: Request, res: Response) {
  try {
     const result = registerSchema.safeParse(req.body);
     if (!result.success) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }
    const { name, email, password } = result.data;


    const user = await registerUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "User already exists") {
      return res.status(409).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
export async function login(req:Request , res : Response){
    try{
        const results =  loginSchema.safeParse(req.body);
        if(!results.success){
            return res.status(400).json({
             message: "Email and password are required",
           });
        }

        const {email , password} = results.data;

        const user = await loginUser({email , password});

        const token = generateToken(user.id);

        return res.status(200).json({message : "user logged in successfully" , user  , token});
    }catch(error){
        if(error instanceof Error && error.message === "Invalid credentials"){
            return res.status(401).json({message :"Invalid Email or Password"});
        }
       
        return res.status(500).json({
            message : "Internal server error"
        })
    }

}