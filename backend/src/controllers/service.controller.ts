import {createService} from "../services/organization.service.js"
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