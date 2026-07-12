import client from "./client";

/** @param params - optional { status, type, region, search } */
export const listVehicles = (params) =>
  client.get("/vehicles", { params }).then((res) => res.data.vehicles);

export const getVehicle = (id) =>
  client.get(`/vehicles/${id}`).then((res) => res.data.vehicle);

export const createVehicle = (payload) =>
  client.post("/vehicles", payload).then((res) => res.data.vehicle);

export const updateVehicle = (id, payload) =>
  client.put(`/vehicles/${id}`, payload).then((res) => res.data.vehicle);

/** The API only accepts 'available' or 'retired' here — on_trip/in_shop are set by the system. */
export const updateVehicleStatus = (id, status) =>
  client.put(`/vehicles/${id}/status`, { status }).then((res) => res.data.vehicle);
