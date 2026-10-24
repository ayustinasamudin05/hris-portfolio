import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import Sidebar from "@/app/dashboard/components/Sidebar";
import LogoutButton from "@/app/dashboard/components/LogoutButton";

export default async function PositionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
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

  return (
    <main>
      <Sidebar />

      <section>
        <header>
          <h1>Positions</h1>

          <div>
            <p>
              {user.employee.firstName} {user.employee.lastName}
            </p>
            <p>{user.role}</p>
          </div>
        </header>

        <div>
          <h2>Position List</h2>

          {user.role === "ADMIN" || user.role === "HR_MANAGER" ? (
            <p>
              <Link href="/positions/new">
                + Add Position
              </Link>
            </p>
          ) : null}

          {positions.length === 0 ? (
            <p>Belum ada position.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Description</th>
                  <th>Employees</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {positions.map((position) => (
                  <tr key={position.id}>
                    <td>{position.name}</td>

                    <td>{position.department.name}</td>

                    <td>
                      {position.description || "-"}
                    </td>

                    <td>
                      {position._count.employees}
                    </td>

                    <td>
                      <Link
                        href={`/positions/${position.id}/edit`}
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
