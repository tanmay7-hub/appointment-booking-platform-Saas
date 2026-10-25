import type { Request, Response, NextFunction } from "express";
import prisma from "../config/prisma.js";

export async function checkStaffTargetAccess(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.user || !req.organization) {
      return res.status(401).json({
        message: "Authentication and organization context are required",
      });
    }

    const { organizationId, staffMemberId } = req.params;

    if (!organizationId || !staffMemberId) {
      return res.status(400).json({
        message: "Organization ID and staff member ID are required",
      });
    }

    if(typeof organizationId !== "string" || typeof staffMemberId !== "string"){
       return res.status(400).json({message : "Invalid input"});
    }

    const staffMember = await prisma.organizationMember.findFirst({
      where: {
        id: staffMemberId,
        organizationId,
        role: "STAFF",
      },
    });

    if (!staffMember) {
      return res.status(404).json({
        message: "Staff member not found",
      });
    }


    if (req.organization.role === "OWNER") {
      return next();
    }

  
    if (staffMember.userId !== req.user.userId) {
      return res.status(403).json({
        message: "You can manage only your own availability",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}