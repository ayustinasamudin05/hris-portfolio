
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDepartmentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal menambahkan department.");
        return;
      }

      router.push("/departments");
      router.refresh();
    } catch (error) {
      console.error("Create department error:", error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="form-page">
      <section className="form-card department-form-card">
        <div className="form-heading">
          <h1>Add Department</h1>
          <p>Tambahkan department baru ke dalam sistem HRIS.</p>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-grid department-form-grid">
            <div>
              <label htmlFor="name">Department Name *</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Contoh: Human Resources"
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
                placeholder="Deskripsi department (opsional)"
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Save Department"}
            </button>

            <button
              type="button"
              className="button-secondary"
              onClick={() => router.push("/departments")}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}