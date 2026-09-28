import Router from "express"
import { authenticate } from "../middlewares/auth.middleware.js"
import { createOrganizationMember , getOrganization} from "../controllers/organization.controller.js"
const router = Router();

router.post("/" , authenticate , createOrganizationMember);
router.get("/" , authenticate , getOrganization);

export default router;