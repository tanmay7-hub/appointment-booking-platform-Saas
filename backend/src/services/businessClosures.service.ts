import prisma from "../config/prisma.js";
import { CreateBusinessClosureInput , UpdateBusinessClosureInput } from "../validations/buisnessClosure.validation.js";
  


export async function createBusinessClosure(
  input: CreateBusinessClosureInput,
  organizationId: string,
) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });
  if (!organization) {
    throw new Error("Organization not found");
  }

  const date = new Date(input.date);

  const existingClosure = await prisma.businessClosure.findUnique({
    where: {
      organizationId_date: {
        organizationId,
        date,
      },
    },
  });

  if (existingClosure) {
    throw new Error("Buisness closure already exists");
  }

  const closure = await prisma.businessClosure.create({
    data: {
      organizationId,
      date,
      reason: input.reason,
    },
  });

  return closure;
}


export async function deleteBusinessClosure(
  organizationId : string,
  closureId : string
){
  const organization = await prisma.organization.findUnique({
    where:{
      id : organizationId
    }
  });
  if(!organization){
    throw new Error("Organization does not exists");
  }
  const closure = await prisma.businessClosure.findFirst({
    where:{
      id : closureId,
      organizationId
    }
  });

  if(!closure){
    throw new Error("Closure does not exits");
  }

  const deletedClosure = await prisma.businessClosure.delete({
    where:{
      id : closureId
    }
  });

  return deletedClosure;
}
export async function updateBusinessClosure(
  input : UpdateBusinessClosureInput,
  organizationId : string,
  closureId : string
){
  
  const closure = await prisma.businessClosure.findFirst({
    where:{
      id : closureId,
      organizationId
    }
  });
  if(!closure){
    throw new Error("Buisness closure not found");
  }


  const date = input.date ? new Date(input.date) : closure.date;


  if(input.date){
    const existingClosure = await prisma.businessClosure.findFirst({
      where:{
        date : input.date,
        organizationId,
        NOT:{
          id : closureId
        }
      }
    });
    if(existingClosure){
      throw new Error("Buisness Closure already exists");
    }
  }
  
  if(typeof input.reason !== "string"){
    throw new Error("input in not of string type");
  }
  const updatedClosure = await prisma.businessClosure.update({
     where:{
      id : closureId
     },
     data:{
       date,
       reason : input.reason,
     }
  });

  return updatedClosure;
}
export async function getBusinessClosure(
  organizationId : string
){
  const organization = await prisma.organization.findUnique({
    where:{
      id : organizationId
    }
  });

  if(!organization){
    throw new Error("Organization not found");
  }

  const closures = await prisma.businessClosure.findMany({
    where:{
      organizationId
    },
    orderBy:{
      date: "asc"
    }
  });
   
  return closures;

}
