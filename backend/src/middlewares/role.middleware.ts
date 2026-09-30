import {Request , Response , NextFunction } from "express";
import  type {Role} from "../../generated/prisma/client.js"


export function requireRole(...allowedRoles : Role[]){
    return (req : Request , res : Response , next : NextFunction) =>{
         if(!req.organization){
            return res.status(403).json({message : "Organization Context Required"});
         }

         if(!allowedRoles.includes(req.organization.role)){
            return res.status(401).json({message : "You do not have the permission to perform this action"});
         }


         next();
    }
}
