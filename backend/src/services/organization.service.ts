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
export async function deleteService(organizationId : string , serviceId : string){

  const service = await prisma.service.findFirst({
     where:{
      id : serviceId,
      organizationId
     }
  });
  if(!service){
    throw new Error("Service Not Found.");


    const updatedService = await prisma.service.update({
       where:{
         id: serviceId,
         organizationId
       },
       data:{
          isActive : false
       } 
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
