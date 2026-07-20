import api from "./api";

export const enrollmentService = {
  list: () => api.get("/enrollments").then((res) => res.data),
  get: (id) => api.get(`/enrollments/${id}`).then((res) => res.data),
  byStudent: (studentId) =>
    api.get(`/enrollments/student/${studentId}`).then((res) => res.data),
  create: (payload) =>
    api.post("/enrollments", payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/enrollments/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/enrollments/${id}`).then((res) => res.data),
};
