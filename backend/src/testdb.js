import prisma from "./config/prisma.js";

async function testDatabase() {
  try {
    await prisma.$connect();
    
    const result = await prisma.$queryRaw`SELECT NOW()`;
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
