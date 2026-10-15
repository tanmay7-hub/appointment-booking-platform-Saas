import type {
  CreateAppointmentInput,
  RescheduleAppointmentInput,
  UpdateAppointmentStatusInput,
  PaginationInput,
  CursorPaginationInput,
} from "../validations/appointment.validation.js";
import prisma from "../config/prisma.js";

export async function getAvailableSlots(
  organizationId: string,
  staffMemberId: string,
  serviceId: string,
  dateString: string,
) {
  const requestedDate = new Date(`${dateString}T00:00:00.000Z`);

  const nextDate = new Date(requestedDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  const staffMember = await prisma.organizationMember.findFirst({
    where: {
      id: staffMemberId,
      organizationId,
      role: "STAFF",
    },
  });

  if (!staffMember) {
    throw new Error("Staff member not found");
  }

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      organizationId,
      isActive: true,
      staffServices: {
        some: { staffMemberId },
      },
    },
  });

  if (!service) {
    throw new Error("Service not found or not assigned to staff");
  }

  const closure = await prisma.businessClosure.findFirst({
    where: {
      organizationId,
      date: {
        gte: requestedDate,
        lt: nextDate,
      },
    },
  });

  if (closure) {
    return [];
  }

  const exception = await prisma.availabilityException.findFirst({
    where: {
      staffMemberId,
      date: {
        gte: requestedDate,
        lt: nextDate,
      },
    },
  });

  if (exception?.type === "UNAVAILABLE") {
    return [];
  }

  const dayNames = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ] as const;

  const dayOfWeek = dayNames[requestedDate.getUTCDay()];

  const schedules =
    exception?.type === "CUSTOM_HOURS"
      ? [
          {
            startTime: exception.startTime!,
            endTime: exception.endTime!,
          },
        ]
      : await prisma.availability.findMany({
          where: {
            staffMemberId,
            dayOfWeek,
          },
          orderBy: {
            startTime: "asc",
          },
        });

  if (schedules.length === 0) {
    return [];
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      organizationId,
      staffMemberId,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
      startTime: { lt: nextDate },
      endTime: { gt: requestedDate },
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const now = Date.now();
  const durationMs = service.durationMinutes * 60_000;
  const slotIntervalMs = 15 * 60_000;

  const availableSlots: {
    startTime: string;
    endTime: string;
  }[] = [];

  for (const schedule of schedules) {
    const [startHour, startMinute] = schedule.startTime.split(":").map(Number);

    const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

    const scheduleStart = new Date(requestedDate);
    scheduleStart.setUTCHours(startHour, startMinute, 0, 0);

    const scheduleEnd = new Date(requestedDate);
    scheduleEnd.setUTCHours(endHour, endMinute, 0, 0);

    for (
      let slotStart = scheduleStart.getTime();
      slotStart + durationMs <= scheduleEnd.getTime();
      slotStart += slotIntervalMs
    ) {
      const slotEnd = slotStart + durationMs;

      if (slotStart <= now) {
        continue;
      }

      const overlaps = appointments.some((appointment) => {
        return (
          slotStart < appointment.endTime.getTime() &&
          slotEnd > appointment.startTime.getTime()
        );
      });

      if (overlaps) {
        continue;
      }

      availableSlots.push({
        startTime: new Date(slotStart).toISOString(),
        endTime: new Date(slotEnd).toISOString(),
      });
    }
  }

  return availableSlots;
}
export async function updateAppointmentStatus(
  input: UpdateAppointmentStatusInput,
  organizationId: string,
  appointmentId: string,
  userId: string,
  role: "OWNER" | "STAFF" | "CUSTOMER",
) {
  if (role === "CUSTOMER") {
    throw new Error("Customer cannot update the appointment status");
  }
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      organizationId,
      ...(role === "STAFF" ? { staffMember: { userId } } : {}),
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const allowedTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED"],
    CONFIRMED: ["COMPLETED", "NO_SHOW"],
  };

  const allowedStatuses = allowedTransitions[appointment.status] ?? [];

  if (!allowedStatuses.includes(input.status)) {
    throw new Error("Invalid appointment status transition");
  }

  const updatedAppointment = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status: input.status,
    },
  });

  return updatedAppointment;
}
export async function rescheduleAppointment(
  input: RescheduleAppointmentInput,
  organizationId: string,
  appointmentId: string,
  userId: string,
  role: "OWNER" | "STAFF" | "CUSTOMER",
) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      organizationId,
      ...(role === "CUSTOMER" ? { customerId: userId } : {}),
      ...(role === "STAFF" ? { staffMember: { userId } } : {}),
    },
    include: {
      service: true,
    },
  });

  if (!appointment) {
    throw new Error("No appointment found");
  }
  const startTime = new Date(input.startTime);

  if (startTime <= new Date()) {
    throw new Error("Appointment must be scheduled in the future");
  }

  const endTime = new Date(
    startTime.getTime() + appointment.service.durationMinutes * 60 * 1000,
  );

  const updatedAppointment = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      startTime,
      endTime,
    },
  });

  return updatedAppointment;
}
export async function deleteAppointment(
  organizationId: string,
  appointmentId: string,
  userId: string,
  role: "OWNER" | "STAFF" | "CUSTOMER",
) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      organizationId,
      ...(role === "CUSTOMER" ? { customerId: userId } : {}),
      ...(role === "STAFF" ? { staffMember: { userId } } : {}),
    },
    include: {
      service: true,
    },
  });

  if (!appointment) {
    throw new Error("No appointment found");
  }

  if (
    appointment.status === "CANCELLED" ||
    appointment.status === "NO_SHOW" ||
    appointment.status === "COMPLETED"
  ) {
    throw new Error("Appointment cannot be cancelled");
  }

  const deletedAppointment = await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  return deletedAppointment;
}
export async function getAppointmentById(
  organizationId: string,
  appointmentId: string,
  userId: string,
  role: "OWNER" | "STAFF" | "CUSTOMER",
) {
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      organizationId,
      ...(role === "CUSTOMER" ? { customerId: userId } : {}),
      ...(role === "STAFF" ? { staffMember: { userId } } : {}),
    },
    include: {
      service: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      staffMember: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      payments: true,
    },
  });

  if (!appointment) {
    throw new Error("No appointment found");
  }

  return appointment;
}

