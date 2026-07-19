import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import "./AccessDenied.css";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="eo-denied">
      <p className="eo-eyebrow">Erro 403</p>
      <h1>Acesso negado</h1>
      <p className="eo-denied-text">
        Sua conta não tem permissão para visualizar esta página. Se você
        acredita que isso é um engano, procure a coordenação.
      </p>
      <Button
        label="Voltar ao painel"
        icon="pi pi-arrow-left"
        onClick={() => navigate("/dashboard")}
      />
    </div>
  );
}
