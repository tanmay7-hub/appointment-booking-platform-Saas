import type { Request, Response } from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  deleteAppointment,
  rescheduleAppointment,
  updateAppointmentStatus
} from "../services/appoinment.service.js";
import { createAppointmentSchema , updateAppointmentStatusSchema} from "../validations/appointment.validation.js";



export async function updateAppointmentStatusController(
  req: Request,
  res: Response
) {
  try {
    const { organizationId, appointmentId } = req.params;

    if (!organizationId || !appointmentId) {
      return res.status(400).json({
        message: "Organization ID and appointment ID are required",
      });
    }
    if (
      typeof organizationId !== "string" ||
      typeof appointmentId !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!req.user || !req.organization) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = updateAppointmentStatusSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.flatten(),
      });
    }

    const appointment = await updateAppointmentStatus(
      result.data,
      organizationId,
      appointmentId,
      req.user.userId,
      req.organization.role
    );

    return res.status(200).json({
      message: "Appointment status updated successfully",
      appointment,
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "Appointment not found") {
        return res.status(404).json({ message: err.message });
      }

      if (
        err.message === "You cannot update appointment status" ||
        err.message === "Invalid appointment status transition"
      ) {
        return res.status(409).json({ message: err.message });
      }
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export async function rescheduleAppointmentController(req: Request, res: Response) {
  try {
    const { organizationId, appointmentId } = req.params;
    const {startTime } = req.body;
    if (!req.user || !req.organization) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    if (!organizationId || !appointmentId || !startTime){
      return res.status(400).json({ message: "Invalid Input" });
    }

    if (
      typeof organizationId !== "string" ||
      typeof appointmentId !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const updatedAppointment = await rescheduleAppointment(
      startTime,
      organizationId,
      appointmentId,
      req.user.userId,
      req.organization.role,
    );


    return res.status(200).json({updatedAppointment});
  } catch (err) {
     if (err instanceof Error && err.message === "No appointment found") {
      return res.status(404).json({ message: "appointment not found" });
    }
    if (
      err instanceof Error &&
      err.message === "Appointment must be scheduled in the future"
    ) {
      return res
        .status(404)
        .json({ message: "Appointment must be scheduled in the future" });
    }


    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function deleteAppointmentController(req: Request, res: Response) {
  try {
    const { organizationId, appointmentId } = req.params;

    if (!req.user || !req.organization) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    if (!organizationId || !appointmentId) {
      return res.status(400).json({ message: "Invalid Input" });
    }

    if (
      typeof organizationId !== "string" ||
      typeof appointmentId !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const deletedAppointment = await deleteAppointment(
      organizationId,
      appointmentId,
      req.user.userId,
      req.organization.role,
    );

    return res.status(200).json({ deletedAppointment });
  } catch (err) {
    if (err instanceof Error && err.message === "No appointment found") {
      return res.status(404).json({ message: "appointment not found" });
    }
    if (
      err instanceof Error &&
      err.message === "Appointment cannot be cancelled"
    ) {
      return res
        .status(404)
        .json({ message: "Appointment cannot be cancelled" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}
export async function getAppointmentByIdController(
  req: Request,
  res: Response,
) {
  try {
    const { organizationId, appointmentId } = req.params;

    if (!req.user || !req.organization) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    if (!organizationId || !appointmentId) {
      return res.status(400).json({ message: "Invalid Input" });
    }

    if (
      typeof organizationId !== "string" ||
      typeof appointmentId !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const appointment = await getAppointmentById(
      organizationId,
      appointmentId,
      req.user.userId,
      req.organization.role,
    );

    return res.status(200).json({ appointment });
  } catch (err) {
    if (err instanceof Error && err.message === "No appointment found") {
      return res.status(404).json({ message: "appointment not found" });
    }
    return res.status(500).json({ message: "Internal server Error" });
  }
}
export async function getAppointmentsController(req: Request, res: Response) {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({
        message: "Organization ID is required",
      });
    }

    if (!req.user || !req.organization) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (typeof organizationId !== "string") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const appointments = await getAppointments(
      organizationId,
      req.user.userId,
      req.organization.role,
    );

    return res.status(200).json({ appointments });
  } catch {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export async function createAppointmentController(req: Request, res: Response) {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({
        message: "Organization ID is required",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const result = createAppointmentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.flatten(),
      });
    }

    if (typeof organizationId !== "string") {
      return res.status(400).json({ message: "Invalid Input" });
    }
    const appointment = await createAppointment(
      result.data,
      organizationId,
      req.user.userId,
    );

    return res.status(201).json({
      message: "Appointment created successfully",
      appointment,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "Customer is not a member of this organization"
    ) {
      return res.status(403).json({
        message: err.message,
      });
    }

    if (err instanceof Error && err.message === "Staff member not found") {
      return res.status(404).json({
        message: err.message,
      });
    }

    if (err instanceof Error && err.message === "Service not found") {
      return res.status(404).json({
        message: err.message,
      });
    }

    if (
      err instanceof Error &&
      err.message === "Service is not assigned to this staff member"
    ) {
      return res.status(409).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
