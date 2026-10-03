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

export const createAvailabilityExceptionSchema = z
  .object({
    date: z.string().date(),

    type: z.enum(["UNAVAILABLE", "CUSTOM_HOURS"]),

    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid start time")
      .optional(),

    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid end time")
      .optional(),

    reason: z.string().trim().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "CUSTOM_HOURS") {
      if (!data.startTime) {
        ctx.addIssue({
          code: "custom",
          path: ["startTime"],
          message: "Start time is required for custom hours",
        });
      }

      if (!data.endTime) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "End time is required for custom hours",
        });
      }

      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        ctx.addIssue({
          code: "custom",
          path: ["endTime"],
          message: "End time must be after start time",
        });
      }
    }

    if (data.type === "UNAVAILABLE") {
      if (data.startTime || data.endTime) {
        ctx.addIssue({
          code: "custom",
          path: ["type"],
          message: "UNAVAILABLE cannot have custom hours",
        });
      }
    }
  });

export type CreateAvailabilityExceptionInput = z.infer<typeof createAvailabilityExceptionSchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>;
