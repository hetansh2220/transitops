import client from "./client";

export const listFuelLogs = (params) =>
  client.get("/fuel", { params }).then((res) => res.data);

export const getFuelLog = (id) =>
  client.get(`/fuel/${id}`).then((res) => res.data);

export const createFuelLog = (payload) =>
  client.post("/fuel", payload).then((res) => res.data.fuelLog);

export const updateFuelLog = (id, payload) =>
  client.put(`/fuel/${id}`, payload).then((res) => res.data.fuelLog);

export const deleteFuelLog = (id) =>
  client.delete(`/fuel/${id}`).then((res) => res.data);
