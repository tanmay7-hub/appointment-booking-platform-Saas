import z from "zod";

export const createAppointmentSchema = z.object({
    staffMemberId : z.uuid(),
    serviceId : z.uuid(),
    startTime : z.iso.datetime(),
});

export const rescheduleAppointmentSchema = z.object({
    startTime : z.iso.datetime()
});


export const updateAppointmentStatusSchema = z.object({
    status:z.enum(["CONFIRMED", "COMPLETED" , "NO_SHOW"])
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
export type RescheduleAppointmentInput = z.infer < typeof rescheduleAppointmentSchema>
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>