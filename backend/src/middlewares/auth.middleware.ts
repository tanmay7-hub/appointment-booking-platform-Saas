import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwt_secret = process.env.JWT_SECRET!;
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authentication Required" });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid Authorization header" });
    }
    const payload = jwt.verify(token, jwt_secret);

    if (typeof payload === "string" || !payload.userId) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.user = {
      userId : payload.userId,
    };

    next();
  } catch (error) {
    return res.status(401).json({message : "token invalid or expired"});

  }
}
