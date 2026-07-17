/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Part, Material, EnvironmentCondition, AnalysisResult, PartContribution } from '../types';

// Coefficients of Linear Thermal Expansion (CLTE) in 10^-6 / °C
const CLTE: Record<Material, number> = {
  [Material.AL6061]: 23.6e-6,
  [Material.STS440C]: 10.2e-6,
  [Material.NONE]: 0,
};

const REF_TEMP = 20; // Standard reference temperature in Celsius
const ENV_TEMPS: Record<EnvironmentCondition, number> = {
  [EnvironmentCondition.STANDARD]: 20,
  [EnvironmentCondition.HIGH_TEMP]: 71,
  [EnvironmentCondition.LOW_TEMP]: -40,
};

export function calculateWorstCase(
  parts: Part[],
  targetMin: number,
  targetMax: number,
  env: EnvironmentCondition
): AnalysisResult {
  const temp = ENV_TEMPS[env];
  const deltaT = temp - REF_TEMP;

  let totalNominal = 0;
  let totalUpper = 0;
  let totalLower = 0;

  const adjustedParts = parts.map(p => {
    const clte = CLTE[p.material] || 0;
    const thermalExpansion = p.nominal * clte * deltaT;
    const adjNominal = p.nominal + thermalExpansion;
    
    // Total stackup calculation (Linear sum for Worst-case)
    totalNominal += adjNominal;
    totalUpper += p.upperTolerance;
    totalLower += p.lowerTolerance;

    return { ...p, adjNominal };
  });

  // In a typical gap analysis, Gap = (Sum of Outer Features) - (Sum of Inner Features)
  // But for this simplified 1D tool, we'll assume the parts provided sum up to the gap.
  // User enters values that contribute to the gap (positive or negative nominals).
  
  const minGap = totalNominal + totalLower;
  const maxGap = totalNominal + totalUpper;

  const isCompliant = minGap >= targetMin && maxGap <= targetMax;

  // Calculate sensitivity
  const totalRange = totalUpper - totalLower;
  const contributions: PartContribution[] = parts.map(p => {
    const range = p.upperTolerance - p.lowerTolerance;
    const sensitivity = totalRange > 0 ? (range / totalRange) * 100 : 0;
    return {
      partId: p.id,
      partName: p.name,
      sensitivity,
      isCritical: sensitivity > 30, // Highlight parts contributing > 30%
      isMachined: p.type === 'MACHINED',
      currentUpper: p.upperTolerance,
      currentLower: p.lowerTolerance
    };
  });

  return {
    nominalGap: totalNominal,
    worstCaseMin: minGap,
    worstCaseMax: maxGap,
    isCompliant,
    parts: contributions.sort((a, b) => b.sensitivity - a.sensitivity),
    environment: env
  };
}
