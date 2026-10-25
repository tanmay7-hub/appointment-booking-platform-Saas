import { z } from "zod";
export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be atleast 2 character"),
    email: z
        .email("Invalid email Address"),
    password: z
        .string()
        .min(8, "Password must be atleast 8 character")
});
export const loginSchema = z.object({
    email: z.email(),
    password: z
        .string()
});
//# sourceMappingURL=auth.validation.js.map