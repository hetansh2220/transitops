/**
 * One tone vocabulary for every status badge in the app.
 *
 * The Supabase palette is neutral plus a single green, so hue carries meaning
 * here and nowhere else. Each resource maps its own enum onto these five tones
 * rather than inventing its own colours.
 */
export const TONE = {
  SUCCESS: "success",
  INFO: "info",
  WARNING: "warning",
  DANGER: "danger",
  NEUTRAL: "neutral",
};

const CLASSES = {
  [TONE.SUCCESS]: "border-success/25 bg-success-muted text-success",
  [TONE.INFO]: "border-info/25 bg-info-muted text-info",
  [TONE.WARNING]: "border-warning/25 bg-warning-muted text-warning",
  [TONE.DANGER]: "border-danger/25 bg-danger-muted text-danger",
  [TONE.NEUTRAL]: "border-border bg-muted text-muted-foreground",
};

export const toneClasses = (tone) => CLASSES[tone] ?? CLASSES[TONE.NEUTRAL];

/** Chart fills, in the order a status breakdown reads. */
export const TONE_HEX = {
  [TONE.SUCCESS]: "var(--success)",
  [TONE.INFO]: "var(--info)",
  [TONE.WARNING]: "var(--warning)",
  [TONE.DANGER]: "var(--danger)",
  [TONE.NEUTRAL]: "var(--muted-foreground)",
};
