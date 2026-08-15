import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Assets
export const getAssets = (params) => api.get("/assets", { params }).then((r) => r.data);
export const getAssetsSummary = () => api.get("/assets/summary").then((r) => r.data);
export const getAsset = (id) => api.get(`/assets/${id}`).then((r) => r.data);
export const getAssetCurrentCustody = (id) => api.get(`/assets/${id}/custody/current`).then((r) => r.data);
export const getAssetHistory = (id) => api.get(`/assets/${id}/history`).then((r) => r.data);
export const createAsset = (data) => api.post("/assets", data).then((r) => r.data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data).then((r) => r.data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`).then((r) => r.data);

// Custody
export const getCustody = (params) => api.get("/custody", { params }).then((r) => r.data);
export const getCustodyByDepartment = () => api.get("/custody/by-department").then((r) => r.data);
export const checkoutAsset = (data) => api.post("/custody/checkout", data).then((r) => r.data);
export const checkinAsset = (id, data) => api.post(`/custody/${id}/checkin`, data).then((r) => r.data);

// Directory
export const getDepartments = () => api.get("/departments").then((r) => r.data);
export const createDepartment = (data) => api.post("/departments", data).then((r) => r.data);
export const getEmployees = (params) => api.get("/employees", { params }).then((r) => r.data);
export const createEmployee = (data) => api.post("/employees", data).then((r) => r.data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`).then((r) => r.data);
export const getCategories = () => api.get("/categories").then((r) => r.data);
export const createCategory = (data) => api.post("/categories", data).then((r) => r.data);

export default api;
