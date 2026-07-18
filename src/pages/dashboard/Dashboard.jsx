import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import StudentDashboard from "../student/StudentDashboard.jsx";
import "./Dashboard.css";

const ADMIN_SHORTCUTS = [
  { label: "Alunos", icon: "pi pi-users", path: "/alunos" },
  { label: "Turmas", icon: "pi pi-book", path: "/turmas" },
  { label: "Matrículas", icon: "pi pi-id-card", path: "/matriculas" },
  { label: "Notas", icon: "pi pi-star", path: "/notas" },
  { label: "Provas", icon: "pi pi-calendar", path: "/provas" },
];

const PROFESSOR_SHORTCUTS = [
  { label: "Alunos", icon: "pi pi-users", path: "/alunos" },
  { label: "Notas", icon: "pi pi-star", path: "/notas" },
  { label: "Provas", icon: "pi pi-calendar", path: "/provas" },
];

export default function Dashboard() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  if (role === "aluno") {
    return <StudentDashboard />;
  }

  const shortcuts = role === "admin" ? ADMIN_SHORTCUTS : PROFESSOR_SHORTCUTS;

  return (
    <div className="eo-page">
      <div className="eo-page-header">
        <div>
          <p className="eo-eyebrow">Painel</p>
          <h1>Olá, {user?.name?.split(" ")[0]}</h1>
        </div>
      </div>

      <div className="eo-shortcut-grid">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.path}
            className="eo-shortcut-card eo-card"
            onClick={() => navigate(shortcut.path)}
          >
            <i className={shortcut.icon} />
            <span>{shortcut.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
