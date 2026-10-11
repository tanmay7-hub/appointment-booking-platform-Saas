import z from "zod";

export const createBusinessClosureSchema =  z.object({
   date : z.date(),
   reason : z.string().max(500).optional()
});

export const updateBusinessClosureSchema = z
.object({
    date: z.date().optional(),
    reason: z.string().max(500).optional
}).refine((data)=> Object.keys(data).length > 0 ,
 "At least one field is required" );


export type UpdateBusinessClosureInput = z.infer< typeof updateBusinessClosureSchema >;
export type CreateBusinessClosureInput = z.infer< typeof createBusinessClosureSchema>;