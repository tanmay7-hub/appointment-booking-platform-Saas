import {Router} from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOrganizationMemberShip } from "../middlewares/organization.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {createBusinessClosureController , getBusinessController} from "../controllers/businessClosure.controller"

const router = Router();


router.post(
  "/:organizationId/closures",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("OWNER"),
  createBusinessClosureController
);

router.get(
 "/:organizationId/closures",
  authenticate ,
  checkOrganizationMemberShip,
  getBusinessController
);
router.patch(
    "/:organizationId/closures/:closureId",
    
)

