import { Router } from "express";
import { register, login } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.get("/login", login);
router.get("/me", authenticate, (req, res) => {
    return res.status(200).json({
        message: "Authentication working fine",
        userId: req.user?.userId
    });
});
export default router;
//# sourceMappingURL=auth.route.js.map