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
  description: string | null;
  departmentId: number;
};

export default function EditPositionPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const [position, setPosition] = useState<Position | null>(null);
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
    async function loadData() {
      try {
        const [positionResponse, departmentResponse] =
          await Promise.all([
            fetch(`/api/positions/${id}`),
            fetch("/api/departments"),
          ]);

        const positionData = await positionResponse.json();
        const departmentData = await departmentResponse.json();

        if (!positionResponse.ok) {
          throw new Error(
            positionData.message || "Position tidak ditemukan."
          );
        }

        if (!departmentResponse.ok) {
          throw new Error(
            departmentData.message ||
              "Gagal mengambil department."
          );
        }

        const data: Position = positionData.data;

        setPosition(data);
        setDepartments(departmentData.data);

        setForm({
          name: data.name,
          description: data.description || "",
          departmentId: String(data.departmentId),
        });
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data position."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      const response = await fetch(`/api/positions/${id}`, {
        method: "PUT",
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
        setError(
          data.message || "Gagal memperbarui position."
        );
        return;
      }

      router.push("/positions");
      router.refresh();
    } catch (error) {
      console.error("Update position error:", error);

      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Memuat data position...</p>;
  }

  if (!position) {
    return (
      <main>
        <h1>Edit Position</h1>
        <p>{error || "Position tidak ditemukan."}</p>
      </main>
    );
  }

  
return (
  <main className="form-page">
    <section className="form-card department-form-card">
      <div className="form-heading">
        <h1>Edit Position</h1>
        <p>
          Ubah informasi position{" "}
          <strong>{position.name}</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="employee-form">
        <div className="department-form-grid">
          <div>
            <label htmlFor="name">Position Name *</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
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
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Save Changes"}
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={() => router.push("/positions")}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  </main>
);
}
