import { Request, Response } from "express";
import {createOrganizationSchema} from "../validations/organization.validation.js"
import { createOrganization } from "../services/organization.service.js"
export async function createOrganizationMember (req : Request , res : Response){
    try{
      const result =  createOrganizationSchema.safeParse(req.body);

      if(!result.success){
        return res.status(401).json({message : "Invalid input"});
      }
      if(!req.user){
        return res.status(400).json({message : "Authentication Required"});
      }


      const organization = await createOrganization(result.data , req.user?.userId);

      return res.status(201).json({message : "Organization Created " , organization : organization.org});

    }catch(err){
      
        if(err instanceof Error &&  err.message === "Organization already exists"){
            return res.status(409).json({message : err.message});
        }
        
        return res.status(500).json({message : "Internal Server Error" });
    }
}