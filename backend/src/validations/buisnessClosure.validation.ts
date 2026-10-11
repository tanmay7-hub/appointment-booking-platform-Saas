import z from "zod";

export const createBusinessClosureSchema =  z.object({
   date : z.date(),
   reason : z.string().max(500).optional()
});


export type CreateBusinessClosureInput = z.infer< typeof createBusinessClosureSchema>;