import client from "./client";

/** @param params - optional { type, status, region } */
export const getDashboard = (params) =>
  client.get("/dashboard", { params }).then((res) => res.data);
