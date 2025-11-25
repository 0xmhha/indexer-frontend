/**
 * Quality Summary Calculator
 *
 * Calculates overall quality metrics and identifies hotspots.
 */

import {
  COMPLEXITY,
  FILE_LINES,
  QUALITY_WEIGHTS,
  SRP_THRESHOLDS,
  DEFAULT_SCORES,
  HOTSPOT_THRESHOLDS,
  WEIGHT_DIVISOR,
  SCORE_THRESHOLDS,
} from './constants'
import type { FileMetrics, QualitySummary, QualityCategory, SolidPrinciple } from './types'
import { evaluateMetric, getScoreFromLevel, getGradeFromScore } from './analyzer'
import { analyzeSRP, analyzeDIP } from './solid-analyzer'

// ============================================================
// Category Score Calculation
// ============================================================

function calculateCategoryScores(files: FileMetrics[]): Record<QualityCategory, number> {
  // Calculate average complexity score
  const avgComplexity =
    files.length > 0 ? files.reduce((sum, f) => sum + f.avgComplexity, 0) / files.length : 0
  const complexityLevel = evaluateMetric(avgComplexity, COMPLEXITY)
  const complexityScore = getScoreFromLevel(complexityLevel)

  // Calculate maintainability based on file sizes
  const avgFileSize =
    files.length > 0 ? files.reduce((sum, f) => sum + f.lineCount, 0) / files.length : 0
  const maintainabilityLevel = evaluateMetric(avgFileSize, FILE_LINES)
  const maintainabilityScore = getScoreFromLevel(maintainabilityLevel)

  return {
    complexity: complexityScore,
    maintainability: maintainabilityScore,
    readability: DEFAULT_SCORES.READABILITY,
    testability: DEFAULT_SCORES.TESTABILITY,
    documentation: DEFAULT_SCORES.DOCUMENTATION,
    duplication: DEFAULT_SCORES.DUPLICATION,
    'type-safety': DEFAULT_SCORES.TYPE_SAFETY,
    solid: DEFAULT_SCORES.SOLID,
  }
}

// ============================================================
// SOLID Score Calculation
// ============================================================

function calculateSolidScores(files: FileMetrics[]): Record<SolidPrinciple, number> {
  if (files.length === 0) {
    return {
      SRP: SCORE_THRESHOLDS.PERFECT,
      OCP: SCORE_THRESHOLDS.PERFECT,
      LSP: SCORE_THRESHOLDS.PERFECT,
      ISP: SCORE_THRESHOLDS.PERFECT,
      DIP: SCORE_THRESHOLDS.PERFECT,
    }
  }

  const srpScores = files.map((f) => analyzeSRP(f).score)
  const dipScores = files.map((f) => analyzeDIP(f).score)

  return {
    SRP: srpScores.reduce((a, b) => a + b, 0) / srpScores.length,
    OCP: DEFAULT_SCORES.OCP,
    LSP: DEFAULT_SCORES.LSP,
    ISP: DEFAULT_SCORES.ISP,
    DIP: dipScores.reduce((a, b) => a + b, 0) / dipScores.length,
  }
}

// ============================================================
// Overall Score Calculation
// ============================================================

function calculateOverallScore(categoryScores: Record<QualityCategory, number>): number {
  const weightedSum =
    categoryScores.complexity * (QUALITY_WEIGHTS.COMPLEXITY / WEIGHT_DIVISOR) +
    categoryScores.maintainability * (QUALITY_WEIGHTS.MAINTAINABILITY / WEIGHT_DIVISOR) +
    categoryScores.testability * (QUALITY_WEIGHTS.TEST_COVERAGE / WEIGHT_DIVISOR) +
    categoryScores.documentation * (QUALITY_WEIGHTS.DOCUMENTATION / WEIGHT_DIVISOR) +
    categoryScores.duplication * (QUALITY_WEIGHTS.DUPLICATION / WEIGHT_DIVISOR) +
    categoryScores['type-safety'] * (QUALITY_WEIGHTS.TYPE_SAFETY / WEIGHT_DIVISOR)

  return Math.round(weightedSum)
}

