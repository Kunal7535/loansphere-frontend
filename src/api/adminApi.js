import api from "./axios";

export const adminLoginApi = async (payload) => {
  const { data } = await api.post("/admin/login", payload);
  return data;
};

export const adminMeApi = async () => {
  const { data } = await api.get("/admin/me");
  return data;
};

export const getDashboardStatsApi = async () => {
  const { data } = await api.get("/admin/stats");
  return data;
};

export const getLeadsApi = async (params) => {
  const { data } = await api.get("/admin/leads", { params });
  return data;
};

export const getLeadByIdApi = async (id) => {
  const { data } = await api.get(`/admin/leads/${id}`);
  return data;
};

export const updateLeadStatusApi = async (id, payload) => {
  const { data } = await api.put(`/admin/update-status/${id}`, payload);
  return data;
};

export const addLeadNoteApi = async (id, payload) => {
  const { data } = await api.post(`/admin/leads/${id}/notes`, payload);
  return data;
};

export const calculateEligibilityApi = async (payload) => {
  const { data } = await api.post("/admin/eligibility", payload);
  return data;
};

export const calculateEmiApi = async (payload) => {
  const { data } = await api.post("/admin/emi", payload);
  return data;
};
