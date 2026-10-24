
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function authorize() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "ADMIN" && user.role !== "HR_MANAGER") {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Anda tidak memiliki akses untuk mengelola employee.",
        },
        { status: 403 }
      ),
    };
  }

  return { user };
}

async function getEmployeeId(context: RouteContext) {
  const { id } = await context.params;
  const employeeId = Number(id);

  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return null;
  }

  return employeeId;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    const auth = await authorize();

    if ("error" in auth) {
      return auth.error;
    }

    const employeeId = await getEmployeeId(context);

    if (employeeId === null) {
      return NextResponse.json(
        { success: false, message: "Employee ID tidak valid." },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        position: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil data employee." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await authorize();

    if ("error" in auth) {
      return auth.error;
    }

    const employeeId = await getEmployeeId(context);

    if (employeeId === null) {
      return NextResponse.json(
        { success: false, message: "Employee ID tidak valid." },
        { status: 400 }
      );
    }

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
      employmentStatus,
    } = body;

    if (
      typeof employeeCode !== "string" ||
      !employeeCode.trim() ||
      typeof firstName !== "string" ||
      !firstName.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      !hireDate ||
      !departmentId ||
      !positionId ||
      !["ACTIVE", "INACTIVE"].includes(employmentStatus)
    ) {
      return NextResponse.json(
        { success: false, message: "Data employee tidak valid atau belum lengkap." },
        { status: 400 }
      );
    }

    const normalizedEmployeeCode = employeeCode.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStatus = employmentStatus;

    const parsedDepartmentId = Number(departmentId);
    const parsedPositionId = Number(positionId);
    const parsedHireDate = new Date(hireDate);
    const parsedDateOfBirth = dateOfBirth
      ? new Date(dateOfBirth)
      : null;

    if (
      !Number.isInteger(parsedDepartmentId) ||
      !Number.isInteger(parsedPositionId) ||
      Number.isNaN(parsedHireDate.getTime()) ||
      (parsedDateOfBirth &&
        Number.isNaN(parsedDateOfBirth.getTime()))
    ) {
      return NextResponse.json(
        { success: false, message: "Format tanggal atau ID tidak valid." },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee tidak ditemukan." },
        { status: 404 }
      );
    }

    const duplicate = await prisma.employee.findFirst({
      where: {
        id: { not: employeeId },
        OR: [
          { employeeCode: normalizedEmployeeCode },
          { email: normalizedEmail },
        ],
      },
      select: {
        employeeCode: true,
        email: true,
      },
    });

    if (duplicate) {
      const message =
        duplicate.employeeCode === normalizedEmployeeCode
          ? "Employee Code sudah digunakan."
          : "Email employee sudah digunakan.";

      return NextResponse.json(
        { success: false, message },
        { status: 409 }
      );
    }

    const position = await prisma.position.findFirst({
      where: {
        id: parsedPositionId,
        departmentId: parsedDepartmentId,
      },
      select: { id: true },
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

    const updatedEmployee = await prisma.$transaction(async (tx) => {
      const updated = await tx.employee.update({
        where: { id: employeeId },
        data: {
          employeeCode: normalizedEmployeeCode,
          firstName: firstName.trim(),
          lastName:
            typeof lastName === "string" && lastName.trim()
              ? lastName.trim()
              : null,
          email: normalizedEmail,
          phone:
            typeof phone === "string" && phone.trim()
              ? phone.trim()
              : null,
          dateOfBirth: parsedDateOfBirth,
          hireDate: parsedHireDate,
          departmentId: parsedDepartmentId,
          positionId: parsedPositionId,
          employmentStatus: normalizedStatus,
        },
        include: {
          department: true,
          position: true,
        },
      });

      await tx.user.updateMany({
        where: { employeeId },
        data: { isActive: normalizedStatus === "ACTIVE" },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: "Employee berhasil diperbarui.",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengubah employee." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await authorize();

    if ("error" in auth) {
      return auth.error;
    }

    const employeeId = await getEmployeeId(context);

    if (employeeId === null) {
      return NextResponse.json(
        { success: false, message: "Employee ID tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const employmentStatus =
      typeof body?.employmentStatus === "string"
        ? body.employmentStatus.trim().toUpperCase()
        : "";

    if (!["ACTIVE", "INACTIVE"].includes(employmentStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: "Employment status harus ACTIVE atau INACTIVE.",
        },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee tidak ditemukan." },
        { status: 404 }
      );
    }

    const updatedEmployee = await prisma.$transaction(async (tx) => {
      await tx.employee.update({
        where: { id: employeeId },
        data: { employmentStatus },
      });

      await tx.user.updateMany({
        where: { employeeId },
        data: { isActive: employmentStatus === "ACTIVE" },
      });

      return tx.employee.findUniqueOrThrow({
        where: { id: employeeId },
        include: {
          department: true,
          position: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Status employee berhasil diubah menjadi ${employmentStatus}.`,
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Update employee status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengubah status employee.",
      },
      { status: 500 }
    );
  }
}


