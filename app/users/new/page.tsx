
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Employee = {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  employmentStatus: string;
  user: { id: number } | null;
};

export default function NewUserPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      try {
        const response = await fetch("/api/employees");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil data karyawan."
          );
        }

        const availableEmployees = (result.data as Employee[]).filter(
          (employee) =>
            employee.employmentStatus === "ACTIVE" && !employee.user
        );

        setEmployees(availableEmployees);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data karyawan."
        );
      } finally {
        setLoadingEmployees(false);
      }
    }

    loadEmployees();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!employeeId) {
      setError("Silakan pilih karyawan.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId: Number(employeeId),
          email,
          password,
          role: "EMPLOYEE",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat akun.");
      }

      router.push("/users");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="form-page">
      <section className="form-card department-form-card">
        <div className="form-heading">
          <h1>Tambah Akun Karyawan</h1>
          <p>
            Buat akun login untuk karyawan aktif yang belum memiliki akun.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="department-form-grid">
            <div>
              <label htmlFor="employeeId">Karyawan *</label>
              <select
                id="employeeId"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                required
                disabled={loadingEmployees || saving}
              >
                <option value="">
                  {loadingEmployees
                    ? "Memuat data karyawan..."
                    : "Pilih karyawan"}
                </option>

                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.employeeCode} - {employee.firstName}{" "}
                    {employee.lastName}
                  </option>
                ))}
              </select>

              {!loadingEmployees && employees.length === 0 && (
                <small>
                  Tidak ada karyawan aktif yang belum memiliki akun.
                </small>
              )}
            </div>

            <div>
              <label htmlFor="email">Email Login *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@perusahaan.com"
                required
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 8 karakter"
                minLength={8}
                required
                disabled={saving}
              />
              <small>Gunakan password minimal 8 karakter.</small>
            </div>

            <div>
              <label htmlFor="role">Role</label>
              <input
                id="role"
                type="text"
                value="EMPLOYEE"
                readOnly
              />
              <small>Role akun ini ditetapkan sebagai EMPLOYEE.</small>
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={
                saving ||
                loadingEmployees ||
                employees.length === 0
              }
            >
              {saving ? "Menyimpan..." : "Buat Akun"}
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => router.push("/users")}
              disabled={saving}
            >
              Batal
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}