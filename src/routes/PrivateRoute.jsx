import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { ProgressSpinner } from "primereact/progressspinner";

/**
 * Protege rotas exigindo autenticação e, opcionalmente, uma lista de roles
 * autorizadas. Uso:
 *   <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
 *     <Route path="/alunos" element={<StudentsList />} />
 *   </Route>
 */
export default function PrivateRoute({ allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "4rem" }}>
        <ProgressSpinner strokeWidth="3" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <Outlet />;
}
