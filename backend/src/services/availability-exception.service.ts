import type { CreateAvailabilityExceptionInput } from "../validations/availability-exception.validation.js";
import prisma from "../config/prisma.js";


export async function updateAvailabilityException(
  organizationId : string,
  staffMemberId : string ,
  exceptionId : string
){
  const staffMember = await prisma.organizationMember.findFirst({
    where: {
      staffMemberId,
      organizationId,
      role: "STAFF",
    },
  });
  if (!staffMember) {
    throw new Error("Staff member not found");
  }

  
 
}
export async function getAvailabilityException(
  organizationId : string , 
  staffMemberId : string
){
  const staffMember = await prisma.organizationMember.findFirst({
    where: {
      staffMemberId,
      organizationId,
      role: "STAFF",
    },
  });
  if (!staffMember) {
    throw new Error("Staff member not found");
  }

  const allException = await prisma.availabilityException.findMany ({
    where:{
      id : staffMemberId
    },
    orderBy:{
      date:"asc"
    }
  });
  
  return allException;
}
export async function createAvailabilityException(
  input: CreateAvailabilityExceptionInput,
  organizationId: string,
  staffMemberId: string,
) {
  const staffMember = await prisma.organizationMember.findFirst({
    where: {
      staffMemberId,
      organizationId,
      role: "STAFF",
    },
  });
  if (!staffMember) {
    throw new Error("Staff member not found");
  }

  const date = new Date(input.date);

  const existingException = await prisma.availabilityException.findUnique({
    where: {
      staffMemberId_date: {
        staffMemberId,
        date,
      },
    },
  });
  if (existingException) {
    throw new Error("Availability exception already exists");
  }

  
   const exception = await prisma.availabilityException.create({
    data: {
      staffMemberId,
      date,
      type: input.type,
      startTime: input.startTime,
      endTime: input.endTime,
      reason: input.reason,
    },
  });

  return exception;
}
