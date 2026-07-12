import client from "./client";

/** @param params - optional { type, region } */
export const getVehicleReport = (params) =>
  client.get("/reports/vehicles", { params }).then((res) => res.data);

export const getSummaryReport = (params) =>
  client.get("/reports/summary", { params }).then((res) => res.data.summary);

/**
 * The CSV endpoint needs the bearer token, so it can't be a plain <a href>.
 * Fetch it as a blob through the same client and hand it to the browser.
 */
export const downloadVehicleReportCsv = async (params) => {
  const response = await client.get("/reports/vehicles", {
    params: { ...params, format: "csv" },
    responseType: "blob",
  });

  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "transitops-vehicle-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
