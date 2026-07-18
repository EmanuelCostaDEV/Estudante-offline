import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      const redirectTo = location.state?.from?.pathname || defaultRouteForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Não foi possível entrar",
        detail:
          err.response?.data?.message ||
          "Verifique suas credenciais e tente novamente.",
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  }

  function defaultRouteForRole() {
    return "/dashboard";
  }

  return (
    <div className="eo-login-screen">
      <Toast ref={toast} />
      <div className="eo-login-card eo-card">
        <p className="eo-eyebrow">Estudante Offline</p>
        <h1>Entrar na plataforma</h1>
        <p className="eo-login-subtitle">
          Acesse com as credenciais fornecidas pela sua instituição.
        </p>

        <form onSubmit={handleSubmit} className="eo-login-form">
          <label className="eo-field">
            <span>E-mail</span>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@escola.com"
              required
            />
          </label>

          <label className="eo-field">
            <span>Senha</span>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              placeholder="••••••••"
              required
            />
          </label>

          <Button
            type="submit"
            label={loading ? "Entrando..." : "Entrar"}
            icon="pi pi-arrow-right"
            iconPos="right"
            loading={loading}
            className="eo-login-btn"
          />
        </form>
      </div>
    </div>
  );
}
