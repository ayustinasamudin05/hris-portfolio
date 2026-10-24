
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import Sidebar from "./components/Sidebar";
import LogoutButton from "./components/LogoutButton";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
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
      where: { employmentStatus: "ACTIVE" },
    }),
    prisma.employee.count({
      where: { employmentStatus: { not: "ACTIVE" } },
    }),
    prisma.department.count(),
    prisma.position.count(),
  ]);

  const firstName = user.employee.firstName;
  const lastName = user.employee.lastName ?? "";
  const activePercentage =
    totalEmployees > 0
      ? Math.round((activeEmployees / totalEmployees) * 100)
      : 0;

  const stats = [
    {
      title: "Total Karyawan",
      value: totalEmployees,
      description: "Seluruh data karyawan",
      icon: "♙",
      color: "blue",
    },
    {
      title: "Karyawan Aktif",
      value: activeEmployees,
      description: "Karyawan berstatus aktif",
      icon: "✓",
      color: "green",
    },
    {
      title: "Karyawan Nonaktif",
      value: inactiveEmployees,
      description: "Karyawan tidak aktif",
      icon: "−",
      color: "orange",
    },
    {
      title: "Department",
      value: totalDepartments,
      description: "Total department",
      icon: "▦",
      color: "purple",
    },
    {
      title: "Positions",
      value: totalPositions,
      description: "Total posisi pekerjaan",
      icon: "▤",
      color: "cyan",
    },
  ];

  const quickActions = [
    {
      title: "Tambah Karyawan",
      description: "Daftarkan karyawan baru",
      href: "/employees/new",
      icon: "+",
    },
    {
      title: "Kelola Department",
      description: "Atur department perusahaan",
      href: "/departments",
      icon: "▦",
    },
    {
      title: "Kelola Position",
      description: "Atur posisi pekerjaan",
      href: "/positions",
      icon: "▤",
    },
    {
      title: "User Management",
      description: "Kelola akun pengguna",
      href: "/users",
      icon: "♙",
    },
  ];

  return (
    <main className="dashboard-layout">
      <Sidebar />

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-eyebrow">HUMAN RESOURCES</p>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">
              Pantau informasi dan data karyawan perusahaan.
            </p>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div className="dashboard-user-details">
              <strong>
                {firstName} {lastName}
              </strong>
              <span>{user.role.replaceAll("_", " ")}</span>
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div className="dashboard-welcome-copy">
            <span className="dashboard-welcome-label">
              HRIS PORTFOLIO
            </span>
            <h2>Selamat datang, {firstName}!</h2>
            <p>
              Semua informasi penting terkait sumber daya manusia
              tersedia dalam satu dashboard.
            </p>
            <Link href="/employees" className="dashboard-primary-link">
              Lihat Data Karyawan <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="dashboard-welcome-art" aria-hidden="true">
            <div className="welcome-art-circle">
              <span>HR</span>
            </div>
            <div className="welcome-art-caption">
              People · Data · Management
            </div>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <h2>Ringkasan HR</h2>
              <p>Gambaran umum data sumber daya manusia.</p>
            </div>
          </div>

          <div className="dashboard-stats-grid">
            {stats.map((stat) => (
              <article
                key={stat.title}
                className="dashboard-stat-card"
              >
                <div className="dashboard-stat-top">
                  <span className="dashboard-stat-title">
                    {stat.title}
                  </span>
                  <span
                    className={`dashboard-stat-icon stat-${stat.color}`}
                    aria-hidden="true"
                  >
                    {stat.icon}
                  </span>
                </div>

                <p className="dashboard-stat-value">{stat.value}</p>
                <p className="dashboard-stat-description">
                  {stat.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboard-lower-grid">
          <section className="dashboard-panel">
            <div className="dashboard-section-heading">
              <div>
                <h2>Quick Actions</h2>
                <p>Akses fitur yang sering digunakan.</p>
              </div>
            </div>

            <div className="dashboard-actions-grid">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="dashboard-action-link"
                >
                  <span
                    className="dashboard-action-icon"
                    aria-hidden="true"
                  >
                    {action.icon}
                  </span>

                  <span className="dashboard-action-copy">
                    <strong>{action.title}</strong>
                    <small>{action.description}</small>
                  </span>

                  <span
                    className="dashboard-action-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="dashboard-panel dashboard-health-panel">
            <div className="dashboard-section-heading">
              <div>
                <h2>Status Karyawan</h2>
                <p>Persentase karyawan aktif.</p>
              </div>
            </div>

            <div className="dashboard-health-number">
              <strong>{activePercentage}%</strong>
              <span>aktif</span>
            </div>

            <div
              className="dashboard-progress-track"
              role="progressbar"
              aria-label="Persentase karyawan aktif"
              aria-valuenow={activePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="dashboard-progress-fill"
                style={{ width: `${activePercentage}%` }}
              />
            </div>

            <div className="dashboard-health-legend">
              <span>
                <i className="health-dot health-dot-active" />
                Aktif
              </span>
              <strong>{activeEmployees}</strong>
            </div>

            <div className="dashboard-health-legend">
              <span>
                <i className="health-dot health-dot-inactive" />
                Nonaktif
              </span>
              <strong>{inactiveEmployees}</strong>
            </div>

            <div className="dashboard-health-total">
              Total {totalEmployees} karyawan terdaftar
            </div>
          </section>
        </div>

        <section className="dashboard-panel dashboard-account-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Informasi Akun</h2>
              <p>Informasi akun yang sedang digunakan.</p>
            </div>
            <span className="dashboard-account-badge">
              {user.role.replaceAll("_", " ")}
            </span>
          </div>

          <div className="dashboard-account-grid">
            <div className="dashboard-account-item">
              <span>Nama Lengkap</span>
              <strong>
                {firstName} {lastName}
              </strong>
            </div>

            <div className="dashboard-account-item">
              <span>Email Login</span>
              <strong>{user.email}</strong>
            </div>

            <div className="dashboard-account-item">
              <span>Department</span>
              <strong>{user.employee.department.name}</strong>
            </div>

            <div className="dashboard-account-item">
              <span>Position</span>
              <strong>{user.employee.position.name}</strong>
            </div>
          </div>
        </section>

        <footer className="dashboard-footer">
          <span>HRIS Portfolio</span>
          <span>Human Resource Information System</span>
        </footer>

        <div className="dashboard-logout">
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}