import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(request: Request) {
  try {
    // 1. Cek session
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

    // 2. Cek role
    if (user.role !== "ADMIN" && user.role !== "HR_MANAGER") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Anda tidak memiliki akses untuk menambahkan employee.",
        },
        { status: 403 }
      );
    }

    // 3. Ambil request body
    const body = await request.json();

    const {
      employeeCode,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      hireDate,
      departmentId,
      positionId,
    } = body;

    // 4. Validasi field wajib
    if (
      !employeeCode ||
      !firstName ||
      !email ||
      !hireDate ||
      !departmentId ||
      !positionId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Field wajib belum lengkap.",
        },
        { status: 400 }
      );
    }

    // 5. Normalisasi data
    const normalizedEmployeeCode = employeeCode.trim();
    const normalizedEmail = email.toLowerCase().trim();

    // 6. Cek employee code
    const existingEmployeeCode = await prisma.employee.findUnique({
      where: {
        employeeCode: normalizedEmployeeCode,
      },
    });

    if (existingEmployeeCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee Code sudah digunakan.",
        },
        { status: 409 }
      );
    }

    // 7. Cek email
    const existingEmail = await prisma.employee.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email employee sudah digunakan.",
        },
        { status: 409 }
      );
    }

    // 8. Pastikan department tersedia
    const department = await prisma.department.findUnique({
      where: {
        id: Number(departmentId),
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

    // 9. Pastikan position tersedia dan sesuai department
    const position = await prisma.position.findFirst({
      where: {
        id: Number(positionId),
        departmentId: Number(departmentId),
      },
    });

    if (!position) {
      return NextResponse.json(
        {
          success: false,
          message: "Position tidak sesuai dengan department.",
        },
        { status: 400 }
      );
    }

    // 10. Buat employee
    const employee = await prisma.employee.create({
      data: {
        employeeCode: normalizedEmployeeCode,
        firstName: firstName.trim(),
        lastName: lastName?.trim() || null,
        email: normalizedEmail,
        phone: phone?.trim() || null,
        dateOfBirth: dateOfBirth
          ? new Date(dateOfBirth)
          : null,
        hireDate: new Date(hireDate),
        employmentStatus: "ACTIVE",
        departmentId: Number(departmentId),
        positionId: Number(positionId),
      },
      include: {
        department: true,
        position: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Employee berhasil ditambahkan.",
        data: employee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create employee error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan employee.",
      },
      { status: 500 }
    );
  }
}

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

    if (
      user.role !== "ADMIN" &&
      user.role !== "HR_MANAGER"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses.",
        },
        { status: 403 }
      );
    }

    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        employmentStatus: true,
        user: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        firstName: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data karyawan.",
      },
      { status: 500 }
    );
  }
}
