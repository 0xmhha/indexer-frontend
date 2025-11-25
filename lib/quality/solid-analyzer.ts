/**
 * SOLID Principles Analyzer
 *
 * Analyzes code for SOLID principles adherence.
 */

import {
  FILE_LINES,
  SRP_THRESHOLDS,
  DIP_THRESHOLDS,
  DEFAULT_SCORES,
  SCORE_THRESHOLDS,
} from './constants'
import type { FileMetrics, SolidAnalysis } from './types'
import { evaluateMetric } from './analyzer'

// ============================================================
// SRP Helper Functions
// ============================================================

/**
 * Check function count for SRP violation
 */
function checkFunctionCount(
  metrics: FileMetrics,
  violations: SolidAnalysis['violations']
): number {
  if (metrics.functionCount <= SRP_THRESHOLDS.MAX_FUNCTIONS) {
    return 0
  }

  const excess = metrics.functionCount - SRP_THRESHOLDS.MAX_FUNCTIONS
  const deduction = Math.min(
    excess * SRP_THRESHOLDS.FUNCTION_DEDUCTION_MULTIPLIER,
    SRP_THRESHOLDS.FUNCTION_DEDUCTION_MAX
  )
  violations.push({
    description: `File has ${metrics.functionCount} functions (recommended: ≤${SRP_THRESHOLDS.MAX_FUNCTIONS})`,
    filePath: metrics.filePath,
    impact: metrics.functionCount > SRP_THRESHOLDS.HIGH_FUNCTIONS ? 'high' : 'medium',
    fix: 'Split related functions into separate modules',
  })
  return deduction
}

/**
 * Check export count for SRP violation
 */
function checkExportCount(
  metrics: FileMetrics,
  violations: SolidAnalysis['violations']
): number {
  if (metrics.exportCount <= SRP_THRESHOLDS.MAX_FUNCTIONS) {
    return 0
  }

  const excess = metrics.exportCount - SRP_THRESHOLDS.MAX_FUNCTIONS
  const deduction = Math.min(
    excess * SRP_THRESHOLDS.EXPORT_DEDUCTION_MULTIPLIER,
    SRP_THRESHOLDS.EXPORT_DEDUCTION_MAX
  )
  violations.push({
    description: `File exports ${metrics.exportCount} items (recommended: ≤${SRP_THRESHOLDS.MAX_FUNCTIONS})`,
    filePath: metrics.filePath,
    impact: metrics.exportCount > SRP_THRESHOLDS.HIGH_FUNCTIONS ? 'high' : 'medium',
    fix: 'Group related exports into separate modules',
  })
  return deduction
}

/**
 * Check file size for SRP violation
 */
function checkFileSizeForSRP(
  metrics: FileMetrics,
  violations: SolidAnalysis['violations']
): number {
  const sizeLevel = evaluateMetric(metrics.lineCount, FILE_LINES)
  if (sizeLevel !== 'WARNING' && sizeLevel !== 'CRITICAL') {
    return 0
  }

  const deduction =
    sizeLevel === 'CRITICAL'
      ? SRP_THRESHOLDS.CRITICAL_SIZE_DEDUCTION
      : SRP_THRESHOLDS.WARNING_SIZE_DEDUCTION
  violations.push({
    description: `File has ${metrics.lineCount} lines (recommended: ≤${FILE_LINES.GOOD})`,
    filePath: metrics.filePath,
    impact: sizeLevel === 'CRITICAL' ? 'high' : 'medium',
    fix: 'Split into multiple focused files',
  })
  return deduction
}

/**
 * Build SRP recommendations based on violations
 */
function buildSRPRecommendations(hasViolations: boolean): string[] {
  if (!hasViolations) {
    return []
  }
  return [
    'Each module should have a single, well-defined responsibility',
    'Ask: "What is this module responsible for?" - if answer is complex, split it',
  ]
}

// ============================================================
// SOLID Analysis Functions
// ============================================================

/**
 * Analyze Single Responsibility Principle adherence
 */
export function analyzeSRP(metrics: FileMetrics): SolidAnalysis {
  const violations: SolidAnalysis['violations'] = []
  let score = SCORE_THRESHOLDS.PERFECT

  score -= checkFunctionCount(metrics, violations)
  score -= checkExportCount(metrics, violations)
  score -= checkFileSizeForSRP(metrics, violations)

  return {
    principle: 'SRP',
    name: 'Single Responsibility Principle',
    score: Math.max(score, 0),
    passed: score >= SCORE_THRESHOLDS.PASSING,
    violations,
    recommendations: buildSRPRecommendations(violations.length > 0),
  }
}

/**
 * Analyze Open/Closed Principle adherence
 */
export function analyzeOCP(_metrics: FileMetrics): SolidAnalysis {
  // OCP analysis would require AST parsing for proper analysis
  // This is a simplified version based on patterns
  const recommendations: string[] = [
    'Use interfaces and abstract classes for extensibility',
    'Prefer composition over inheritance',
    'Use dependency injection for flexibility',
  ]

  return {
    principle: 'OCP',
    name: 'Open/Closed Principle',
    score: DEFAULT_SCORES.OCP,
    passed: true,
    violations: [],
    recommendations,
  }
}

/**
 * Analyze Dependency Inversion Principle adherence
 */
export function analyzeDIP(metrics: FileMetrics): SolidAnalysis {
  const violations: SolidAnalysis['violations'] = []
  const recommendations: string[] = []
  let score = SCORE_THRESHOLDS.PERFECT

  // High import count might indicate tight coupling
  if (metrics.importCount > DIP_THRESHOLDS.HIGH_IMPORTS) {
    const excess = metrics.importCount - DIP_THRESHOLDS.HIGH_IMPORTS
    const deduction = Math.min(
      excess * DIP_THRESHOLDS.DEDUCTION_MULTIPLIER,
      DIP_THRESHOLDS.DEDUCTION_MAX
    )
    score -= deduction
    violations.push({
      description: `High import count (${metrics.importCount}) may indicate tight coupling`,
      filePath: metrics.filePath,
      impact: metrics.importCount > DIP_THRESHOLDS.VERY_HIGH_IMPORTS ? 'high' : 'medium',
      fix: 'Consider using dependency injection or facades',
    })
  }

  recommendations.push('Depend on abstractions (interfaces), not concrete implementations')
  recommendations.push('Use dependency injection for external dependencies')
  recommendations.push('High-level modules should not depend on low-level modules')

  return {
    principle: 'DIP',
    name: 'Dependency Inversion Principle',
    score: Math.max(score, 0),
    passed: score >= SCORE_THRESHOLDS.PASSING,
    violations,
    recommendations,
  }
}
