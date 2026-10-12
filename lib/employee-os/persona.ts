export type PersonaContext = {
  designation?: string | null;
  role?: string | null;
  department?: string | null;
  permissions?: string[];
};

/**
 * Checks whether the current employee context matches the Healthcare Lead Manager persona.
 * This helper avoids scattering hardcoded string comparisons across components.
 */
export function isHealthcareLeadManager(context?: PersonaContext | null): boolean {
  if (!context) return false;
  const designation = (context.designation || "").trim().toLowerCase();
  const role = (context.role || "").trim().toLowerCase();

  return (
    designation === "healthcare lead manager" ||
    role === "healthcare lead manager"
  );
}
