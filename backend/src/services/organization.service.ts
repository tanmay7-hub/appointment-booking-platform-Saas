import prisma from "../config/prisma.js";
import type { createOrganizationInput } from "../validations/organization.validation.js";
import type { CreateServiceInput } from "../validations/service.validation.js";

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

  return  service;
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
