import {Request , Response , NextFunction} from "express";
import prisma from "../config/prisma.js";

export async function checkOrganizationMemberShip(req : Request , res : Response , next : NextFunction){
    try{
       if(!req.user){
        return res.status(401).json({message : "Authentication Required"});
       }      

       const {organizationId} = req.params;
       
       if(typeof organizationId !== "string"){
      return res.status(422).json({message : "Unprocessable entity"});
      }
       if(!organizationId){
         return res.status(400).json({message : "Organization Id is Required"});
       }

      const organization = await prisma.organizationMember.findUnique({
         where:{
            organizationId_userId :{
                organizationId ,
                userId : req.user.userId
            }
         }
       });
       console.log(organization);
       if(!organization){
        return res.status(403).json({message : "You are not the member of this organization"});
       }

       req.organization = {
         id :organizationId,
         role : organization.role
       }

       next();
    
    }catch(err){
       return res.status(500).json({err});
    }
}