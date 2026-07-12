/**
 * One place for every number the UI prints.
 *
 * Two people built these pages and they diverged — dollars on one screen, bare
 * numbers on another. The fleet is Indian (GJ-series plates, lakh-scale
 * acquisition costs), so money is rupees, everywhere.
 */

const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DECIMAL = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const EMPTY = "—";

const isBlank = (value) =>
  value === null || value === undefined || value === "" || Number.isNaN(Number(value));

/** ₹8,420 */
export const currency = (value) =>
  isBlank(value) ? EMPTY : CURRENCY.format(Number(value));

/** 8,420.5 */
export const number = (value) =>
  isBlank(value) ? EMPTY : DECIMAL.format(Number(value));

/** 42.5 L */
export const litres = (value) => (isBlank(value) ? EMPTY : `${number(value)} L`);

/** 74,000 km */
export const km = (value) => (isBlank(value) ? EMPTY : `${number(value)} km`);

/** 500 kg */
export const kg = (value) => (isBlank(value) ? EMPTY : `${number(value)} kg`);

/** 8.4 km/L */
export const efficiency = (value) =>
  isBlank(value) ? EMPTY : `${number(value)} km/L`;

/** 81% — takes a whole percent (81), not a fraction. */
export const percent = (value) => (isBlank(value) ? EMPTY : `${number(value)}%`);

/** 14.2% — takes a ratio (0.142), as the ROI endpoint returns. */
export const ratio = (value) =>
  isBlank(value) ? EMPTY : `${(Number(value) * 100).toFixed(1)}%`;
