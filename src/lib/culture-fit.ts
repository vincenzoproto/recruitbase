/**
 * Culture Fit Score Calculation
 * Compares company values between recruiter and candidate
 */

export const AVAILABLE_VALUES = [
  "Collaborazione",
  "Innovazione",
  "Autonomia",
  "Velocità",
  "Precisione",
  "Trasparenza",
  "Crescita",
  "Flessibilità",
  "Qualità",
  "Impatto",
  "Creatività",
  "Efficienza",
  "Diversità",
  "Sostenibilità",
  "Leadership",
] as const;

export type CultureValue = typeof AVAILABLE_VALUES[number];

/**
 * Calculate Culture Fit Score between two sets of values
 * @param values1 - First set of values (e.g., recruiter's)
 * @param values2 - Second set of values (e.g., candidate's)
 * @returns Score from 0 to 100
 */
export function calculateCultureFit(
  values1: string[] | null | undefined,
  values2: string[] | null | undefined
): number {
  if (!values1 || !values2 || values1.length === 0 || values2.length === 0) {
    return 0;
  }

  const set1 = new Set(values1.map(v => v.toLowerCase()));
  const set2 = new Set(values2.map(v => v.toLowerCase()));
  
  const matchingValues = [...set1].filter(v => set2.has(v)).length;
  const totalValues = Math.max(set1.size, set2.size);
  
  return Math.round((matchingValues / totalValues) * 100);
}

/**
 * Get culture fit level and color based on score
 */
export function getCultureFitLevel(score: number): {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
} {
  if (score >= 75) {
    return {
      label: "Alta affinità culturale",
      color: "hsl(var(--success))",
      bgColor: "bg-success/10",
      textColor: "text-success",
    };
  }
  
  if (score >= 50) {
    return {
      label: "Media affinità culturale",
      color: "hsl(var(--warning))",
      bgColor: "bg-warning/10",
      textColor: "text-warning",
    };
  }
  
  return {
    label: "Bassa affinità culturale",
    color: "hsl(var(--destructive))",
    bgColor: "bg-destructive/10",
    textColor: "text-destructive",
  };
}
