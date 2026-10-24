import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getCurrentUser } from "@/lib/current-user";

const VALID_ROLES = ["ADMIN", "HR_MANAGER", "EMPLOYEE"] as const;

type UserRole = (typeof VALID_ROLES)[number];

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (
      currentUser.role !== "ADMIN" &&
      currentUser.role !== "HR_MANAGER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses.",
        },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            employmentStatus: true,
            department: {
              select: {
                name: true,
              },
            },
            position: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (
      currentUser.role !== "ADMIN" &&
      currentUser.role !== "HR_MANAGER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.toLowerCase().trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const employeeId = Number(body.employeeId);

    const role = body.role as UserRole;

    if (!email || !password || !Number.isInteger(employeeId) || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, employeeId, dan role wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role tidak valid.",
        },
        { status: 400 }
      );
    }

    /*
     * Role hierarchy:
     *
     * ADMIN      -> dapat membuat HR_MANAGER / EMPLOYEE
     * HR_MANAGER -> hanya dapat membuat EMPLOYEE
     * EMPLOYEE   -> tidak dapat membuat akun
     */

    if (currentUser.role === "HR_MANAGER" && role !== "EMPLOYEE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "HR Manager hanya dapat membuat akun dengan role Employee.",
        },
        { status: 403 }
      );
    }

    if (currentUser.role === "ADMIN" && role === "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin tidak dapat membuat akun Admin lainnya.",
        },
        { status: 403 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 8 karakter.",
        },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        user: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (employee.employmentStatus !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Employee yang tidak aktif tidak dapat diberikan akun.",
        },
        { status: 400 }
      );
    }

    if (employee.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee tersebut sudah memiliki akun.",
        },
        { status: 409 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah digunakan oleh akun lain.",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        employeeId,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Akun berhasil dibuat.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}