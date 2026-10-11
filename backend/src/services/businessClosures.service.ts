import prisma from "../config/prisma.js";
import { CreateBusinessClosureInput } from "../validations/buisnessClosure.validation.js";

export async function createBusinessClosure(
  input: CreateBusinessClosureInput,
  organizationId: string,
) {
  const organization = await prisma.organization.findUnique({
    where: {
      id: organizationId,
    },
  });
  if (!organization) {
    throw new Error("Organization not found");
  }

  const date = new Date(input.date);

  const existingClosure = await prisma.businessClosure.findUnique({
    where: {
      organizationId_date: {
        organizationId,
        date,
      },
    },
  });

  if (existingClosure) {
    throw new Error("Buisness closure already exists");
  }

  const closure = await prisma.businessClosure.create({
    data: {
      organizationId,
      date,
      reason: input.reason,
    },
  });

  return closure;
}
