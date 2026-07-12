import client from "./client";

/** @param params - optional { status, vehicleId, driverId } */
export const listTrips = (params) =>
  client.get("/trips", { params }).then((res) => res.data.trips);

export const getTrip = (id) => client.get(`/trips/${id}`).then((res) => res.data.trip);

export const createTrip = (payload) =>
  client.post("/trips", payload).then((res) => res.data.trip);

// The lifecycle moves through dedicated endpoints — there is no status field to PUT.
export const dispatchTrip = (id) =>
  client.post(`/trips/${id}/dispatch`).then((res) => res.data);

/** @param payload - { endOdometer, fuelConsumed?, fuelCost?, date? } — fuel auto-creates a log. */
export const completeTrip = (id, payload) =>
  client.post(`/trips/${id}/complete`, payload).then((res) => res.data);

export const cancelTrip = (id) =>
  client.post(`/trips/${id}/cancel`).then((res) => res.data);
