import api from "./axios";

export const applyLoanApi = async (payload) => {
  const { data } = await api.post("/loan/apply", payload);
  return data;
};
