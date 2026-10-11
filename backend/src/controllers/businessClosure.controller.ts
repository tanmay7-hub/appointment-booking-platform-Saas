import type { Request, Response } from "express";
import {createBusinessClosure , getBusinessClosure} from "../services/businessClosures.service"
import {createBusinessClosureSchema} from "../validations/buisnessClosure.validation"



export async function getBusinessController(
  req : Request ,
  res : Response
){
  try{
    const { organizationId } = req.params;

    if(!organizationId || typeof organizationId !== "string"){
      return res.status(400).json({message : "Invalid input"});
    }

    const closures = await getBusinessClosure(organizationId);

    return res.status(200).json({closures});
  }catch(err){
     if (
      err instanceof Error &&
      err.message === "Organization not found"
    ) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export async function createBusinessClosureController(
    req: Request,
    res: Response
){
    try{ 
        const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({
        message: "Organization ID is required",
      });
    }
    if(typeof organizationId !== "string"){
      return res.status(400).json({message : "Invalid input"});
    }

    const result = createBusinessClosureSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.flatten(),
      });
    }
   
    const closure = await createBusinessClosure(result.data , organizationId);
    
    return res.status(201).json({
      message: "Business closure created successfully",
      closure,
    });

    }catch(err){
        if (
      err instanceof Error &&
      err.message === "Organization not found"
    ) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    if (
      err instanceof Error &&
      err.message === "Business closure already exists"
    ) {
      return res.status(409).json({
        message: "Business closure already exists",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
    }
}