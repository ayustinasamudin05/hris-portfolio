import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET department by ID
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const departmentId = Number(id);

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { success: false, message: "Department ID tidak valid." },
        { status: 400 }
      );
    }

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: {
            employees: true,
            positions: true,
          },
        },
      },
    });

    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data department.",
      },
      { status: 500 }
    );
  }
}

// PUT department
export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN" && user.role !== "HR_MANAGER") {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses untuk mengubah department.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const departmentId = Number(id);

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { success: false, message: "Department ID tidak valid." },
        { status: 400 }
      );
    }

    const existingDepartment = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        {
          success: false,
          message: "Department tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama department wajib diisi.",
        },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();

    const duplicateDepartment = await prisma.department.findFirst({
      where: {
        name: normalizedName,
        id: {
          not: departmentId,
        },
      },
    });

    if (duplicateDepartment) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama department sudah digunakan.",
        },
        { status: 409 }
      );
    }

    const department = await prisma.department.update({
      where: {
        id: departmentId,
      },
      data: {
        name: normalizedName,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Department berhasil diperbarui.",
      data: department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui department.",
      },
      { status: 500 }
    );
  }
}