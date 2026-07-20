import api from "./api";

export const studentService = {
  list: () => api.get("/students").then((res) => res.data),
  get: (id) => api.get(`/students/${id}`).then((res) => res.data),
  create: (payload) => api.post("/students", payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/students/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/students/${id}`).then((res) => res.data),
};
