/**
 * Code Quality Analyzer
 *
 * Analyzes code for complexity, SOLID principles adherence,
 * and Clean Code practices.
 */

import {
  COMPLEXITY,
  NESTING_DEPTH,
  FUNCTION_LINES,
  FILE_LINES,
  PARAMETERS,
  IMPORTS,
  EXPORTS,
  QUALITY_GRADES,
  type ThresholdLevel,
  type QualityGrade,
} from './constants'
import type { MetricResult } from './types'

// Re-export from split modules
export { analyzeSRP, analyzeOCP, analyzeDIP } from './solid-analyzer'
export { calculateQualitySummary } from './quality-summary'
export { createIssue, detectFunctionIssues, type CreateIssueOptions } from './issue-detector'

// ============================================================
// Threshold Evaluation
// ============================================================

/**
 * Evaluate a metric against thresholds
 */
export function evaluateMetric(
  value: number,
  thresholds: { EXCELLENT: number; GOOD: number; WARNING: number; CRITICAL: number },
  lowerIsBetter = true
): ThresholdLevel {
  if (lowerIsBetter) {
    if (value <= thresholds.EXCELLENT) {
      return 'EXCELLENT'
    }
    if (value <= thresholds.GOOD) {
      return 'GOOD'
    }
    if (value <= thresholds.WARNING) {
      return 'WARNING'
    }
    return 'CRITICAL'
  }

  // Higher is better (e.g., test coverage)
  if (value >= thresholds.EXCELLENT) {
    return 'EXCELLENT'
  }
  if (value >= thresholds.GOOD) {
    return 'GOOD'
  }
  if (value >= thresholds.WARNING) {
    return 'WARNING'
  }
  return 'CRITICAL'
}

/**
 * Get score from threshold level
 */
export function getScoreFromLevel(level: ThresholdLevel): number {
  const scores: Record<ThresholdLevel, number> = {
    EXCELLENT: 100,
    GOOD: 80,
    WARNING: 60,
    CRITICAL: 40,
  }
  return scores[level]
}

/**
 * Get quality grade from score
 */
export function getGradeFromScore(score: number): QualityGrade {
  if (score >= QUALITY_GRADES.A.min) {
    return 'A'
  }
  if (score >= QUALITY_GRADES.B.min) {
    return 'B'
  }
  if (score >= QUALITY_GRADES.C.min) {
    return 'C'
  }
  if (score >= QUALITY_GRADES.D.min) {
    return 'D'
  }
  return 'F'
}

// ============================================================
// Metric Analyzers
// ============================================================

/**
 * Analyze cyclomatic complexity
 */
export function analyzeComplexity(complexity: number): MetricResult {
  const level = evaluateMetric(complexity, COMPLEXITY)
  const suggestions: string[] = []

  if (level === 'WARNING' || level === 'CRITICAL') {
    suggestions.push('Extract complex conditions into well-named boolean variables')
    suggestions.push('Split into smaller, focused functions')
    suggestions.push('Use early returns to reduce nesting')
    suggestions.push('Consider using Strategy pattern for multiple branches')
  }

  return {
    name: 'Cyclomatic Complexity',
    value: complexity,
    level,
    message: getComplexityMessage(complexity, level),
    suggestions,
  }
}

function getComplexityMessage(value: number, level: ThresholdLevel): string {
  const messages: Record<ThresholdLevel, string> = {
    EXCELLENT: `Excellent! Complexity of ${value} is simple and easy to test.`,
    GOOD: `Good. Complexity of ${value} is acceptable.`,
    WARNING: `Warning: Complexity of ${value} is high. Consider refactoring.`,
    CRITICAL: `Critical: Complexity of ${value} is too high. Must refactor.`,
  }
  return messages[level]
}

/**
 * Analyze nesting depth
 */
