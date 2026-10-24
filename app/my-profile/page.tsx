
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import Sidebar from "@/app/dashboard/components/Sidebar";
import LogoutButton from "@/app/dashboard/components/LogoutButton";

export default async function MyProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Halaman ini khusus untuk akun karyawan.
  if (user.role !== "EMPLOYEE") {
    redirect("/dashboard");
  }

  const employee = user.employee;

  if (!employee) {
    return (
      <main className="dashboard-layout">
        <Sidebar />
        <section className="dashboard-content">
          <h1>Profil Saya</h1>
          <p>
            Data karyawan belum terhubung dengan akun Anda.
            Silakan hubungi administrator HR.
          </p>
          <LogoutButton />
        </section>
      </main>
    );
  }

  const fullName = [
    employee.firstName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="dashboard-layout">
      <Sidebar />

      <section className="dashboard-content">
        <header className="dashboard-topbar">
          <div>
            <p className="profile-breadcrumb">
              Dashboard / Profil Saya
            </p>
            <h1>Profil Saya</h1>
            <p className="profile-subtitle">
              Lihat informasi pribadi dan informasi pekerjaan Anda.
            </p>
          </div>

          <LogoutButton />
        </header>

        <section className="profile-hero">
          <div className="profile-avatar">
            {employee.firstName.charAt(0).toUpperCase()}
          </div>

          <div className="profile-hero-info">
            <h2>{fullName}</h2>
            <p>{employee.position.name}</p>
            <span className="profile-status">
              {employee.employmentStatus === "ACTIVE"
                ? "Karyawan Aktif"
                : "Karyawan Tidak Aktif"}
            </span>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <h2>Informasi Pribadi</h2>
              <p>Informasi identitas dan kontak karyawan.</p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-field">
              <span>Nama Lengkap</span>
              <strong>{fullName || "-"}</strong>
            </div>

            <div className="profile-field">
              <span>NIP / Kode Karyawan</span>
              <strong>{employee.employeeCode || "-"}</strong>
            </div>

            <div className="profile-field">
              <span>Email Karyawan</span>
              <strong>{employee.email || "-"}</strong>
            </div>

            <div className="profile-field">
              <span>Email Login</span>
              <strong>{user.email}</strong>
            </div>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <h2>Informasi Pekerjaan</h2>
              <p>Informasi posisi dan penempatan Anda.</p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-field">
              <span>Departemen</span>
              <strong>{employee.department.name}</strong>
            </div>

            <div className="profile-field">
              <span>Jabatan</span>
              <strong>{employee.position.name}</strong>
            </div>

            <div className="profile-field">
              <span>Status Kepegawaian</span>
              <strong>
                {employee.employmentStatus === "ACTIVE"
                  ? "Aktif"
                  : employee.employmentStatus}
              </strong>
            </div>

            <div className="profile-field">
              <span>Role Akun</span>
              <strong>{user.role.replaceAll("_", " ")}</strong>
            </div>
          </div>
        </section>

        <p className="profile-note">
          Ada informasi yang tidak sesuai? Hubungi administrator
          HR untuk memperbarui data kepegawaian Anda.
        </p>
      </section>
    </main>
  );
}
