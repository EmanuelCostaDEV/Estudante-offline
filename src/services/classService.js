import api from "./api";

export const classService = {
  list: () => api.get("/classes").then((res) => res.data),
  get: (id) => api.get(`/classes/${id}`).then((res) => res.data),
  create: (payload) => api.post("/classes", payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/classes/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/classes/${id}`).then((res) => res.data),
};
