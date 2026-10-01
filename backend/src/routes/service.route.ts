import {Router} from "express";
import { authenticate } from "../middlewares/auth.middleware.js"
import {checkOrganizationMemberShip} from "../middlewares/organization.middleware.js";
import {requireRole} from "../middlewares/role.middleware.js"

import {createServiceController , getServiceController , getServiceByIdController , updateServiceController} from "../controllers/service.controller.js"
const router = Router();

router.post("/:organizationId/services" ,authenticate , checkOrganizationMemberShip , requireRole("STAFF" , "OWNER") , createServiceController)
router.get( "/:organizationId/services" ,authenticate , checkOrganizationMemberShip ,  getServiceController);
router.get("/:organizationId/services/:serviceId", authenticate,checkOrganizationMemberShip , getServiceByIdController);
router.patch("/:organizationId/services/:serviceId" , authenticate , checkOrganizationMemberShip ,requireRole("STAFF" , "OWNER") ,updateServiceController );


export default router;