import client from "./client";

// The router is mounted at /api/fuel-logs on the server — the UI route is /fuel,
// but the endpoint is not.
const BASE = "/fuel-logs";

/** @param params - optional { vehicleId, tripId } */
export const listFuelLogs = (params) =>
  client.get(BASE, { params }).then((res) => res.data);

export const getFuelLog = (id) => client.get(`${BASE}/${id}`).then((res) => res.data);

export const createFuelLog = (payload) =>
  client.post(BASE, payload).then((res) => res.data.fuelLog);

export const updateFuelLog = (id, payload) =>
  client.put(`${BASE}/${id}`, payload).then((res) => res.data.fuelLog);

export const deleteFuelLog = (id) =>
  client.delete(`${BASE}/${id}`).then((res) => res.data);