export async function getAppointmentsCursor(
  input: CursorPaginationInput,
  organizationId: string,
  userId: string,
  role: "OWNER" | "STAFF" | "CUSTOMER",
) {
  const where = {
    organizationId,
    ...(role === "CUSTOMER" ? { customerId: userId } : {}),
    ...(role === "STAFF"
      ? {
          staffMember: {
            userId,
          },
        }
      : {}),
  };

  const limit = input.limit;
  const [appointments, count] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        staffMember: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      ...(input.cursor ? { skip: 1, cursor: input.cursor } : {}),
      take: input.limit,
      orderBy: [{ id: "asc" }, { startTime: "asc" }],
    }),
    prisma.appointment.count({
      where,
    }),
  ]);

  const totalPages = count / limit;
  return {
    appointments,
    pagination: {
      limit,
      totalPages,
    },
  };
}

export async function getAppointments(
  input: PaginationInput,
  organizationId: string,
  userId: string,
  role: "OWNER" | "STAFF" | "CUSTOMER",
) {
  const where = {
    organizationId,
    ...(role === "CUSTOMER" ? { customerId: userId } : {}),
    ...(role === "STAFF"
      ? {
          staffMember: {
            userId,
          },
        }
      : {}),
  };

  const limit = input.limit;
  const page = input.page;

  const skip = (page - 1) * limit;

  const [appointments, count] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            price: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        staffMember: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip,
      take: input.limit,
      orderBy: {
        startTime: "asc",
      },
    }),
    prisma.appointment.count({
      where,
    }),
  ]);
  const totalPages = count / limit;
  return {
    appointments,
    pagination: {
      limit,
      page,
      total: count,
      totalPages,
    },
  };
}
export async function createAppointment(
  input: CreateAppointmentInput,
  organizationId: string,
  customerId: string,
) {
  const customer = await prisma.organizationMember.findFirst({
    where: {
      userId: customerId,
      organizationId,
      role: "STAFF",
    },
  });

  if (!customer) {
    throw new Error("Customer is not a member of this  organization");
  }

  const staffMember = await prisma.organizationMember.findFirst({
    where: {
      userId: input.staffMemberId,
      organizationId,
      role: "STAFF",
    },
  });

  if (!staffMember) {
    throw new Error("Staff member not found");
  }
  const service = await prisma.service.findFirst({
    where: {
      id: input.serviceId,
      organizationId,
      isActive: true,
    },
  });

  if (!service) {
    throw new Error("service not found");
  }
  const isAssigned = await prisma.staffService.findUnique({
    where: {
      staffMemberId_serviceId: {
        staffMemberId: input.staffMemberId,
        serviceId: input.serviceId,
      },
    },
  });

  if (!isAssigned) {
    throw new Error("service is not assigned to staff member");
  }

  const startTime = input.startTime;

  const endTime = new Date(startTime + service.durationMinutes * 60 * 1000);

  const appointment = await prisma.appointment.create({
    data: {
      organizationId,
      customerId,
      staffMemberId: input.staffMemberId,
      serviceId: input.serviceId,
      startTime,
      endTime,
    },
  });

  return appointment;
}