export function analyzeNestingDepth(depth: number): MetricResult {
  const level = evaluateMetric(depth, NESTING_DEPTH)
  const suggestions: string[] = []

  if (level === 'WARNING' || level === 'CRITICAL') {
    suggestions.push('Use early returns to flatten nested conditions')
    suggestions.push('Extract nested logic into separate functions')
    suggestions.push('Consider using guard clauses')
    suggestions.push('Replace nested conditionals with polymorphism')
  }

  return {
    name: 'Nesting Depth',
    value: depth,
    level,
    message: `Nesting depth of ${depth} is ${level.toLowerCase()}.`,
    suggestions,
  }
}

/**
 * Analyze function size
 */
export function analyzeFunctionSize(lines: number): MetricResult {
  const level = evaluateMetric(lines, FUNCTION_LINES)
  const suggestions: string[] = []

  if (level === 'WARNING' || level === 'CRITICAL') {
    suggestions.push('Extract logical sections into helper functions')
    suggestions.push('Apply Single Responsibility Principle')
    suggestions.push('Group related operations and extract them')
  }

  return {
    name: 'Function Size',
    value: lines,
    level,
    message: `Function has ${lines} lines (${level.toLowerCase()}).`,
    suggestions,
  }
}

/**
 * Analyze file size
 */
export function analyzeFileSize(lines: number): MetricResult {
  const level = evaluateMetric(lines, FILE_LINES)
  const suggestions: string[] = []

  if (level === 'WARNING' || level === 'CRITICAL') {
    suggestions.push('Split file into multiple focused modules')
    suggestions.push('Extract related functionality into separate files')
    suggestions.push('Consider using barrel exports (index.ts)')
  }

  return {
    name: 'File Size',
    value: lines,
    level,
    message: `File has ${lines} lines (${level.toLowerCase()}).`,
    suggestions,
  }
}

/**
 * Analyze parameter count
 */
export function analyzeParameters(count: number): MetricResult {
  const level = evaluateMetric(count, PARAMETERS)
  const suggestions: string[] = []

  if (level === 'WARNING' || level === 'CRITICAL') {
    suggestions.push('Group related parameters into an options object')
    suggestions.push('Use TypeScript interface for parameter object')
    suggestions.push('Consider using builder pattern for complex configurations')
  }

  return {
    name: 'Parameter Count',
    value: count,
    level,
    message: `Function has ${count} parameters (${level.toLowerCase()}).`,
    suggestions,
  }
}

/**
 * Analyze imports count
 */
export function analyzeImports(count: number): MetricResult {
  const level = evaluateMetric(count, IMPORTS)
  const suggestions: string[] = []

  if (level === 'WARNING' || level === 'CRITICAL') {
    suggestions.push('Review if all imports are necessary')
    suggestions.push('Consider splitting the file if it depends on too many modules')
    suggestions.push('Check for circular dependencies')
  }

  return {
    name: 'Import Count',
    value: count,
    level,
    message: `File has ${count} imports (${level.toLowerCase()}).`,
    suggestions,
  }
}

/**
 * Analyze exports count
 */
export function analyzeExports(count: number): MetricResult {
  const level = evaluateMetric(count, EXPORTS)
  const suggestions: string[] = []

  if (level === 'WARNING' || level === 'CRITICAL') {
    suggestions.push('The file may be doing too much')
    suggestions.push('Consider splitting into multiple focused modules')
    suggestions.push('Apply Interface Segregation Principle')
  }

  return {
    name: 'Export Count',
    value: count,
    level,
    message: `File has ${count} exports (${level.toLowerCase()}).`,
    suggestions,
  }
}

// ============================================================
// Export
// ============================================================

// Import for CodeAnalyzer export
import { analyzeSRP, analyzeOCP, analyzeDIP } from './solid-analyzer'
import { calculateQualitySummary } from './quality-summary'
import { createIssue, detectFunctionIssues } from './issue-detector'

export const CodeAnalyzer = {
  evaluateMetric,
  getScoreFromLevel,
  getGradeFromScore,
  analyzeComplexity,
  analyzeNestingDepth,
  analyzeFunctionSize,
  analyzeFileSize,
  analyzeParameters,
  analyzeImports,
  analyzeExports,
  analyzeSRP,
  analyzeOCP,
  analyzeDIP,
  calculateQualitySummary,
  createIssue,
  detectFunctionIssues,
}
