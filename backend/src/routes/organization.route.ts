import Router from "express"
import { createOrganizationMember , getOrganization , getOrganizationFromId} from "../controllers/organization.controller.js"
import { authenticate } from "../middlewares/auth.middleware.js"
import {checkOrganizationMemberShip} from "../middlewares/organization.middleware.js";
import {requireRole} from "../middlewares/role.middleware.js"
const router = Router();

router.post("/" , authenticate , createOrganizationMember);
router.get("/" , authenticate ,  getOrganization);
router.get("/:organizationId" , authenticate , checkOrganizationMemberShip , requireRole("OWNER") , getOrganizationFromId );


export default router;