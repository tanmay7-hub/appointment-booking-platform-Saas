import z from "zod";
export const createServiceSchema = z.object({
      name: z.string().trim().min(2, "Name must be at least 2 character"),
      description: z.string().trim().optional(),
      durationMinutes: z.number().int().positive("Duration must be greater than 0"),
      price: z.number().nonnegative("Price cannot be negative"),
});


export const updateServiceSchema = createServiceSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required"
  );

export type UpdateSchemaInput = z.infer<typeof updateServiceSchema>;

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
