import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET position by ID
export async function GET(
  request: Request,
  context: RouteContext
) {
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

    const { id } = await context.params;
    const positionId = Number(id);

    if (!Number.isInteger(positionId) || positionId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Position ID tidak valid.",
        },
        { status: 400 }
      );
    }

    const position = await prisma.position.findUnique({
      where: {
        id: positionId,
      },
      include: {
        department: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!position) {
      return NextResponse.json(
        {
          success: false,
          message: "Position tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: position,
    });
  } catch (error) {
    console.error("Get position error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data position.",
      },
      { status: 500 }
    );
  }
}

// PUT position
export async function PUT(
  request: Request,
  context: RouteContext
) {
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
            "Anda tidak memiliki akses untuk mengubah position.",
        },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const positionId = Number(id);

    if (!Number.isInteger(positionId) || positionId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Position ID tidak valid.",
        },
        { status: 400 }
      );
    }

    const existingPosition = await prisma.position.findUnique({
      where: {
        id: positionId,
      },
    });

    if (!existingPosition) {
      return NextResponse.json(
        {
          success: false,
          message: "Position tidak ditemukan.",
        },
        { status: 404 }
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

    const duplicatePosition = await prisma.position.findFirst({
      where: {
        name: normalizedName,
        departmentId: parsedDepartmentId,
        id: {
          not: positionId,
        },
      },
    });

    if (duplicatePosition) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Position dengan nama tersebut sudah ada di department ini.",
        },
        { status: 409 }
      );
    }

    const position = await prisma.position.update({
      where: {
        id: positionId,
      },
      data: {
        name: normalizedName,
        description: description?.trim() || null,
        departmentId: parsedDepartmentId,
      },
      include: {
        department: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Position berhasil diperbarui.",
      data: position,
    });
  } catch (error) {
    console.error("Update position error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui position.",
      },
      { status: 500 }
    );
  }
}
