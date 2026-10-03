import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOrganizationMemberShip } from "../middlewares/organization.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  createServiceController,
  getServiceController,
  getServiceByIdController,
  updateServiceController,
  deactivateServiceController,
  addStaffMemberController,
  assignServiceToStaffController,
  getStaffListController,
  getStaffServiceController,
} from "../controllers/service.controller.js";
const router = Router();

router.post(
  "/:organizationId/services",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("STAFF", "OWNER"),
  createServiceController,
);
router.get(
  "/:organizationId/services",
  authenticate,
  checkOrganizationMemberShip,
  getServiceController,
);
router.get(
  "/:organizationId/services/:serviceId",
  authenticate,
  checkOrganizationMemberShip,
  getServiceByIdController,
);
router.patch(
  "/:organizationId/services/:serviceId",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("STAFF", "OWNER"),
  updateServiceController,
);
router.delete(
  "/:organizationId/services/:serviceId",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("STAFF", "OWNER"),
  deactivateServiceController,
);
router.post(
  "/:organizationId/members",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER"),
  addStaffMemberController,
);
router.get(
  "/:organizationId/members",
  authenticate,
  checkOrganizationMemberShip,
  getStaffListController,
);
router.post(
  "/:organizationId/staff/:staffMemberId/services",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER"),
  assignServiceToStaffController,
);
router.get(
  "/:organizationId/staff/:staffMemberId/services",
  authenticate,
  getStaffServiceController,
);

export default router;
