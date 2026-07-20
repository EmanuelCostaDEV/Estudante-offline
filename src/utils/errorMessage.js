/**
 * Extrai a melhor mensagem de erro possível de uma resposta de API,
 * cobrindo os formatos mais comuns de backend Express (message, error,
 * errors[], ou um objeto genérico).
 */
export function extractErrorMessage(err, fallback = "Tente novamente.") {
  const data = err?.response?.data;

  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;

  if (Array.isArray(data.errors)) {
    return data.errors
      .map((e) => (typeof e === "string" ? e : e.message || JSON.stringify(e)))
      .join(" | ");
  }

  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
}
