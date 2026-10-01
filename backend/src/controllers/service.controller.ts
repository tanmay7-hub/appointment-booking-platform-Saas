import {
  createService,
  getOrganizationServices,
  getServiceById,
  updateService, 
  deleteService
} from "../services/organization.service.js";
import { createServiceSchema  , updateServiceSchema } from "../validations/service.validation.js";
import { Request, Response } from "express";

export async function createServiceController(req: Request, res: Response) {
  try {
    console.log(req.body);
    const results = createServiceSchema.safeParse(req.body);
    if (!results.success) {
      return res
        .status(400)
        .json({ message: "Invalid Input", err: results.error });
    }

    const { organizationId } = req.params;
    if (typeof organizationId !== "string") {
      return res.status(400).json({ message: "Organization ID is required" });
    }
    const { name, description, price, durationMinutes } = results.data;

    const service = await createService(
      { name, description, price, durationMinutes },
      organizationId,
    );

    return res
      .status(201)
      .json({ message: "service created successfully", service });
  } catch (err) {
    if (err instanceof Error && err.message === "Organization Not Found") {
      return res.status(422).json({ message: "Unprocessable Entity" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteServiceController (req: Request , res : Response){
  try{
    const {serviceId , organizationId} = req.params;
    if (
      !serviceId ||
      !organizationId ||
      typeof organizationId !== "string" ||
      typeof serviceId !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "ServiceId and OrganizationId are required." });
    }

    const deletedService = await deleteService(organizationId , serviceId);

    return res.status(200).json({deletedService});

  }catch(err){
    if(err instanceof Error && err.message === "Service Not Found"){
       return res.status(404).json({message : "Service Not Found"});
    }

    return res.status(500).json({message : "Internal Server Error"});
  }
}

export async function updateServiceController(req : Request , res: Response ){
  try{

    const result = updateServiceSchema.safeParse(req.body);

    if(!result.success){
      return res.status(401).json({message : "Invalid Input"});
    }
    const {serviceId  , organizationId} = req.params;
    if(typeof serviceId !== "string" || typeof organizationId !== "string"){
      return res.status(400).json({message : "Service ID and Organization ID are required"});
    }
    const service = await updateService( result.data  , serviceId , organizationId  );
    
    return res.status(200).json({message : "Service updated successfully" , service});

  }catch(err){
    if(err instanceof Error && err.message === "Service Not Found"){
      return res.status(404).json({message : "Service Not Found"});
    }

    return res.status(500).json({message  : "Internal Server Error"});
  }
}
export async function getServiceByIdController(req: Request, res: Response) {
  try {
    const { serviceId, organizationId } = req.params;

    if (
      !serviceId ||
      !organizationId ||
      typeof organizationId !== "string" ||
      typeof serviceId !== "string"
    ) {
      return res
        .status(400)
        .json({ message: "ServiceId and OrganizationId are required." });
    }

    const service = await getServiceById(organizationId , serviceId);

    return res.status(200).json({ service });
  } catch (err) {
    if (err instanceof Error && err.message === "Service Not Found") {
      return res.status(404).json({
        message: "Service Not Found",
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function getServiceController(req: Request, res: Response) {
  try {
    const { organizationId } = req.params;

    if (typeof organizationId !== "string" || !organizationId) {
      return res.status(400).json({ message: "OrganizationId is required" });
    }

    const allServices = await getOrganizationServices(organizationId);

    return res
      .status(200)
      .json({ message: "All services fetched.", services: allServices });
  } catch (err) {
    if (err instanceof Error && err.message === "Organization Not Found") {
      return res.status(404).json({ message: "Data Not Found" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
