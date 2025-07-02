import { addDays, format, parseISO, isValid } from "date-fns";

/**
 * Format an ISO or raw date string into 'yyyy-MM-dd' format
 * Useful for input fields, sorting, etc.
 * @param {string} date
 * @returns {string | null}
 */
export function newDate(date) {
  if (!date) return null;
  try {
    const parsed = parseISO(date);
    return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : null;
  } catch (err) {
    console.warn("Invalid date:", date);
    return null;
  }
}
