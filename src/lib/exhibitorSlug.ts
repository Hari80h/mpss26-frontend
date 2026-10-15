import { ExhibitorStats } from '../types';

/**
 * Generates a clean URL slug from a company name.
 * e.g.:
 *  "MPSEDC" -> "mpsedc"
 *  "Truechip Solutions" -> "truechip-solutions"
 *  "TrueSilicon" -> "truesilicon"
 *  "CDAC" -> "cdac"
 */
export function getCompanySlug(companyName: string): string {
  return companyName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Returns the canonical slug for an exhibitor.
 * Defaults to the company slug, falling back to ID if slug is empty.
 */
export function getExhibitorSlug(exhibitor: ExhibitorStats): string {
  const slug = getCompanySlug(exhibitor.company);
  return slug || exhibitor.id;
}

/**
 * Finds an exhibitor from a list using either:
 * 1) Exact ID match (e.g. "exh-1")
 * 2) Company slug match (e.g. "mpsedc", "truechip-solutions")
 * 3) Case-insensitive company name match
 */
export function findExhibitorBySlug(
  exhibitors: ExhibitorStats[],
  slug: string
): ExhibitorStats | undefined {
  if (!slug) return undefined;
  const normalizedSlug = slug.toLowerCase().trim();

  return exhibitors.find((e) => {
    if (e.id.toLowerCase() === normalizedSlug) return true;
    if (getCompanySlug(e.company) === normalizedSlug) return true;
    if (e.company.toLowerCase().trim() === normalizedSlug) return true;
    return false;
  });
}
