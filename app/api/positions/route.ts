import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const positions = await prisma.position.findMany({
      include: {
        department: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    console.error("Get positions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data position.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN" && user.role !== "HR_MANAGER") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Anda tidak memiliki akses untuk menambahkan position.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { name, description, departmentId } = body;

    if (!name || !name.trim() || !departmentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Field wajib belum lengkap.",
        },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();
    const parsedDepartmentId = Number(departmentId);

    if (
      !Number.isInteger(parsedDepartmentId) ||
      parsedDepartmentId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Department ID tidak valid.",
        },
        { status: 400 }
      );
    }

    const department = await prisma.department.findUnique({
      where: {
        id: parsedDepartmentId,
      },
    });

    if (!department) {
      return NextResponse.json(
        {
          success: false,
          message: "Department tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    const existingPosition = await prisma.position.findFirst({
      where: {
        name: normalizedName,
        departmentId: parsedDepartmentId,
      },
    });

    if (existingPosition) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Position dengan nama tersebut sudah ada di department ini.",
        },
        { status: 409 }
      );
    }

    const position = await prisma.position.create({
      data: {
        name: normalizedName,
        description: description?.trim() || null,
        departmentId: parsedDepartmentId,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Position berhasil ditambahkan.",
        data: position,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create position error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan position.",
      },
      { status: 500 }
    );
  }
}
