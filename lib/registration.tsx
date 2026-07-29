/** Registration scheduling — shared between the admin panel and the public
    site so both compute the exact same open/closed status.

    Design note: rather than relying on a server cron job to flip a stored
    boolean at the right moment (which needs paid infrastructure and is
    never perfectly on-time), the "open" / "closed" status is *computed*
    live, every time it's read — by the admin panel when it loads, and by
    the public site when a visitor loads the page. This is simpler, free on
    any hosting tier, and just as accurate: the status is always correct as
    of the moment someone actually looks at it, which is the only moment it
    matters. */

/** Timor-Leste has no daylight saving time, so this fixed offset is safe
    year-round. Change this if the institute is ever based elsewhere. */
const INSTITUTE_UTC_OFFSET = "+09:00";

/** Converts a `datetime-local` input value ("YYYY-MM-DDTHH:mm", assumed to
    mean that wall-clock time in the institute's own timezone) into a
    absolute UTC ISO string for storage. Returns "" for an empty input. */
export function localInputToIso(localValue: string): string {
  if (!localValue) return "";
  const withSeconds = localValue.length === 16 ? `${localValue}:00` : localValue;
  const d = new Date(`${withSeconds}${INSTITUTE_UTC_OFFSET}`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

/** Converts a stored UTC ISO string back into the institute's local
    wall-clock time, formatted for a `datetime-local` input. Uses UTC
    getters on a manually-shifted timestamp so the result never depends on
    the admin's own browser timezone. */
export function isoToLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const shifted = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-` +
    `${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`
  );
}

/** Formats a stored UTC ISO string as a friendly institute-local date/time
    for display (e.g. on the public site's status badge). */
export function formatInstituteTime(iso: string): string {
  if (!iso) return "";
  const local = isoToLocalInput(iso);
  if (!local) return "";
  const [datePart, timePart] = local.split("T");
  const [year, month, day] = datePart.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${day} ${months[Number(month) - 1]} ${year}, ${timePart}`;
}

export type RegistrationOverride = "" | "open" | "closed";

/** The single source of truth for whether registration is open for a
    program, given its schedule and any manual override. Manual override
    always wins; otherwise the schedule decides; with neither set, defaults
    to closed (nothing has ever opened it). */
export function isRegistrationOpen(
  startIso: string,
  endIso: string,
  override: string,
): boolean {
  if (override === "open") return true;
  if (override === "closed") return false;

  if (!startIso) return false;
  const now = Date.now();
  const start = Date.parse(startIso);
  if (Number.isNaN(start) || now < start) return false;

  if (endIso) {
    const end = Date.parse(endIso);
    if (!Number.isNaN(end) && now >= end) return false;
  }

  return true;
}
