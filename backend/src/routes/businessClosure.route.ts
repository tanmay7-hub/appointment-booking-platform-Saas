import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOrganizationMemberShip } from "../middlewares/organization.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  createBusinessClosureController,
  getBusinessClosureController,
  updateBusinessClosureController,
  deleteBusinessClosureController,
} from "../controllers/businessClosure.controller";

const router = Router();

router.post(
  "/:organizationId/closures",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER"),
  createBusinessClosureController,
);

router.get(
  "/:organizationId/closures",
  authenticate,
  checkOrganizationMemberShip,
  getBusinessClosureController,
);
router.patch(
  "/:organizationId/closures/:closureId",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER"),
  updateBusinessClosureController,
);
router.delete(
  "/:organizationId/closures/:closureId",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER"),
  deleteBusinessClosureController,
);
