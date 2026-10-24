import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const department = await prisma.department.create({
    data: {
      name: "Information Technology",
      description: "Department responsible for information technology.",
    },
  });

  const position = await prisma.position.create({
    data: {
      name: "System Administrator",
      description: "Responsible for managing IT systems and infrastructure.",
      departmentId: department.id,
    },
  });

  const employee = await prisma.employee.create({
    data: {
      employeeCode: "EMP001",
      firstName: "Admin",
      lastName: "HRIS",
      email: "admin@hris.local",
      phone: "081234567890",
      hireDate: new Date(),
      employmentStatus: "ACTIVE",
      departmentId: department.id,
      positionId: position.id,
    },
  });

  const adminPassword = process.env.ADMIN_SEED_PASSWORD;

if (!adminPassword) {
  throw new Error("ADMIN_SEED_PASSWORD belum diatur.");
}

const passwordHash = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.create({
    data: {
      email: "admin@hris.local",
      passwordHash,
      role: "ADMIN",
      employeeId: employee.id,
      isActive: true,
    },
  });

  console.log("Seed berhasil!");
  console.log("Email:", user.email);
  
  console.log("Role:", user.role);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });