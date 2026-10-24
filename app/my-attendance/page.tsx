
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/dashboard/components/Sidebar";
import LogoutButton from "@/app/dashboard/components/LogoutButton";

export default async function MyAttendancePage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "EMPLOYEE") redirect("/dashboard");

  const employee = user.employee;

  if (!employee) {
    return (
      <main className="dashboard-layout">
        <Sidebar />
        <section className="dashboard-content">
          <h1>Kehadiran Saya</h1>
          <p>Data karyawan belum terhubung dengan akun Anda.</p>
          <LogoutButton />
        </section>
      </main>
    );
  }

  const attendances = await prisma.attendance.findMany({
    where: {
      employeeId: employee.id,
    },
    orderBy: {
      date: "desc",
    },
  });

  const dateFormatter = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Makassar",
  });

  const statusLabels: Record<string, string> = {
    PRESENT: "Hadir",
    LATE: "Terlambat",
    ABSENT: "Tidak Hadir",
    SICK: "Sakit",
    ON_LEAVE: "Cuti",
  };

  return (
    <main className="dashboard-layout">
      <Sidebar />

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="profile-breadcrumb">
              Dashboard / Kehadiran Saya
            </p>
            <h1>Kehadiran Saya</h1>
            <p className="profile-subtitle">
              Lihat riwayat kehadiran dan jam kerja Anda.
            </p>
          </div>
          <LogoutButton />
        </header>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <h2>Riwayat Kehadiran</h2>
              <p>
                Total {attendances.length} catatan kehadiran.
              </p>
            </div>
          </div>

          {attendances.length === 0 ? (
            <div className="attendance-empty">
              <h3>Belum Ada Catatan Kehadiran</h3>
              <p>
                Riwayat kehadiran Anda akan ditampilkan di sini
                setelah data kehadiran dicatat oleh HR.
              </p>
            </div>
          ) : (
            <div className="attendance-table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jam Masuk</th>
                    <th>Jam Pulang</th>
                    <th>Status</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((attendance) => (
                    <tr key={attendance.id}>
                      <td>
                        {dateFormatter.format(attendance.date)}
                      </td>
                      <td>
                        {attendance.checkIn
                          ? timeFormatter.format(attendance.checkIn)
                          : "-"}
                      </td>
                      <td>
                        {attendance.checkOut
                          ? timeFormatter.format(attendance.checkOut)
                          : "-"}
                      </td>
                      <td>
                        <span
                          className={`attendance-status attendance-status-${attendance.status.toLowerCase()}`}
                        >
                          {statusLabels[attendance.status] ??
                            attendance.status}
                        </span>
                      </td>
                      <td>{attendance.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
