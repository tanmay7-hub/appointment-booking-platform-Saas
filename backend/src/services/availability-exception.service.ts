import type { CreateAvailabilityExceptionInput  , UpdateAvailabilityExceptionInput} from "../validations/availability-exception.validation.js";
import prisma from "../config/prisma.js";


export async function deleteAvailabilityException(
  organizationId: string,
  staffMemberId: string,
  exceptionId: string
){

  const exception = await prisma.availabilityException.findFirst({
    where:{
      id : exceptionId,
      staffMemberId,
      staffMember:{
        organizationId,
        role:"STAFF"
      }
    }
  });
  if(!exception){
    throw new Error("Availability exception not found");
  }
   const deletedException =
    await prisma.availabilityException.delete({
      where: {
        id: exceptionId,
      },
    });

  return deletedException;

}
export async function updateAvailabilityException(
  input: UpdateAvailabilityExceptionInput,
  organizationId: string,
  staffMemberId: string,
  exceptionId: string
) {
  const existingException =
    await prisma.availabilityException.findFirst({
      where: {
        id: exceptionId,
        staffMemberId,
        staffMember: {
          organizationId,
          role: "STAFF",
        },
      },
    });

  if (!existingException) {
    throw new Error("Availability exception not found");
  }

  const date = input.date ? new Date(input.date) : existingException.date;

  const type = input.type ?? existingException.type;

  const startTime =
    input.startTime ?? existingException.startTime;

  const endTime =
    input.endTime ?? existingException.endTime;

  if (type === "CUSTOM_HOURS") {
    if (!startTime || !endTime) {
      throw new Error(
        "Start time and end time are required for custom hours"
      );
    }

    if (startTime >= endTime) {
      throw new Error(
        "End time must be after start time"
      );
    }
  }


  if (type === "UNAVAILABLE") {
    if (startTime || endTime) {
      throw new Error(
        "UNAVAILABLE cannot have custom hours"
      );
    }
  }

  if (input.date) {
    const duplicate =
      await prisma.availabilityException.findFirst({
        where: {
          staffMemberId,
          date,
          NOT: {
            id: exceptionId,
          },
        },
      });

    if (duplicate) {
      throw new Error(
        "Availability exception already exists"
      );
    }
  }

  const updatedException =
    await prisma.availabilityException.update({
      where: {
        id: exceptionId,
      },
      data: {
        date,
        type,
        startTime:
          type === "UNAVAILABLE" ? null : startTime,
        endTime:
          type === "UNAVAILABLE" ? null : endTime,
        reason: input.reason,
      },
    });

  return updatedException;
}
export async function getAvailabilityException(
  organizationId : string , 
  staffMemberId : string
){
  const staffMember = await prisma.organizationMember.findFirst({
    where: {
      id : staffMemberId,
      organizationId,
      role: "STAFF",
    },
  });
  if (!staffMember) {
    throw new Error("Staff member not found");
  }

  const allException = await prisma.availabilityException.findMany ({
    where:{
       staffMemberId
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
      id : staffMemberId,
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
