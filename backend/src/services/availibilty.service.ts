import type {CreateAvailabilityInput} from "../validations/availibility.validation.js";
import prisma from "../config/prisma.js"
export async function createAvailability(input :  CreateAvailabilityInput , organizationId : string , staffMemberId : string){
   const { dayOfWeek, startTime, endTime } = input;
   

   const staffMember = await prisma.organizationMember.findUnique({
    where:{
        id : staffMemberId ,
        organizationId,
        role:"STAFF"
    }
   });
   
   if(!staffMember){
    throw new Error("Staff member not found");
   }

   const checkAvailability = await prisma.availability.findFirst({
      where:{
           staffMemberId ,
           dayOfWeek,
           startTime,
           endTime
      }
   });
   if(checkAvailability){
    throw new Error("Availability already exists");
   }

   const availability = await prisma.availability.create({
         data:{
            staffMemberId ,
           dayOfWeek,
           startTime,
           endTime
         }
   });
   return availability;
}
export async function getAvailability (organizationId : string , staffMemberId : string){
    
   const staffMember = await prisma.organizationMember.findUnique({
      where:{
         id : staffMemberId ,
         organizationId ,
         role : "STAFF"
      }
   });
   if(!staffMember){
      throw new Error("Staff member does not exists");
   }

   const availability = await prisma.availability.findMany({
       where :{
          staffMemberId
       },
       orderBy :{
         dayOfWeek : "asc"
       }
   });

   return availability;
}