
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import Sidebar from "@/app/dashboard/components/Sidebar";
import LogoutButton from "@/app/dashboard/components/LogoutButton";

export default async function UsersPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (
    currentUser.role !== "ADMIN" &&
    currentUser.role !== "HR_MANAGER"
  ) {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      employee: {
        select: {
          employeeCode: true,
          firstName: true,
          lastName: true,
          employmentStatus: true,
          department: {
            select: {
              name: true,
            },
          },
          position: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main>
      <Sidebar />

      <section>
        <header>
          <h1>User Management</h1>

          <div>
            <p>
              {currentUser.employee.firstName}{" "}
              {currentUser.employee.lastName}
            </p>
            <p>{currentUser.role}</p>
          </div>
        </header>

        <div>
          <h2>Daftar Akun</h2>

          <p>
            <Link href="/users/new">+ Tambah Akun</Link>
          </p>

          {users.length === 0 ? (
            <p>Belum ada akun pengguna.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Kode Karyawan</th>
                  <th>Nama</th>
                  <th>Email Login</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status Karyawan</th>
                  <th>Status Akun</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.employee.employeeCode}
                    </td>

                    <td>
                      {user.employee.firstName}{" "}
                      {user.employee.lastName}
                    </td>

                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.employee.department.name}</td>
                    <td>{user.employee.position.name}</td>
                    <td>{user.employee.employmentStatus}</td>
                    <td>
                      {user.isActive ? "Aktif" : "Nonaktif"}
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
