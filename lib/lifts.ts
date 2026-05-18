/**
 * Lift math. Epley e1RM:
 *   e1RM = weight × (1 + reps / 30)
 * Same formula as the Hybrid Athlete reference app.
 */

export function e1rm(weight: number, reps: number): number {
  if (!weight || !reps || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

export function formatLb(n: number | undefined): string {
  if (n === undefined || isNaN(n)) return "—";
  if (Math.abs(n - Math.round(n)) < 0.05) return String(Math.round(n));
  return n.toFixed(1);
}
