"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Department = {
  id: number;
  name: string;
};

type Position = {
  id: number;
  name: string;
  departmentId: number;
};

export default function NewEmployeePage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [form, setForm] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    hireDate: "",
    departmentId: "",
    positionId: "",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [departmentResponse, positionResponse] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/positions"),
        ]);

        const departmentData = await departmentResponse.json();
        const positionData = await positionResponse.json();

        if (!departmentResponse.ok) {
          throw new Error("Gagal mengambil department.");
        }

        if (!positionResponse.ok) {
          throw new Error("Gagal mengambil position.");
        }

        setDepartments(departmentData.data);
        setPositions(positionData.data);
      } catch (error) {
        console.error(error);
        setError("Gagal mengambil data department dan position.");
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "departmentId" ? { positionId: "" } : {}),
    }));
  }

  const filteredPositions = positions.filter(
    (position) => position.departmentId === Number(form.departmentId)
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeCode: form.employeeCode,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          dateOfBirth: form.dateOfBirth || null,
          hireDate: form.hireDate,
          departmentId: Number(form.departmentId),
          positionId: Number(form.positionId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal menambahkan employee.");
        return;
      }

      router.push("/employees");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return <p>Memuat data...</p>;
  }

  
  return (
    <main className="form-page">
      <section className="form-card">
        <div className="form-heading">
          <h1>Add Employee</h1>
          <p>Tambahkan data karyawan baru ke sistem HRIS.</p>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-grid">
            <div>
              <label htmlFor="employeeCode">Employee Code *</label>
              <input
                id="employeeCode"
                name="employeeCode"
                value={form.employeeCode}
                onChange={handleChange}
                placeholder="Contoh: EMP003"
                required
              />
            </div>

            <div>
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@perusahaan.com"
                required
              />
            </div>

            <div>
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Nomor telepon"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="hireDate">Hire Date *</label>
              <input
                id="hireDate"
                name="hireDate"
                type="date"
                value={form.hireDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="departmentId">Department *</label>
              <select
                id="departmentId"
                name="departmentId"
                value={form.departmentId}
                onChange={handleChange}
                required
              >
                <option value="">Pilih Department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="positionId">Position *</label>
              <select
                id="positionId"
                name="positionId"
                value={form.positionId}
                onChange={handleChange}
                disabled={!form.departmentId}
                required
              >
                <option value="">Pilih Position</option>
                {filteredPositions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Add Employee"}
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => router.push("/employees")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}