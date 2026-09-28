import Router from "express"
import { authenticate } from "../middlewares/auth.middleware.js"
import { createOrganizationMember} from "../controllers/organization.controller.js"
const router = Router();

router.post("/" , authenticate , createOrganizationMember);

export default router;