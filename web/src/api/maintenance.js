import client from "./client";

/** @param params - optional { vehicleId, status: 'open' | 'closed' } */
export const listMaintenanceLogs = (params) =>
  client.get("/maintenance", { params }).then((res) => res.data);

export const getMaintenanceLog = (id) =>
  client.get(`/maintenance/${id}`).then((res) => res.data);

export const createMaintenanceLog = (payload) =>
  client.post("/maintenance", payload).then((res) => res.data);

export const updateMaintenanceLog = (id, payload) =>
  client.put(`/maintenance/${id}`, payload).then((res) => res.data);

export const deleteMaintenanceLog = (id) =>
  client.delete(`/maintenance/${id}`).then((res) => res.data);
