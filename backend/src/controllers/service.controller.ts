import {
  createService,
  getOrganizationServices,
  getServiceById,
  updateService, 
  deleteService,
  addStaffMember,
  assignServiceToStaff,
  getStaffList,
  getStaffService
} from "../services/organization.service.js";
import { createServiceSchema  , updateServiceSchema } from "../validations/service.validation.js";
import { Request, Response } from "express";

export async function createServiceController(req: Request, res: Response) {
  try {
   
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

export async function getStaffListController(req : Request , res : Response){
  try{
    const {organizationId } =  req.params;

    if(!organizationId || typeof organizationId !== "string" ){
      return res.status(400).json({message : "Invalid Organization Id"});
    }

    const staffList = await getStaffList(organizationId);

    return res.status(200).json({staffList});
  }catch(err){
     return res.status(500).json({message : "Internal Server Error"});
  }
}

export async function getStaffServiceController(req : Request , res : Response){
   try{
     const {organizationId , staffMemberId } = req.params;

     if(!organizationId || !staffMemberId || typeof organizationId !== "string" || typeof staffMemberId !== "string"){
      return res.status(400).json({message : "Invalid Input"});
     }

     const staffService = await getStaffService(organizationId , staffMemberId);

     return res.status(200).json({staffService});

   }catch(err){
    return res.status(500).json({message : "Internal Server Error"});
   }
}
export async function assignServiceToStaffController(req:Request , res : Response){
  try{
     const {organizationId , serviceId , staffMemberId} = req.params;

     if(!organizationId || !serviceId || !staffMemberId){
       return res.status(400).json({message : "Invalid Input"});
     }
     if(typeof organizationId !== "string" || typeof serviceId !== "string" ||  typeof staffMemberId !== "string"){
      return res.status(400).json({message : "Invalid Input"});
     }
     const assignment = await assignServiceToStaff(organizationId , serviceId , staffMemberId);


     return res.status(201).json({message : "Assigned service" , assignment});
  }catch(err){

      if(err instanceof Error && err.message === "Staff Member does not belong to the organization"){
         return res.status(409).json({message : "Staff Member does not belong to this organization"});
      }
      if(err instanceof Error && err.message === "No service found"){
         return res.status(404).json({message : "No service found"});
      }
      if(err instanceof Error && err.message === "Service already assigned to this staff member"){
        return res.status(409).json({message : "Service is already assigned to this staff member"});
      }
     return res.status(500).json({message : "Internal Server Error"})
  }
}
export async function addStaffMemberController(req:Request , res: Response){
   try{
       const { organizationId} = req.params;
       const {userId} = req.body;

       if(!organizationId || !userId){
          return res.status(404).json({message : "OrganizationId Not Found"});
       }
       if(typeof userId !== "string" || typeof organizationId !== "string"){
          return res.status(422).json({message : "Invalid input"});
       }

       const  new_membership = await addStaffMember(userId , organizationId);
    
       return res.status(201).json({new_membership});

   }catch(err){
      if(err instanceof Error && err.message === "User already is A member"){
        return res.status(409).json({message : "User already is a member"});
      }
      return res.status(500).json({message : "Internal server error"});
   }
}

export async function deactivateServiceController (req: Request , res : Response){
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
