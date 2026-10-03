import { z } from "zod";

export const updateAvailabilitySchema = z
  .object({
    dayOfWeek: z
      .enum([
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ])
      .optional(),

    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid start time")
      .optional(),

    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid end time")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required",
  );
export const createAvailabilitySchema = z
  .object({
    dayOfWeek: z.enum([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ]),

    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid start time"),

    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid end time"),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Start time must be before end time",
    path: ["endTime"],
  });


export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
