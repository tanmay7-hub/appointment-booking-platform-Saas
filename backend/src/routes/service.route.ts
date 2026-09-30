import {Router} from "express";
import { authenticate } from "../middlewares/auth.middleware.js"
import {checkOrganizationMemberShip} from "../middlewares/organization.middleware.js";
import {requireRole} from "../middlewares/role.middleware.js"

import {createServiceController} from "../controllers/service.controller.js"
const router = Router();

router.post("/:organizationId/services" ,authenticate , checkOrganizationMemberShip , requireRole("STAFF" , "OWNER") , createServiceController);



export default router;