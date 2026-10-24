
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Department = {
  id: number;
  name: string;
};

export default function NewPositionPage() {
  const router = useRouter();

  const [departments, setDepartments] = useState<Department[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    departmentId: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDepartments() {
      try {
        const response = await fetch("/api/departments");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Gagal mengambil department."
          );
        }

        setDepartments(data.data);
      } catch (error) {
        console.error(error);
        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil department."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDepartments();
  }, []);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          departmentId: Number(form.departmentId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal menambahkan position.");
        return;
      }

      router.push("/positions");
      router.refresh();
    } catch (error) {
      console.error("Create position error:", error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="form-page">
        <section className="form-card department-form-card">
          <p>Memuat department...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="form-page">
      <section className="form-card department-form-card">
        <div className="form-heading">
          <h1>Add Position</h1>
          <p>Tambahkan position baru ke dalam sistem HRIS.</p>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-grid department-form-grid">
            <div>
              <label htmlFor="name">Position Name *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: HR Officer"
                required
              />
            </div>

            <div>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Deskripsi position (opsional)"
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
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Save Position"}
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => router.push("/positions")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
