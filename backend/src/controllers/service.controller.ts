import {createService , getOrganizationServices} from "../services/organization.service.js"
import {createServiceSchema } from "../validations/service.validation.js" 
import {Request , Response }from "express";

export async function createServiceController(req : Request , res : Response){
  try{
    console.log(req.body);
    const results = createServiceSchema.safeParse(req.body);
    if(!results.success){
      return res.status(400).json({message : "Invalid Input" , err : results.error });
    }

    const {organizationId} = req.params;
    if(typeof organizationId !== "string"){
      return res.status(422).json({message : "Unprocessable entity"});
    }
    const {name , description , price , durationMinutes } = results.data;  

    const service = await createService({name , description , price , durationMinutes} ,organizationId);

    return res.status(201).json({message : "service created successfully" , service});

  }catch(err){

    if(err instanceof Error && err.message === "Organization Not Found"){
        return res.status(422).json({message : "Unprocessable Entity"});
    }
    return res.status(500).json({message : "Internal Server Error"});

  }
}
export async function getServiceController (req: Request , res : Response){
  try{ 
     const {organizationId} = req.params;
    
    if(typeof organizationId !== "string" || !organizationId){
      return res.status(400).json({message : "OrganizationId is required"});
     }

     const allServices = await  getOrganizationServices(organizationId);

     return res.status(200).json({message : "All services fetched." , services : allServices});

  }catch(err){

    if(err instanceof Error && err.message === "Organization Not Found"){
      return res.status(404).json({message : "Data Not Found"});
    }
    return res.status(500).json({message : "Internal Server Error"});
  }
}