
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    if (user.role !== "EMPLOYEE") {
      return NextResponse.json(
        { message: "Fitur ini khusus untuk akun karyawan." },
        { status: 403 }
      );
    }

    if (!user.employee) {
      return NextResponse.json(
        { message: "Data karyawan tidak ditemukan." },
        { status: 404 }
      );
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: user.employee.id,
      },
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        date: true,
        checkIn: true,
        checkOut: true,
        status: true,
        notes: true,
      },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("GET_MY_ATTENDANCE_ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data kehadiran." },
      { status: 500 }
    );
  }
}
