import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import Sidebar from "@/app/dashboard/components/Sidebar";
import LogoutButton from "@/app/dashboard/components/LogoutButton";
import EmployeeActions from "./components/EmployeeActions";

export default async function EmployeesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const employees = await prisma.employee.findMany({
    include: {
      department: true,
      position: true,
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
          <h1>Employees</h1>

          <div>
            <p>
              {user.employee.firstName} {user.employee.lastName}
            </p>
            <p>{user.role}</p>
          </div>
        </header>

        <div>
          <h2>Employee List</h2>

          {employees.length === 0 ? (
            <p>Belum ada employee.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employeeCode}</td>

                    <td>
                      {employee.firstName} {employee.lastName}
                    </td>

                    <td>{employee.email}</td>

                    <td>{employee.department.name}</td>

                    <td>{employee.position.name}</td>

                    <td>{employee.employmentStatus}</td>

                    <td>
                      <Link href={`/employees/${employee.id}/edit`}>
                        Edit
                      </Link>
                      
                      {" "}

                      <EmployeeActions
                        employeeId={employee.id}
                        employmentStatus={employee.employmentStatus}
                        />
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