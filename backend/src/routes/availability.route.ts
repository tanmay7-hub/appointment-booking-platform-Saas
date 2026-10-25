import { Router } from "express";
import {
  createAvailabilityController,
  getAvailabilityController,
  updateAvailabilityController,
  deleteAvailabilityController,
} from "../controllers/availibilty.contoller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOrganizationMemberShip } from "../middlewares/organization.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {checkStaffTargetAccess} from "../middlewares/staff.middleware.js";

const router = Router();

router.post(
  "/:organizationId/staff/:staffMemberId/availibility",
  authenticate,
  checkOrganizationMemberShip,
 requireRole("OWNER", "STAFF"),
  checkStaffTargetAccess,
  createAvailabilityController,
);
router.get(
  "/:organizationId/staff/:staffMemberId/availibility",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER", "STAFF"),
  checkStaffTargetAccess,
  getAvailabilityController,
);
router.patch(
  "/:organizationId/staff/:staffMemberId/availibility/:availabilityId",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER", "STAFF"),
  checkStaffTargetAccess,
  updateAvailabilityController,
);

router.delete(
  "/:organizationId/staff/:staffMemberId/availibility/:availabilityId",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("STAFF" , "OWNER"),
  checkStaffTargetAccess,
  deleteAvailabilityController,
);
export default router;