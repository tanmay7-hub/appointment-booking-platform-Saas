import type { Request, Response } from "express";
import {
  createAvailability,
  getAvailability,
} from "../services/availibilty.service.js";
import { createAvailabilitySchema } from "../validations/availibility.validation.js";
export async function createAvailabilityController(
  req: Request,
  res: Response,
) {
  try {
    const { organizationId, staffMemberId } = req.params;
    const { dayOfWeek, startTime, endTime } = req.body;

    if (
      !organizationId ||
      !staffMemberId ||
      typeof organizationId !== "string" ||
      typeof staffMemberId !== "string"
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const result = createAvailabilitySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid input." });
    }

    const availability = await createAvailability(
      result.data,
      organizationId,
      staffMemberId,
    );

    return res.status(201).json({
      message: "Availability created successfully",
      availability,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Staff member not found") {
      return res.status(404).json({
        message: "Staff member not found",
      });
    }

    if (err instanceof Error && err.message === "Availability already exists") {
      return res.status(409).json({
        message: "Availability already exists",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export async function getAvailabilityController(req: Request, res: Response) {
  try {
    const { organizationId, staffMemberId } = req.params;

    if (
      !organizationId ||
      !staffMemberId ||
      typeof organizationId !== "string" ||
      typeof staffMemberId !== "string"
    ) {
      return res.status(400).json({ message: "please provide all fields" });
    }

    const availability = await getAvailability(organizationId, staffMemberId);

    return res.status(200).json({ availability });
  } catch (err) {
    if (err instanceof Error && err.message === "Staff member not found") {
      return res.status(404).json({
        message: "Staff member not found",
      });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
