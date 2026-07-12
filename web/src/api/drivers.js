import client from "./client";

export const listDrivers = () => client.get("/drivers").then((res) => res.data);

export const getDriver = (id) => client.get(`/drivers/${id}`).then((res) => res.data);

export const createDriver = (payload) =>
  client.post("/drivers", payload).then((res) => res.data);

export const updateDriver = (id, payload) =>
  client.put(`/drivers/${id}`, payload).then((res) => res.data);

export const deleteDriver = (id) =>
  client.delete(`/drivers/${id}`).then((res) => res.data);
