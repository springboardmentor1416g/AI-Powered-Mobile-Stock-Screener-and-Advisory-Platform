import api from "./api";

export const getCompanyDetails = async (ticker) => {
  return api.get(`/company/${ticker}`);
};
