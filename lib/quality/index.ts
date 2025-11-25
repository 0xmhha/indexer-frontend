/**
 * Code Quality Module
 *
 * Exports code quality analysis utilities for measuring
 * SOLID principles adherence and Clean Code practices.
 *
 * @example
 * ```typescript
 * import { CodeAnalyzer, COMPLEXITY, QUALITY_GRADES } from '@/lib/quality'
 *
 * // Evaluate complexity
 * const result = CodeAnalyzer.analyzeComplexity(15)
 * console.log(result.level) // 'WARNING'
 *
 * // Get grade from score
 * const grade = CodeAnalyzer.getGradeFromScore(85)
 * console.log(grade) // 'B'
 * ```
 */

// Constants
export {
  COMPLEXITY,
  COGNITIVE_COMPLEXITY,
  NESTING_DEPTH,
  FUNCTION_LINES,
  FILE_LINES,
  COMPONENT_LINES,
  PARAMETERS,
  IMPORTS,
  EXPORTS,
  QUALITY_WEIGHTS,
  QUALITY_GRADES,
  SOLID_PATTERNS,
  FILE_PATTERNS,
  type QualityGrade,
  type ThresholdLevel,
} from './constants'

// Types
export type {
  MetricResult,
  FunctionMetrics,
  FileMetrics,
  QualityIssue,
  QualitySummary,
  QualityReport,
  QualityTrends,
  SolidPrinciple,
  SolidAnalysis,
  SolidViolation,
  QualityCategory,
  AnalysisOptions,
  ThresholdConfig,
  MetricEvaluation,
  CodeSmell,
} from './types'

// Analyzer
export {
  CodeAnalyzer,
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
} from './analyzer'
