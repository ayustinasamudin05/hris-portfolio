"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Department = {
  id: number;
  name: string;
  description: string | null;
};

export default function EditDepartmentPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id;

  const [department, setDepartment] = useState<Department | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDepartment() {
      try {
        const response = await fetch(`/api/departments/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Department tidak ditemukan."
          );
        }

        const departmentData: Department = data.data;

        setDepartment(departmentData);

        setForm({
          name: departmentData.name,
          description: departmentData.description || "",
        });
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data department."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDepartment();
  }, [id]);

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
      const response = await fetch(`/api/departments/${id}`, {
        method: "PUT",
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
        setError(
          data.message || "Gagal memperbarui department."
        );
        return;
      }

      router.push("/departments");
      router.refresh();
    } catch (error) {
      console.error("Update department error:", error);

      setError("Tidak dapat terhubung ke server.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Memuat data department...</p>;
  }

  if (!department) {
    return (
      <main>
        <h1>Edit Department</h1>
        <p>{error || "Department tidak ditemukan."}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Edit Department</h1>

      <p>
        Ubah informasi department{" "}
        <strong>{department.name}</strong>.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Department Name *</label>
          <br />
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label htmlFor="description">Description</label>
          <br />
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <br />

        {error && <p>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Menyimpan..." : "Save Changes"}
        </button>

        {" "}

        <button
          type="button"
          onClick={() => router.push("/departments")}
        >
          Cancel
        </button>
      </form>
    </main>
  );
}
