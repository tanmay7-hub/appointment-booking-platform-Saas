import prisma from "../config/prisma.js";
import type { createOrganizationInput } from "../validations/organization.validation.js";
import type {
  CreateServiceInput,
  UpdateSchemaInput,
} from "../validations/service.validation.js";

export async function updateService(
  input: UpdateSchemaInput,
  serviceId: string,
  organizationId: string,
) {
  const { name, description, price, durationMinutes } = input;

  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      organizationId,
    },
  });

  if (!service) {
    throw new Error("Service Not Found");
  }
  const updatedService = await prisma.service.update({
    where: {
      id: serviceId,
    },
    data: input,
  });

  return updatedService;
}
 
export async function getStaffService(
  organizationId: string,
  staffMemberId: string,
) {
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

  const serviceAssigned = await prisma.staffService.findMany({
    where: {
      staffMemberId,
    },
    include: {
      service: true,
    },
  });

  return serviceAssigned;
}
export async function getStaffList(organizationId: string) {
  const staffList = await prisma.organizationMember.findMany({
    where: {
      role: "STAFF",
      organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return staffList;
}
export async function addStaffMember(userId: string, organizationId: string) {
  const check = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
    },
  });

  if (check) {
    throw new Error("User already is A member");
  }
  const new_member = await prisma.organizationMember.create({
    data: {
      organizationId,
      userId,
      role: "STAFF",
    },
  });

  return new_member;
}
export async function assignServiceToStaff(
  organizationId: string,
  serviceId: string,
  staffMemberId: string,
) {
  const UserCheck = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: staffMemberId,
      role: "STAFF",
    },
  });

  if (!UserCheck) {
    throw new Error("Staff member does not belong to the organization");
  }

  const serviceCheck = await prisma.service.findFirst({
    where: {
      id: serviceId,
      organizationId,
    },
  });
  if (!serviceCheck) {
    throw new Error("No service found");
  }

  const existingAssignment = await prisma.staffService.findUnique({
    where: {
      staffMemberId_serviceId: {
        staffMemberId,
        serviceId,
      },
    },
  });

  if (existingAssignment) {
    throw new Error("Service already assigned to this staff member");
  }
  const assignment = await prisma.staffService.create({
    data: {
      staffMemberId,
      serviceId,
    },
  });

  return assignment;
}
export async function deleteService(organizationId: string, serviceId: string) {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      organizationId,
    },
  });
  if (!service) {
    throw new Error("Service Not Found");

    const updatedService = await prisma.service.update({
      where: {
        id: serviceId,
        organizationId,
      },
      data: {
        isActive: false,
      },
    });

    return updatedService;
  }
}
export async function getServiceById(
  organizationId: string,
  serviceId: string,
) {
  const service = await prisma.service.findFirst({
    where: {
      id: serviceId,
      organizationId,
      isActive: true,
    },
  });
  if (!service) {
    throw new Error("Service Not Found");
  }
  return service;
}
export async function createService(
  input: CreateServiceInput,
  organizationId: string,
) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });
  if (!organization) {
    throw new Error("Organization Not Found");
  }
  const { name, description, price, durationMinutes } = input;

  const service = await prisma.service.create({
    data: {
      name,
      description,
      price,
      durationMinutes,
      organizationId,
    },
  });

  return service;
}
export async function getOrganizationServices(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
    include: {
      services: true,
    },
  });

  if (!organization) {
    throw new Error("Organization Not Found");
  }

  return organization.services;
}
export async function createOrganization(
  input: createOrganizationInput,
  userId: string,
) {
  const { name, slug } = input;

  const existingOrganization = await prisma.organization.findUnique({
    where: { slug },
  });

  if (existingOrganization) {
    throw new Error("Organization already exists");
  }

  const results = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name,
        slug,
        ownerId: userId,
      },
    });

    const memberShip = await tx.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: userId,
        role: "OWNER",
      },
    });

    return { org, memberShip };
  });

  return results;
}
export async function getOrganizationById(OrganizationId: string) {
  return prisma.organization.findUnique({ where: { id: OrganizationId } });
}
export async function getUserOrganization(userId: string) {
  const memberShips = await prisma.organizationMember.findMany({
    where: {
      userId,
    },
    include: {
      organization: true,
    },
  });

  return memberShips.map((memberShip) => ({
    id: memberShip.organization.id,
    name: memberShip.organization.name,
    slug: memberShip.organization.slug,
    role: memberShip.role,
  }));
}
