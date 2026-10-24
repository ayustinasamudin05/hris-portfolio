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

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalDepartments,
      totalPositions,
    ] = await Promise.all([
      prisma.employee.count(),

      prisma.employee.count({
        where: {
          employmentStatus: "ACTIVE",
        },
      }),

      prisma.employee.count({
        where: {
          employmentStatus: {
            not: "ACTIVE",
          },
        },
      }),

      prisma.department.count(),

      prisma.position.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        totalDepartments,
        totalPositions,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil statistik dashboard.",
      },
      { status: 500 }
    );
  }
}