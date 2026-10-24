import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import Sidebar from "@/app/dashboard/components/Sidebar";
import LogoutButton from "@/app/dashboard/components/LogoutButton";

export default async function DepartmentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: {
          employees: true,
          positions: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main>
      <Sidebar />

      <section>
        <header>
          <h1>Departments</h1>

          <div>
            <p>
              {user.employee.firstName} {user.employee.lastName}
            </p>
            <p>{user.role}</p>
          </div>
        </header>

        <div>
          <h2>Department List</h2>

          {user.role === "ADMIN" || user.role === "HR_MANAGER" ? (
            <p>
              <Link href="/departments/new">
                + Add Department
              </Link>
            </p>
          ) : null}

          {departments.length === 0 ? (
            <p>Belum ada department.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Employees</th>
                  <th>Positions</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {departments.map((department) => (
                  <tr key={department.id}>
                    <td>{department.name}</td>

                    <td>
                      {department.description || "-"}
                    </td>

                    <td>
                      {department._count.employees}
                    </td>

                    <td>
                      {department._count.positions}
                    </td>

                    <td>
                      <Link
                        href={`/departments/${department.id}/edit`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <LogoutButton />
      </section>
    </main>
  );
}
