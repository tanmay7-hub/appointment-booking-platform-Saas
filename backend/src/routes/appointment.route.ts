import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { checkOrganizationMemberShip } from "../middlewares/organization.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import {
  createAppointmentController,
  getAppointmentsController,
  getAppointmentByIdController,
} from "../controllers/appointment.controller.js";
const router = Router();

router.post(
  "/:organizationId/appointments",
  authenticate,
  checkOrganizationMemberShip,
  requireRole("CUSTOMER"),
  createAppointmentController,
);
router.get(
  "/:organizationId/appointments",
  authenticate,
  checkOrganizationMemberShip,
  getAppointmentsController,
);
router.get(
  "/:organizationId/appointments/:appointmentId",
  authenticate,
  checkOrganizationMemberShip,
  getAppointmentByIdController,
);
