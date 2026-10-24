"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Department = {
  id: number;
  name: string;
};

type Position = {
  id: number;
  name: string;
  departmentId: number;
};

type Employee = {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  hireDate: string;
  employmentStatus: string;
  departmentId: number;
  positionId: number;
};

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id;

  const [employee, setEmployee] = useState<Employee | null>(null);
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
    employmentStatus: "ACTIVE",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [employeeResponse, departmentResponse, positionResponse] =
          await Promise.all([
            fetch(`/api/employees/${id}`),
            fetch("/api/departments"),
            fetch("/api/positions"),
          ]);

        const employeeData = await employeeResponse.json();
        const departmentData = await departmentResponse.json();
        const positionData = await positionResponse.json();

        if (!employeeResponse.ok) {
          throw new Error(
            employeeData.message || "Employee tidak ditemukan."
          );
        }

        if (!departmentResponse.ok) {
          throw new Error("Gagal mengambil department.");
        }

        if (!positionResponse.ok) {
          throw new Error("Gagal mengambil position.");
        }

        const data: Employee = employeeData.data;

        setEmployee(data);
        setDepartments(departmentData.data);
        setPositions(positionData.data);

        setForm({
          employeeCode: data.employeeCode,
          firstName: data.firstName,
          lastName: data.lastName || "",
          email: data.email,
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth
            ? data.dateOfBirth.substring(0, 10)
            : "",
          hireDate: data.hireDate.substring(0, 10),
          departmentId: String(data.departmentId),
          positionId: String(data.positionId),
          employmentStatus: data.employmentStatus,
        });
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data employee."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

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
    setSaving(true);

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "PUT",
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
          employmentStatus: form.employmentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal mengubah employee.");
        return;
      }

      router.push("/employees");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Memuat data employee...</p>;
  }

  if (!employee) {
    return (
      <main>
        <h1>Edit Employee</h1>
        <p>{error || "Employee tidak ditemukan."}</p>
      </main>
    );
  }

  
  return (
    <main className="form-page">
      <section className="form-card">
        <div className="form-heading">
          <h1>Edit Employee</h1>
          <p>
            Ubah informasi karyawan{" "}
            <strong>{employee.employeeCode}</strong>.
          </p>
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

            <div>
              <label htmlFor="employmentStatus">
                Employment Status *
              </label>
              <select
                id="employmentStatus"
                name="employmentStatus"
                value={form.employmentStatus}
                onChange={handleChange}
                required
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Save Changes"}
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