/**
 * Issue Detector
 *
 * Detects and creates quality issues from code metrics.
 */

import { COMPLEXITY, NESTING_DEPTH, FUNCTION_LINES, PARAMETERS } from './constants'
import type {
  FunctionMetrics,
  QualityIssue,
  QualityCategory,
  SolidPrinciple,
} from './types'

// ============================================================
// Types
// ============================================================

/**
 * Options for creating a quality issue
 */
export interface CreateIssueOptions {
  severity: QualityIssue['severity']
  category: QualityCategory
  code: string
  message: string
  filePath: string
  line?: number
  column?: number
  suggestion?: string
  solidPrinciple?: SolidPrinciple
}

// ============================================================
// Issue Creation
// ============================================================

/**
 * Create a quality issue from options
 */
export function createIssue(options: CreateIssueOptions): QualityIssue {
  const { severity, category, code, message, filePath, line, column, suggestion, solidPrinciple } =
    options

  const issue: QualityIssue = {
    severity,
    category,
    code,
    message,
    filePath,
  }

  // Only add optional properties if they have values
  if (line !== undefined) issue.line = line
  if (column !== undefined) issue.column = column
  if (suggestion !== undefined) issue.suggestion = suggestion
  if (solidPrinciple !== undefined) issue.solidPrinciple = solidPrinciple

  return issue
}

// ============================================================
// Issue Detection Helpers
// ============================================================

/**
 * Detect complexity issues
 */
function detectComplexityIssue(metrics: FunctionMetrics): QualityIssue | null {
  if (metrics.cyclomaticComplexity <= COMPLEXITY.WARNING) {
    return null
  }

  return createIssue({
    severity: metrics.cyclomaticComplexity > COMPLEXITY.CRITICAL ? 'error' : 'warning',
    category: 'complexity',
    code: 'COMPLEXITY-001',
    message: `Function '${metrics.name}' has cyclomatic complexity of ${metrics.cyclomaticComplexity}`,
    filePath: metrics.filePath,
    line: metrics.startLine,
    suggestion: 'Split into smaller functions or simplify control flow',
    solidPrinciple: 'SRP',
  })
}

/**
 * Detect function size issues
 */
function detectSizeIssue(metrics: FunctionMetrics): QualityIssue | null {
  if (metrics.lineCount <= FUNCTION_LINES.WARNING) {
    return null
  }

  return createIssue({
    severity: metrics.lineCount > FUNCTION_LINES.CRITICAL ? 'error' : 'warning',
    category: 'maintainability',
    code: 'SIZE-001',
    message: `Function '${metrics.name}' has ${metrics.lineCount} lines`,
    filePath: metrics.filePath,
    line: metrics.startLine,
    suggestion: 'Extract logic into helper functions',
    solidPrinciple: 'SRP',
  })
}

/**
 * Detect nesting depth issues
 */
function detectDepthIssue(metrics: FunctionMetrics): QualityIssue | null {
  if (metrics.maxDepth <= NESTING_DEPTH.WARNING) {
    return null
  }

  return createIssue({
    severity: metrics.maxDepth > NESTING_DEPTH.CRITICAL ? 'error' : 'warning',
    category: 'readability',
    code: 'DEPTH-001',
    message: `Function '${metrics.name}' has nesting depth of ${metrics.maxDepth}`,
    filePath: metrics.filePath,
    line: metrics.startLine,
    suggestion: 'Use early returns or extract nested logic',
  })
}

/**
 * Detect parameter count issues
 */
function detectParameterIssue(metrics: FunctionMetrics): QualityIssue | null {
  if (metrics.parameterCount <= PARAMETERS.WARNING) {
    return null
  }

  return createIssue({
    severity: metrics.parameterCount > PARAMETERS.CRITICAL ? 'error' : 'warning',
    category: 'maintainability',
    code: 'PARAMS-001',
    message: `Function '${metrics.name}' has ${metrics.parameterCount} parameters`,
    filePath: metrics.filePath,
    line: metrics.startLine,
    suggestion: 'Use an options object to group related parameters',
  })
}

// ============================================================
// Main Detection Function
// ============================================================

/**
 * Detect issues from function metrics
 */
export function detectFunctionIssues(metrics: FunctionMetrics): QualityIssue[] {
  const detectors = [
    detectComplexityIssue,
    detectSizeIssue,
    detectDepthIssue,
    detectParameterIssue,
  ]

  return detectors.map((detector) => detector(metrics)).filter((issue): issue is QualityIssue => issue !== null)
}
