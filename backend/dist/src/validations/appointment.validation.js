import z from "zod";
export const createAppointmentSchema = z.object({
    staffMemberId: z.uuid(),
    serviceId: z.uuid(),
    startTime: z.iso.datetime(),
});
export const cursorPaginationSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional()
});
export const paginationSchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    page: z.coerce.number().int().min(1).default(1)
});
export const rescheduleAppointmentSchema = z.object({
    startTime: z.iso.datetime()
});
export const updateAppointmentStatusSchema = z.object({
    status: z.enum(["CONFIRMED", "COMPLETED", "NO_SHOW"])
});
//# sourceMappingURL=appointment.validation.js.map