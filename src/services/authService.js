import api from "./api";

export const authService = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((res) => res.data),

  register: (payload) =>
    api.post("/auth/register", payload).then((res) => res.data),
};
