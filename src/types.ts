/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PartType {
  MACHINED = 'MACHINED',
  COTS = 'COTS', // Commercial Off-The-Shelf (Purchased)
}

export enum Material {
  AL6061 = 'AL6061',
  STS440C = 'STS440C',
  NONE = 'NONE',
}

export interface Part {
  id: string;
  name: string;
  nominal: number; // mm
  upperTolerance: number; // mm (positive)
  lowerTolerance: number; // mm (negative, e.g., -0.05)
  type: PartType;
  material: Material;
}

export enum EnvironmentCondition {
  STANDARD = 'STANDARD', // 20°C
  HIGH_TEMP = 'HIGH_TEMP', // 71°C
  LOW_TEMP = 'LOW_TEMP', // -40°C
}

export interface AnalysisResult {
  nominalGap: number;
  worstCaseMin: number;
  worstCaseMax: number;
  isCompliant: boolean;
  parts: PartContribution[];
  environment: EnvironmentCondition;
}

export interface PartContribution {
  partId: string;
  partName: string;
  sensitivity: number; // percentage
  isCritical: boolean;
  isMachined: boolean;
  currentUpper: number;
  currentLower: number;
}

export interface AISuggestion {
  partName: string;
  currentUpper: number;
  currentLower: number;
  suggestedUpper: number;
  suggestedLower: number;
  reason: string;
}

export interface AIResponse {
  analysisMarkdown: string;
  suggestions: AISuggestion[];
}
