import api from "./api";

export const gradeService = {
  list: () => api.get("/grades").then((res) => res.data),
  byEnrollment: (enrollmentId) =>
    api.get(`/grades/enrollment/${enrollmentId}`).then((res) => res.data),
  create: (payload) => api.post("/grades", payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/grades/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/grades/${id}`).then((res) => res.data),
};
