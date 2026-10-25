import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOrganizationMemberShip } from "../middlewares/organization.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { checkStaffTargetAccess } from "../middlewares/staff.middleware.js";
import { Router } from "express";
import {
  createAvailabilityExceptionController,
  getAvailabilityExceptionController,
  updateAvailabilityExceptionController,
  deleteAvailabilityExceptionController,
} from "../controllers/availability-exception.controller.js";

const router = Router();

router.post(
  "/:organizationId/staff/:staffMemberId/availability-exceptions",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER", "STAFF"),
  checkStaffTargetAccess,
  createAvailabilityExceptionController,
);
router.get(
  "/:organizationId/staff/:staffMemberId/availability-exceptions",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER", "STAFF"),
  checkStaffTargetAccess,
  getAvailabilityExceptionController,
);

router.patch(
  "/:organizationId/staff/:staffMemberId/availability-exceptions/:exceptionId",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("STAFF", "OWNER"),
  checkStaffTargetAccess,
  updateAvailabilityExceptionController,
);

router.delete(
  "/:organizationId/staff/:staffMemberId/availability-exceptions/:exceptionId",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER", "STAFF"),
  checkStaffTargetAccess,
  deleteAvailabilityExceptionController,
);

export default router;
