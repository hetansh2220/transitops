import client from "./client";

export const listExpenses = (params) =>
  client.get("/expenses", { params }).then((res) => res.data);

export const getExpense = (id) =>
  client.get(`/expenses/${id}`).then((res) => res.data);

export const createExpense = (payload) =>
  client.post("/expenses", payload).then((res) => res.data.expense);

export const updateExpense = (id, payload) =>
  client.put(`/expenses/${id}`, payload).then((res) => res.data.expense);

export const deleteExpense = (id) =>
  client.delete(`/expenses/${id}`).then((res) => res.data);
