import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../config/prisma.js", () => ({
  default: {
    appointment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    businessClosure: {
      findFirst: vi.fn(),
    },
    availabilityException: {
      findFirst: vi.fn(),
    },
    availability: {
      findMany: vi.fn(),
    },
  },
}));

import prisma from "../config/prisma.js";
import { rescheduleAppointment } from "../services/appoinment.service.js";

const mockPrisma = vi.mocked(prisma);

const appointmentId = "appointment-123";
const organizationId = "organization-123";
const customerId = "customer-123";
const staffMemberId = "staff-member-123";
const serviceId = "service-123";

const futureStartTime = "2030-01-07T10:00:00.000Z";

const existingAppointment = {
  id: appointmentId,
  organizationId,
  customerId,
  staffMemberId,
  serviceId,
  status: "CONFIRMED",
  startTime: new Date("2030-01-07T09:00:00.000Z"),
  endTime: new Date("2030-01-07T10:00:00.000Z"),
  service: {
    id: serviceId,
    durationMinutes: 60,
  },
};

const regularAvailability = [
  {
    staffMemberId,
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "17:00",
  },
];

function mockValidReschedule() {
  vi.mocked(mockPrisma.appointment.findFirst)
    .mockResolvedValueOnce(existingAppointment as never)
    .mockResolvedValueOnce(null);

  vi.mocked(mockPrisma.businessClosure.findFirst).mockResolvedValue(null);

  vi.mocked(mockPrisma.availabilityException.findFirst).mockResolvedValue(
    null,
  );

  vi.mocked(mockPrisma.availability.findMany).mockResolvedValue(
    regularAvailability as never,
  );

  vi.mocked(mockPrisma.appointment.update).mockResolvedValue(
    {
      ...existingAppointment,
      startTime: new Date(futureStartTime),
      endTime: new Date("2030-01-07T11:00:00.000Z"),
    } as never,
  );
}

describe("rescheduleAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidReschedule();
  });

  it("reschedules an appointment successfully", async () => {
    const result = await rescheduleAppointment(
      { startTime: futureStartTime },
      organizationId,
      appointmentId,
      customerId,
      "CUSTOMER",
    );

    expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
      where: { id: appointmentId },
      data: {
        startTime: new Date(futureStartTime),
        endTime: new Date("2030-01-07T11:00:00.000Z"),
      },
    });

    expect(result.startTime).toEqual(new Date(futureStartTime));
  });

  it("rejects an appointment scheduled in the past", async () => {
    await expect(
      rescheduleAppointment(
        { startTime: "2020-01-06T10:00:00.000Z" },
        organizationId,
        appointmentId,
        customerId,
        "CUSTOMER",
      ),
    ).rejects.toThrow("Appointment must be scheduled in the future");

    expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
  });

  it("rejects an invalid start time", async () => {
    vi.mocked(mockPrisma.appointment.findFirst)
      .mockReset()
      .mockResolvedValueOnce(existingAppointment as never);

    await expect(
      rescheduleAppointment(
        { startTime: "invalid-date" },
        organizationId,
        appointmentId,
        customerId,
        "CUSTOMER",
      ),
    ).rejects.toThrow("Invalid appointment start time");

    expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
  });

  it("rejects rescheduling when the appointment does not exist or is inaccessible", async () => {
    vi.mocked(mockPrisma.appointment.findFirst)
      .mockReset()
      .mockResolvedValueOnce(null);

    await expect(
      rescheduleAppointment(
        { startTime: futureStartTime },
        organizationId,
        appointmentId,
        customerId,
        "CUSTOMER",
      ),
    ).rejects.toThrow("No appointment found");

    expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
  });

  it.each(["COMPLETED", "CANCELLED", "NO_SHOW"])(
    "rejects rescheduling an appointment with status %s",
    async (status) => {
      vi.mocked(mockPrisma.appointment.findFirst)
        .mockReset()
        .mockResolvedValueOnce({
          ...existingAppointment,
          status,
        } as never);

      await expect(
        rescheduleAppointment(
          { startTime: futureStartTime },
          organizationId,
          appointmentId,
          customerId,
          "CUSTOMER",
        ),
      ).rejects.toThrow("This appointment cannot be rescheduled");

      expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
    },
  );

  it("rejects rescheduling when the business is closed", async () => {
    vi.mocked(mockPrisma.businessClosure.findFirst).mockResolvedValue(
      {} as never,
    );

    await expect(
      rescheduleAppointment(
        { startTime: futureStartTime },
        organizationId,
        appointmentId,
        customerId,
        "CUSTOMER",
      ),
    ).rejects.toThrow("Business is closed on this date");

    expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
  });

  it("rejects rescheduling when staff is unavailable", async () => {
    vi.mocked(mockPrisma.appointment.findFirst)
      .mockReset()
      .mockResolvedValueOnce(existingAppointment as never);

    vi.mocked(mockPrisma.businessClosure.findFirst).mockResolvedValue(null);

    vi.mocked(mockPrisma.availabilityException.findFirst).mockResolvedValue({
      type: "UNAVAILABLE",
    } as never);

    await expect(
      rescheduleAppointment(
        { startTime: futureStartTime },
        organizationId,
        appointmentId,
        customerId,
        "CUSTOMER",
      ),
    ).rejects.toThrow("Staff member is unavailable on this date");

    expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
  });

  it("rejects appointments outside working hours", async () => {
    vi.mocked(mockPrisma.availability.findMany).mockResolvedValue(
      [
        {
          staffMemberId,
          dayOfWeek: "MONDAY",
          startTime: "09:00",
          endTime: "10:30",
        },
      ] as never,
    );

    await expect(
      rescheduleAppointment(
        { startTime: futureStartTime },
        organizationId,
        appointmentId,
        customerId,
        "CUSTOMER",
      ),
    ).rejects.toThrow("Appointment is outside staff working hours");

    expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
  });

  it("rejects a time slot occupied by another active appointment", async () => {
    vi.mocked(mockPrisma.appointment.findFirst)
      .mockReset()
      .mockResolvedValueOnce(existingAppointment as never)
      .mockResolvedValueOnce({
        ...existingAppointment,
        id: "another-appointment",
      } as never);

    await expect(
      rescheduleAppointment(
        { startTime: futureStartTime },
        organizationId,
        appointmentId,
        customerId,
        "CUSTOMER",
      ),
    ).rejects.toThrow("This time slot is already booked");

    expect(mockPrisma.appointment.update).not.toHaveBeenCalled();
  });

  it("excludes the appointment being rescheduled from the overlap check", async () => {
    await rescheduleAppointment(
      { startTime: futureStartTime },
      organizationId,
      appointmentId,
      customerId,
      "CUSTOMER",
    );

    expect(mockPrisma.appointment.findFirst).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          id: { not: appointmentId },
          staffMemberId,
          status: { in: ["PENDING", "CONFIRMED"] },
        }),
      }),
    );
  });
});