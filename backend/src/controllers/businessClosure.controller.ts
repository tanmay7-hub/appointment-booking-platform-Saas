import type { Request, Response } from "express";
import {createBusinessClosure , getBusinessClosure , updateBusinessClosure , deleteBusinessClosure} from "../services/businessClosures.service"
import {createBusinessClosureSchema , updateBusinessClosureSchema} from "../validations/buisnessClosure.validation"



export async function deleteBusinessClosureController(
  req: Request,
  res: Response
){
  try{

    const {organizationId , closureId} = req.params;

    if(!organizationId || !closureId){
      return res.status(400).json({message : "Invalid input"});
    }

    if(typeof organizationId !== "string" || typeof closureId !== "string"){
      return res.status(400).json({message : "Invalid input"});
    }

    const deletedClosure = await deleteBusinessClosure(organizationId , closureId);

    return res.status(200).json({deletedClosure});

  }catch(err){
    if(err instanceof Error && err.message === "Organization does not exists"){
        return res.status(404).json({message : "Organization not found"})
    }
    if(err instanceof Error && err.message === "Closure does not exists"){
       return res.status(404).json({message : "Closure does not exists"});
    }
    return res.status(500).json({message : "Internal Server Error"})
  }
}

export async function updateBusinessClosureController(
  req : Request ,
  res : Response
){
  try{
    const{ organizationId , closureId} = req.params;

    if(!organizationId || !closureId ){
      return res.status(400).json({message : "Invalid input"});
    }

    if(typeof organizationId !== "string" || typeof closureId !== "string"){
      return res.status(400).json({message : "Invalid input"});
    }
    const result = updateBusinessClosureSchema.safeParse(req.body);

    if(!result.success){
      return res.status(400).json({message : "Invalid input"});
    }
     const closure = await updateBusinessClosure(
      result.data,
      organizationId,
      closureId
    );

    return res.status(200).json({
      message: "Business closure updated successfully",
      closure,
    });
    
  }catch(err){

     if (
      err instanceof Error &&
      err.message === "Business closure not found"
    ) {
      return res.status(404).json({
        message: "Business closure not found",
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
    return res.status(500).json({message : "Internal server error"});
  }

}
export async function getBusinessClosureController(
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