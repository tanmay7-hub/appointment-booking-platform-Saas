import type { CreateAppointmentInput } from "../validations/appointment.validation.js";
import prisma from "../config/prisma.js";




export async function getAppointmentById(
  organizationId : string,
  appointmentId : string,
  userId  : string , 
  role : "OWNER" | "STAFF" | "CUSTOMER"
){
  
  const appointment = await prisma.appointment.findFirst({
    where:{
       id : appointmentId,
       organizationId,
       ...(role === "CUSTOMER" ? {customerId : userId} : {}),
       ...(role === "STAFF" ? {staffMember : {userId}} : {})
    },
    include:{
      service : true,
      customer :{
        select:{
          id : true ,
          name : true,
          email : true
        }
      },
      staffMember:{
         include:{
          user:{
            select:{
              id : true,
              name : true
            }
          }
         }
      },
      payments: true
    }
  });

  if(!appointment){
    throw new Error ("No appointment found");
  }

  return appointment;
}
export async function getAppointments(
  organizationId: string,
  userId: string,
  role: "OWNER" | "STAFF" | "CUSTOMER"
) {
  const where = {
    organizationId,
    ...(role === "CUSTOMER" ? { customerId: userId } : {}),
    ...(role === "STAFF"
      ? {
          staffMember: {
            userId,
          },
        }
      : {}),
  };

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      service: {
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          price: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      staffMember: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  return appointments;
}
export async function createAppointment(
  input: CreateAppointmentInput,
  organizationId: string,
  customerId: string,
) {
  const customer = await prisma.organizationMember.findFirst({
    where: {
      userId: customerId,
      organizationId,
      role: "STAFF",
    },
  });

  if (!customer) {
    throw new Error("Customer is not a member of this  organization");
  }

  const staffMember = await prisma.organizationMember.findFirst({
    where: {
      userId: input.staffMemberId,
      organizationId,
      role: "STAFF",
    },
  });

  if (!staffMember) {
    throw new Error("Staff member not found");
  }
  const service = await prisma.service.findFirst({
    where: {
      id: input.serviceId,
      organizationId,
      isActive: true,
    },
  });

  if (!service) {
    throw new Error("service not found");
  }
  const isAssigned = await prisma.staffService.findUnique({
    where: {
      staffMemberId_serviceId: {
        staffMemberId: input.staffMemberId,
        serviceId: input.serviceId,
      },
    },
  });

  if (!isAssigned) {
    throw new Error("service is not assigned to staff member");
  }

  const startTime = input.startTime;

  const endTime = new Date(startTime + service.durationMinutes * 60 * 1000);

  const appointment = await prisma.appointment.create({
    data: {
      organizationId,
      customerId,
      staffMemberId: input.staffMemberId,
      serviceId: input.serviceId,
      startTime,
      endTime,
    },
  });

  return appointment;
}
