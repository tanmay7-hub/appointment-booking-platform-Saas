import type {CreateAvailabilityInput , UpdateAvailabilityInput} from "../validations/availibility.validation.js";
import prisma from "../config/prisma.js"


export async function createAvailability(input :  CreateAvailabilityInput , organizationId : string , staffMemberId : string){
   const { dayOfWeek, startTime, endTime } = input;
   

   const staffMember = await prisma.organizationMember.findFirst({
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
    
   const staffMember = await prisma.organizationMember.findFirst({
      where:{
         id : staffMemberId ,
         organizationId ,
         role : "STAFF"
      }
   });
   if(!staffMember){
      throw new Error("Staff member not found");
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
export async function updateAvailability(input : UpdateAvailabilityInput , organizationId : string , staffMemberId : string , availabilityId : string){
     
   const availability = await prisma.availability.findUnique({
      where:{
         id : availabilityId,
         staffMemberId ,
         staffMember :{
            organizationId ,
            role : "STAFF"
         }
      }
   });

   if(!availability){
      throw new Error("Availability not found");
   }
   const startTime = input.startTime ?? availability.startTime;
   const endTime = input.endTime ?? availability.endTime;

   if(startTime >= endTime){
      throw new Error("Start time must be before  endTime");
   }

   const updateAvailability = await prisma.availability.update({
      where:{
           id : availabilityId
      },
      data:input
   });

   return updateAvailability;
}
export async function deleteAvailability(organizationId : string , staffMemberId : string , availabilityId : string){
   const availability = await prisma.availability.findFirst({
      where:{
         id : availabilityId,
         staffMemberId,
         staffMember:{
            organizationId ,
            role:"STAFF"
         }
      }
   });
   if(!availability){
      throw new Error("Availabiltity not found");
   }

   const deletedAvailability  = await prisma.availability.delete({
      where:{
         id : availabilityId
      }
   });

   return deletedAvailability;
}