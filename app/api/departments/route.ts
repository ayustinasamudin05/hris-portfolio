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

    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data department.",
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
            "Anda tidak memiliki akses untuk menambahkan department.",
        },
        { status: 403 }
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

    const existingDepartment = await prisma.department.findUnique({
      where: {
        name: normalizedName,
      },
    });

    if (existingDepartment) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama department sudah digunakan.",
        },
        { status: 409 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name: normalizedName,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Department berhasil ditambahkan.",
        data: department,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create department error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan department.",
      },
      { status: 500 }
    );
  }
}
