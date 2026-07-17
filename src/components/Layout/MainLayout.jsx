import { Outlet, useNavigate } from "react-router-dom";
import { PanelMenu } from "primereact/panelmenu";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./MainLayout.css";

const ROLE_LABEL = {
  admin: "Administrador",
  professor: "Professor",
  aluno: "Aluno",
};

function buildMenu(role, navigate) {
  const item = (label, icon, path) => ({
    label,
    icon,
    command: () => navigate(path),
  });

  if (role === "admin") {
    return [
      item("Painel", "pi pi-th-large", "/dashboard"),
      item("Alunos", "pi pi-users", "/alunos"),
      item("Turmas", "pi pi-book", "/turmas"),
      item("Matrículas", "pi pi-id-card", "/matriculas"),
      item("Notas", "pi pi-star", "/notas"),
      item("Agendamento de provas", "pi pi-calendar", "/provas"),
    ];
  }

  if (role === "professor") {
    return [
      item("Painel", "pi pi-th-large", "/dashboard"),
      item("Alunos", "pi pi-users", "/alunos"),
      item("Notas", "pi pi-star", "/notas"),
      item("Agendamento de provas", "pi pi-calendar", "/provas"),
    ];
  }

  // aluno
  return [item("Meu painel", "pi pi-th-large", "/dashboard")];
}

export default function MainLayout() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const menuItems = buildMenu(role, navigate);

  return (
    <div className="eo-layout">
      <aside className="eo-sidebar">
        <div className="eo-brand">
          <span className="eo-brand-mark">EO</span>
          <div>
            <p className="eo-brand-name">Estudante Offline</p>
            <p className="eo-brand-sub">{ROLE_LABEL[role] ?? ""}</p>
          </div>
        </div>

        <PanelMenu model={menuItems} className="eo-panelmenu" />

        <div className="eo-sidebar-footer">
          <Avatar
            label={(user?.name || "?").charAt(0).toUpperCase()}
            shape="circle"
            className="eo-avatar"
          />
          <div className="eo-user-info">
            <p className="eo-user-name">{user?.name}</p>
            <p className="eo-user-email">{user?.email}</p>
          </div>
        </div>
        <Button
          label="Sair"
          icon="pi pi-sign-out"
          className="eo-logout-btn"
          text
          onClick={handleLogout}
        />
      </aside>

      <main className="eo-main">
        <Outlet />
      </main>
    </div>
  );
}
