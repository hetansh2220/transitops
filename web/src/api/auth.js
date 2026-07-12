import client from "./client";

export const login = (credentials) =>
  client.post("/auth/login", credentials).then((res) => res.data);

export const register = (payload) =>
  client.post("/auth/register", payload).then((res) => res.data);

export const logout = () => client.post("/auth/logout").then((res) => res.data);

export const me = () => client.get("/auth/me").then((res) => res.data);