// ============================================================
// Hotspot Detection
// ============================================================

function calculateHotspotScore(file: FileMetrics): number {
  let score = 0

  // High complexity
  if (file.maxComplexity > COMPLEXITY.GOOD) {
    score += (file.maxComplexity - COMPLEXITY.GOOD) * HOTSPOT_THRESHOLDS.COMPLEXITY_MULTIPLIER
  }

  // Large file
  if (file.lineCount > FILE_LINES.GOOD) {
    score += (file.lineCount - FILE_LINES.GOOD) / HOTSPOT_THRESHOLDS.FILE_SIZE_DIVISOR
  }

  // Many functions
  if (file.functionCount > SRP_THRESHOLDS.MAX_FUNCTIONS) {
    score +=
      (file.functionCount - SRP_THRESHOLDS.MAX_FUNCTIONS) * HOTSPOT_THRESHOLDS.FUNCTION_MULTIPLIER
  }

  // Many issues
  score +=
    file.issues.filter((i) => i.severity === 'error').length * HOTSPOT_THRESHOLDS.ERROR_MULTIPLIER
  score +=
    file.issues.filter((i) => i.severity === 'warning').length *
    HOTSPOT_THRESHOLDS.WARNING_MULTIPLIER

  return Math.min(score, HOTSPOT_THRESHOLDS.MAX_SCORE)
}

function getPrimaryIssue(file: FileMetrics): string {
  if (file.maxComplexity > COMPLEXITY.WARNING) {
    return 'High cyclomatic complexity'
  }
  if (file.lineCount > FILE_LINES.WARNING) {
    return 'File too large'
  }
  if (file.functionCount > SRP_THRESHOLDS.HIGH_FUNCTIONS) {
    return 'Too many functions'
  }
  if (file.issues.length > 0) {
    const errorIssue = file.issues.find((i) => i.severity === 'error')
    if (errorIssue) {
      return errorIssue.message
    }
    return file.issues[0]?.message ?? 'Unknown issue'
  }
  return 'General improvements needed'
}

function identifyHotspots(files: FileMetrics[]): QualitySummary['hotspots'] {
  return files
    .map((file) => ({
      filePath: file.filePath,
      score: calculateHotspotScore(file),
      primaryIssue: getPrimaryIssue(file),
      issueCount: file.issues.length,
    }))
    .filter((h) => h.score > HOTSPOT_THRESHOLDS.MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, HOTSPOT_THRESHOLDS.MAX_COUNT)
}

// ============================================================
// Main Summary Function
// ============================================================

/**
 * Calculate overall quality summary from file metrics
 */
export function calculateQualitySummary(files: FileMetrics[]): QualitySummary {
  const totalFiles = files.length
  const totalLines = files.reduce((sum, f) => sum + f.lineCount, 0)
  const totalFunctions = files.reduce((sum, f) => sum + f.functionCount, 0)

  // Count issues by severity
  const allIssues = files.flatMap((f) => f.issues)
  const issueCount = {
    error: allIssues.filter((i) => i.severity === 'error').length,
    warning: allIssues.filter((i) => i.severity === 'warning').length,
    info: allIssues.filter((i) => i.severity === 'info').length,
  }

  // Calculate category scores
  const categoryScores = calculateCategoryScores(files)

  // Calculate SOLID scores
  const solidScores = calculateSolidScores(files)

  // Calculate overall score
  const overallScore = calculateOverallScore(categoryScores)
  const grade = getGradeFromScore(overallScore)

  // Identify hotspots
  const hotspots = identifyHotspots(files)

  return {
    overallScore,
    grade,
    categoryScores,
    totalFiles,
    totalLines,
    totalFunctions,
    issueCount,
    solidScores,
    hotspots,
  }
}
