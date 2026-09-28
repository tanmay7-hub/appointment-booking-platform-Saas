import Router from "express"
import { authenticate } from "../middlewares/auth.middleware.js"
import { createOrganizationMember , getOrganization , getOrganizationFromId} from "../controllers/organization.controller.js"
import {checkOrganizationMemberShips} from "../middlewares/organization.middleware.js";
import {requireRoles} from "../middlewares/role.middleware.js"
const router = Router();

router.post("/" , authenticate , createOrganizationMember);
router.get("/" , authenticate ,  getOrganization);
router.get("/:organizationId" , authenticate , checkOrganizationMemberShips , requireRoles("OWNER") , getOrganizationFromId );

export default router;