import api from "./api";

export const examService = {
  list: () => api.get("/exams").then((res) => res.data),
  byClass: (classId) =>
    api.get(`/exams/class/${classId}`).then((res) => res.data),
  create: (payload) => api.post("/exams", payload).then((res) => res.data),
  update: (id, payload) =>
    api.put(`/exams/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/exams/${id}`).then((res) => res.data),
};
