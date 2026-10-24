
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";

export default async function Sidebar() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isManagement =
    user.role === "ADMIN" || user.role === "HR_MANAGER";

  const managementMenus = [
    { label: "Employees", href: "/employees" },
    { label: "User Management", href: "/users" },
    { label: "Departments", href: "/departments" },
    { label: "Positions", href: "/positions" },
  ];

  const employeeMenus = [
    { label: "Profil Saya", href: "/my-profile" },
    { label: "Kehadiran Saya", href: "/my-attendance" },
    { label: "Cuti & Izin", href: "/my-leave" },
    { label: "Pengumuman", href: "/announcements" },
  ];

  const menus = isManagement ? managementMenus : employeeMenus;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">H</div>
        <div>
          <h2>HRIS Portfolio</h2>
          <p>Human Resources</p>
        </div>
      </div>

      <div className="sidebar-section-label">MENU UTAMA</div>

      <nav aria-label="Navigasi utama">
        <ul className="sidebar-menu">
          <li>
            <Link href="/dashboard" className="sidebar-link">
              <span aria-hidden="true">▦</span>
              <span>Dashboard</span>
            </Link>
          </li>

          {menus.map((menu) => (
            <li key={menu.href}>
              <Link href={menu.href} className="sidebar-link">
                <span aria-hidden="true">
                  {menu.href === "/employees" ||
                  menu.href === "/my-profile"
                    ? "♙"
                    : menu.href === "/users"
                      ? "♧"
                      : menu.href === "/departments"
                        ? "▤"
                        : menu.href === "/positions"
                          ? "▥"
                          : menu.href === "/my-attendance"
                            ? "◷"
                            : menu.href === "/my-leave"
                              ? "▣"
                              : "◉"}
                </span>
                <span>{menu.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user-role">
          <span className="sidebar-role-dot" />
          <div>
            <strong>{user.role.replaceAll("_", " ")}</strong>
            <small>{user.employee.firstName}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}