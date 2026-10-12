import z from "zod";

export const createAppointmentSchema = z.object({
    staffMemberId : z.uuid(),
    serviceId : z.uuid(),
    startTime : z.iso.datetime(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>