import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "kevin@jefe.com" },
    update: {
      name: "Kevin",
      role: "ADMIN",
      isActive: true,
      passwordHash: await hashPassword("kieroMoverElBote")
    },
    create: {
      email: "kevin@jefe.com",
      name: "Kevin",
      role: "ADMIN",
      isActive: true,
      passwordHash: await hashPassword("kieroMoverElBote")
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
