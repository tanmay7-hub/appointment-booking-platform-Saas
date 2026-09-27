import jwt from "jsonwebtoken"


const jwt_secret = process.env.JWT_SECRET!;
export function generateToken (userId : string){
    return jwt.sign(
        {
            userId
        },
        jwt_secret,
        {
           expiresIn:"7d" 
        }
    );
}