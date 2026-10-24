"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EmployeeActionsProps = {
  employeeId: number;
  employmentStatus: string;
};

export default function EmployeeActions({
  employeeId,
  employmentStatus,
}: EmployeeActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isActive = employmentStatus === "ACTIVE";

  async function handleStatusChange() {
    const targetStatus = isActive ? "INACTIVE" : "ACTIVE";

    const confirmed = window.confirm(
      isActive
        ? "Apakah Anda yakin ingin menonaktifkan employee ini?"
        : "Apakah Anda yakin ingin mengaktifkan kembali employee ini?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employmentStatus: targetStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Gagal mengubah status employee.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Update employee status error:", error);
      window.alert("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleStatusChange}
      disabled={loading}
    >
      {loading
        ? "Processing..."
        : isActive
          ? "Deactivate"
          : "Activate"}
    </button>
  );
}