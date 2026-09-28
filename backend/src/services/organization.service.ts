import prisma from "../config/prisma.js";
import type { createOrganizationInput } from "../validations/organization.validation.js";

export async function createOrganization(
  input: createOrganizationInput,
  userId: string,
) {
    const { name, slug } = input;

    const existingOrganization = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrganization) {
      throw  new Error("Organization already exists");
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

      return {org , memberShip};
    });

    return results;
 
}
