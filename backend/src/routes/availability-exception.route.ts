import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOrganizationMemberShip } from "../middlewares/organization.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {Router} from "express";
import {createAvailabilityExceptionController , getAvailabilityExceptionController} from "../controllers/availability-exception.controller.js";

const router = Router();

router.post(
  "/:organizationId/staff/:staffMemberId/availability-exceptions",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER", "STAFF"),
  createAvailabilityExceptionController
);
router.get(
  "/:organizationId/staff/:staffMemberId/availability-exceptions",
  authenticate,
  checkOrganizationMemberShip,
  getAvailabilityExceptionController
);

router.post(
  "/:organizationId/staff/:staffMemberId/availability-exceptions/:exceptionId",
  authenticate ,
  checkOrganizationMemberShip,
  requireRole("STAFF" ,"OWNER"),
  
)
