/**
 * Code Quality Types
 *
 * Type definitions for code quality analysis and metrics.
 */

import type { QualityGrade, ThresholdLevel } from './constants'

// ============================================================
// Metric Types
// ============================================================

/**
 * Base metric result
 */
export interface MetricResult {
  /** Metric name */
  name: string
  /** Measured value */
  value: number
  /** Threshold level achieved */
  level: ThresholdLevel
  /** Human-readable message */
  message: string
  /** Suggestions for improvement (empty array if none) */
  suggestions: string[]
}

/**
 * Complexity metrics for a single function/method
 */
export interface FunctionMetrics {
  /** Function name */
  name: string
  /** File path */
  filePath: string
  /** Line number where function starts */
  startLine: number
  /** Line number where function ends */
  endLine: number
  /** Total lines of code */
  lineCount: number
  /** Cyclomatic complexity */
  cyclomaticComplexity: number
  /** Cognitive complexity */
  cognitiveComplexity: number
  /** Maximum nesting depth */
  maxDepth: number
  /** Number of parameters */
  parameterCount: number
  /** Number of return statements */
  returnCount: number
  /** Has JSDoc/TSDoc */
  hasDocumentation: boolean
}

/**
 * Complexity metrics for a single file
 */
export interface FileMetrics {
  /** File path (relative to project root) */
  filePath: string
  /** Total lines of code */
  lineCount: number
  /** Lines of actual code (excluding comments/blanks) */
  codeLineCount: number
  /** Number of imports */
  importCount: number
  /** Number of exports */
  exportCount: number
  /** Number of functions/methods */
  functionCount: number
  /** Number of classes */
  classCount: number
  /** Number of interfaces/types */
  typeCount: number
  /** Average function complexity */
  avgComplexity: number
  /** Maximum function complexity */
  maxComplexity: number
  /** Function-level metrics */
  functions: FunctionMetrics[]
  /** Detected issues */
  issues: QualityIssue[]
}

/**
 * Quality issue detected in code
 */
export interface QualityIssue {
  /** Issue severity */
  severity: 'error' | 'warning' | 'info'
  /** Issue category */
  category: QualityCategory
  /** Issue code (e.g., 'SRP-001') */
  code: string
  /** Human-readable message */
  message: string
  /** File path */
  filePath: string
  /** Line number (if applicable) */
  line?: number
  /** Column number (if applicable) */
  column?: number
  /** Suggested fix */
  suggestion?: string
  /** Related SOLID principle */
  solidPrinciple?: SolidPrinciple
}

// ============================================================
// SOLID Principle Types
// ============================================================

/**
 * SOLID principles enum
 */
export type SolidPrinciple = 'SRP' | 'OCP' | 'LSP' | 'ISP' | 'DIP'

/**
 * SOLID principle analysis result
 */
export interface SolidAnalysis {
  /** Principle being analyzed */
  principle: SolidPrinciple
  /** Principle name */
  name: string
  /** Analysis score (0-100) */
  score: number
  /** Is the principle being followed? */
  passed: boolean
  /** Detected violations */
  violations: SolidViolation[]
  /** Recommendations */
  recommendations: string[]
}

/**
 * SOLID principle violation
 */
export interface SolidViolation {
  /** Violation description */
  description: string
  /** File path */
  filePath: string
  /** Line number (if applicable) */
  line?: number
  /** Impact level */
  impact: 'low' | 'medium' | 'high'
  /** How to fix */
  fix: string
}

// ============================================================
// Quality Report Types
// ============================================================

/**
 * Quality categories
 */
export type QualityCategory =
  | 'complexity'
  | 'maintainability'
  | 'readability'
  | 'testability'
  | 'documentation'
  | 'duplication'
  | 'type-safety'
  | 'solid'

/**
 * Project-wide quality summary
 */
export interface QualitySummary {
  /** Overall quality score (0-100) */
  overallScore: number
  /** Quality grade */
  grade: QualityGrade
  /** Score breakdown by category */
  categoryScores: Record<QualityCategory, number>
  /** Total files analyzed */
  totalFiles: number
  /** Total lines of code */
  totalLines: number
  /** Total functions analyzed */
  totalFunctions: number
  /** Number of issues by severity */
  issueCount: {
    error: number
    warning: number
    info: number
  }
  /** SOLID principle scores */
  solidScores: Record<SolidPrinciple, number>
  /** Files requiring attention */
  hotspots: FileHotspot[]
}

/**
 * File hotspot - files that need improvement
 */
export interface FileHotspot {
  /** File path */
  filePath: string
  /** Hotspot score (higher = worse) */
  score: number
  /** Primary issue */
  primaryIssue: string
  /** Issue count */
  issueCount: number
}

/**
 * Full quality report
 */
export interface QualityReport {
  /** Report generation timestamp */
  timestamp: string
  /** Project name */
  projectName: string
  /** Summary statistics */
  summary: QualitySummary
  /** File-level metrics */
  files: FileMetrics[]
  /** All detected issues */
  issues: QualityIssue[]
  /** SOLID analysis */
  solidAnalysis: SolidAnalysis[]
  /** Trends (compared to previous report) */
  trends?: QualityTrends
}

/**
 * Quality trends over time
 */
export interface QualityTrends {
  /** Score change */
  scoreChange: number
  /** New issues count */
  newIssues: number
  /** Resolved issues count */
  resolvedIssues: number
  /** Complexity trend */
  complexityTrend: 'improving' | 'stable' | 'degrading'
}

// ============================================================
// Analysis Options
// ============================================================

/**
 * Options for quality analysis
 */
export interface AnalysisOptions {
  /** Root directory to analyze */
  rootDir: string
  /** File patterns to include */
  include?: string[]
  /** File patterns to exclude */
  exclude?: string[]
  /** Enable SOLID analysis */
  analyzeSolid?: boolean
  /** Enable duplication detection */
  detectDuplication?: boolean
  /** Threshold configuration overrides */
  thresholds?: Partial<ThresholdConfig>
  /** Output format */
  outputFormat?: 'json' | 'html' | 'markdown'
}

/**
 * Threshold configuration
 */
export interface ThresholdConfig {
  maxCyclomaticComplexity: number
  maxCognitiveComplexity: number
  maxDepth: number
  maxFunctionLines: number
  maxFileLines: number
  maxParameters: number
  maxImports: number
  maxExports: number
}

// ============================================================
// Utility Types
// ============================================================

/**
 * Result of analyzing a single metric
 */
export interface MetricEvaluation {
  /** The metric name */
  metric: string
  /** Current value */
  value: number
  /** Threshold it's compared against */
  threshold: number
  /** Whether it passes the threshold */
  passes: boolean
  /** Threshold level */
  level: ThresholdLevel
}

/**
 * Code smell detection result
 */
export interface CodeSmell {
  /** Smell type */
  type: string
  /** Description */
  description: string
  /** Location */
  location: {
    file: string
    line?: number
    column?: number
  }
  /** Refactoring suggestion */
  refactoring: string
}
