import type { Request, Response } from "express";
import {
  createAvailabilityException,
  getAvailabilityException,
  updateAvailabilityException,
  deleteAvailabilityException,
} from "../services/availability-exception.service.js";
import {
  createAvailabilityExceptionSchema,
  updateAvailabilityExceptionSchema,
} from "../validations/availability-exception.validation.js";

export async function deleteAvailabilityExceptionController(
  req: Request,
  res: Response,
) {
  try {
    const { organizationId, staffMemberId, exceptionId } = req.params;

    if (!organizationId || !staffMemberId || !exceptionId) {
      return res.status(400).json({ message: "Invalid Input" });
    }
    if (
      typeof organizationId !== "string" ||
      typeof staffMemberId !== "string" ||
      typeof exceptionId !== "string"
    ) {
      return res.status(400).json({ message: "Invalid Input" });
    }

    const exception = await deleteAvailabilityException(
      organizationId,
      staffMemberId,
      exceptionId,
    );

    return res
      .status(200)
      .json({
        message: "Availability exception deleted successfully",
        exception,
      });
  } catch (err) {
     if (
      err instanceof Error &&
      err.message === "Availability exception not found"
    ) {
      return res.status(404).json({
        message: "Availability exception not found",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export async function updateAvailabilityExceptionController(
  req: Request,
  res: Response,
) {
  try {
    const { organizationId, staffMemberId, exceptionId } = req.params;

    if (!organizationId || !staffMemberId || !exceptionId) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    const result = updateAvailabilityExceptionSchema.safeParse(req.body);

    if (
      !result.success ||
      typeof organizationId !== "string" ||
      typeof staffMemberId !== "string" ||
      typeof exceptionId !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input",
        error: result.error?.flatten,
      });
    }

    const exception = await updateAvailabilityException(
      result.data,
      organizationId,
      staffMemberId,
      exceptionId,
    );

    return res.status(200).json({
      message: "Availability exception updated successfully",
      exception,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === "Availability exception not found"
    ) {
      return res.status(404).json({
        message: "Availability exception not found",
      });
    }

    if (
      err instanceof Error &&
      err.message === "Availability exception already exists"
    ) {
      return res.status(409).json({
        message: "Availability exception already exists",
      });
    }

    if (
      err instanceof Error &&
      (err.message ===
        "Start time and end time are required for custom hours" ||
        err.message === "End time must be after start time" ||
        err.message === "UNAVAILABLE cannot have custom hours")
    ) {
      return res.status(400).json({
        message: err.message,
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
export async function getAvailabilityExceptionController(
  req: Request,
  res: Response,
) {
  try {
    const { organizationId, staffMemberId } = req.params;

    if (
      !organizationId ||
      !staffMemberId ||
      typeof organizationId !== "string" ||
      typeof staffMemberId !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const Allexception = await getAvailabilityException(
      organizationId,
      staffMemberId,
    );

    return res.status(200).json({ message: "Exception fetched", Allexception });
  } catch (err) {
    if (err instanceof Error && err.message === "Staff member not found") {
      return res.status(404).json({ message: "Staff member not found" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export async function createAvailabilityExceptionController(
  req: Request,
  res: Response,
) {
  try {
    const { organizationId, staffMemberId } = req.params;

    if (!organizationId || !staffMemberId) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    const result = createAvailabilityExceptionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.flatten(),
      });
    }
    if (
      typeof organizationId !== "string" ||
      typeof staffMemberId !== "string"
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }
    const exception = await createAvailabilityException(
      result.data,
      organizationId,
      staffMemberId,
    );

    return res.status(201).json({
      message: "Availability exception created successfully",
      exception,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Staff member not found") {
      return res.status(404).json({
        message: "Staff member not found",
      });
    }

    if (
      err instanceof Error &&
      err.message === "Availability exception already exists"
    ) {
      return res.status(409).json({
        message: "Availability exception already exists",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}
